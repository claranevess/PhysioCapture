from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Patient, MedicalRecord, MedicalRecordHistory, PatientTransferHistory, TransferRequest
from .serializers import (
    PatientSerializer, PatientListSerializer,
    MedicalRecordSerializer, MedicalRecordListSerializer,
    MedicalRecordCreateUpdateSerializer, MedicalRecordHistorySerializer,
    PatientTransferSerializer, PatientTransferHistorySerializer,
    TransferRequestSerializer, TransferRequestCreateSerializer
)
import json


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar pacientes
    Endpoints:
    - GET /api/prontuario/patients/ - Lista todos os pacientes
    - POST /api/prontuario/patients/ - Cria um novo paciente
    - GET /api/prontuario/patients/{id}/ - Detalhes de um paciente
    - PUT/PATCH /api/prontuario/patients/{id}/ - Atualiza um paciente
    - DELETE /api/prontuario/patients/{id}/ - Remove um paciente
    - GET /api/prontuario/patients/{id}/medical_records/ - Prontuários do paciente
    - POST /api/prontuario/patients/{id}/transfer/ - Transfere paciente para outro fisioterapeuta
    - GET /api/prontuario/patients/available_for_transfer/ - Pacientes disponíveis para transferência
    - GET /api/prontuario/patients/{id}/transfer_history/ - Histórico de transferências
    """
    queryset = Patient.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'cpf', 'email', 'phone']
    ordering_fields = ['full_name', 'created_at', 'birth_date']
    ordering = ['full_name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        return PatientSerializer
    
    def _get_current_user(self):
        """Helper para obter o usuário atual"""
        if self.request.user.is_authenticated:
            return self.request.user
        
        user_id = self.request.headers.get('X-User-Id')
        if user_id:
            from authentication.models import User
            try:
                return User.objects.get(id=int(user_id), is_active_user=True)
            except (User.DoesNotExist, ValueError):
                pass
        
        # Fallback: primeiro usuário ativo
        from authentication.models import User
        return User.objects.filter(is_active_user=True).order_by('id').first()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self._get_current_user()
        
        if not user or not hasattr(user, 'clinica') or not user.clinica:
            return queryset.none()
        
        # Base: filtrar por clínica
        queryset = queryset.filter(clinica=user.clinica)
        
        # Filtrar por tipo de usuário
        if user.is_gestor_geral:
            # Gestor Geral: ver todos os pacientes da rede
            pass
        elif user.is_gestor_filial:
            # Gestor Filial: ver apenas pacientes da sua filial
            queryset = queryset.filter(filial=user.filial)
        elif user.is_fisioterapeuta:
            # Fisioterapeuta: ver apenas seus pacientes
            queryset = queryset.filter(fisioterapeuta=user)
        elif user.is_atendente:
            # Atendente: ver pacientes da sua filial
            queryset = queryset.filter(filial=user.filial)
        
        # Filtrar por filial (query param)
        filial_id = self.request.query_params.get('filial', None)
        if filial_id:
            queryset = queryset.filter(filial_id=filial_id)
        
        # Filtrar por status ativo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        user = self._get_current_user()
        if user and user.is_fisioterapeuta:
            serializer.save(
                fisioterapeuta=user,
                clinica=user.clinica,
                filial=user.filial
            )
        elif user and user.is_gestor:
            serializer.save(clinica=user.clinica)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'])
    def medical_records(self, request, pk=None):
        """Retorna todos os prontuários de um paciente específico"""
        patient = self.get_object()
        records = patient.medical_records.all()
        serializer = MedicalRecordListSerializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Busca avançada de pacientes"""
        query = request.query_params.get('q', '')
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(full_name__icontains=query) |
                Q(cpf__icontains=query) |
                Q(email__icontains=query) |
                Q(phone__icontains=query)
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PatientListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PatientListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """
        Transfere um paciente para outro fisioterapeuta
        POST /api/prontuario/patients/{id}/transfer/
        
        Body:
        {
            "to_fisioterapeuta_id": 5,
            "reason": "Paciente mudou de cidade"
        }
        """
        patient = self.get_object()
        user = self._get_current_user()
        
        if not user:
            return Response(
                {'error': 'Usuário não identificado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar permissão de transferência
        if not user.can_transfer_patient(patient):
            return Response(
                {'error': 'Você não tem permissão para transferir este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar dados
        serializer = PatientTransferSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        to_fisio_id = serializer.validated_data['to_fisioterapeuta_id']
        reason = serializer.validated_data.get('reason', '')
        
        # Buscar fisioterapeuta destino
        from authentication.models import User as AuthUser
        try:
            to_fisioterapeuta = AuthUser.objects.get(
                id=to_fisio_id, 
                user_type='FISIOTERAPEUTA',
                is_active_user=True
            )
        except AuthUser.DoesNotExist:
            return Response(
                {'error': 'Fisioterapeuta de destino não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar se é da mesma clínica
        if to_fisioterapeuta.clinica_id != patient.clinica_id:
            return Response(
                {'error': 'Fisioterapeuta de destino deve ser da mesma rede'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Para fisioterapeuta, só pode transferir intra-filial
        if user.is_fisioterapeuta and to_fisioterapeuta.filial_id != user.filial_id:
            return Response(
                {'error': 'Fisioterapeutas só podem transferir pacientes dentro da mesma filial'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Executar transferência
        patient.transfer_to(
            new_fisioterapeuta=to_fisioterapeuta,
            reason=reason,
            transferred_by=user
        )
        
        return Response({
            'message': 'Paciente transferido com sucesso!',
            'patient': PatientListSerializer(patient).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def available_for_transfer(self, request):
        """
        Lista pacientes disponíveis para transferência
        GET /api/prontuario/patients/available_for_transfer/
        """
        queryset = self.get_queryset().filter(
            available_for_transfer=True,
            is_active=True
        )
        serializer = PatientListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transfer_history(self, request, pk=None):
        """
        Retorna o histórico de transferências de um paciente
        GET /api/prontuario/patients/{id}/transfer_history/
        """
        patient = self.get_object()
        history = patient.transfer_history.all()
        serializer = PatientTransferHistorySerializer(history, many=True)
        return Response(serializer.data)




class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar prontuários médicos
    Endpoints:
    - GET /api/prontuario/medical-records/ - Lista todos os prontuários
    - POST /api/prontuario/medical-records/ - Cria um novo prontuário
    - GET /api/prontuario/medical-records/{id}/ - Detalhes de um prontuário
    - PUT/PATCH /api/prontuario/medical-records/{id}/ - Atualiza um prontuário
    - DELETE /api/prontuario/medical-records/{id}/ - Remove um prontuário
    - GET /api/prontuario/medical-records/{id}/history/ - Histórico de alterações
    """
    queryset = MedicalRecord.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'patient__full_name', 'diagnosis', 'chief_complaint']
    ordering_fields = ['record_date', 'created_at', 'patient__full_name']
    ordering = ['-record_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MedicalRecordListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MedicalRecordCreateUpdateSerializer
        return MedicalRecordSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por paciente
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrar por tipo de registro
        record_type = self.request.query_params.get('record_type', None)
        if record_type:
            queryset = queryset.filter(record_type=record_type)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Cria um novo prontuário e registra no histórico
        """
        # Temporário: verificar se há usuário autenticado
        if self.request.user.is_authenticated:
            record = serializer.save(created_by=self.request.user)
            
            # Criar registro no histórico
            MedicalRecordHistory.objects.create(
                medical_record=record,
                action='CREATE',
                user=self.request.user,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        else:
            record = serializer.save()
    
    def perform_update(self, serializer):
        """
        Atualiza um prontuário e registra as alterações no histórico
        """
        if not self.request.user.is_authenticated:
            serializer.save()
            return
            
        # Capturar dados anteriores
        instance = self.get_object()
        previous_data = {
            'title': instance.title,
            'chief_complaint': instance.chief_complaint,
            'history': instance.history,
            'physical_exam': instance.physical_exam,
            'diagnosis': instance.diagnosis,
            'treatment_plan': instance.treatment_plan,
            'observations': instance.observations,
        }
        
        # Atualizar o registro
        record = serializer.save(last_modified_by=self.request.user)
        
        # Identificar campos alterados
        changed_fields = {}
        for field, old_value in previous_data.items():
            new_value = getattr(record, field)
            if old_value != new_value:
                changed_fields[field] = {
                    'old': old_value,
                    'new': new_value
                }
        
        # Criar registro no histórico
        if changed_fields:
            MedicalRecordHistory.objects.create(
                medical_record=record,
                action='UPDATE',
                previous_data=previous_data,
                changed_fields=changed_fields,
                user=self.request.user,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
    
    def perform_destroy(self, instance):
        """
        Remove um prontuário e registra no histórico
        """
        # Criar registro no histórico antes de deletar (se autenticado)
        if self.request.user.is_authenticated:
            MedicalRecordHistory.objects.create(
                medical_record=instance,
                action='DELETE',
                previous_data={
                    'title': instance.title,
                    'patient': instance.patient.full_name,
                },
                user=self.request.user,
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
        instance.delete()
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Retorna o histórico de alterações de um prontuário
        """
        record = self.get_object()
        history = record.history_logs.all()
        serializer = MedicalRecordHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    def get_client_ip(self):
        """
        Obtém o IP do cliente
        """
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_statistics(request):
    """
    Endpoint para retornar estatísticas do dashboard
    GET /api/prontuario/dashboard-stats/
    """
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    last_month_start = today - timedelta(days=60)
    
    # Total de pacientes
    total_patients = Patient.objects.filter(is_active=True).count()
    
    # Pacientes criados esta semana
    patients_this_week = Patient.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Pacientes criados semana passada
    patients_last_week = Patient.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=14),
        created_at__lt=timezone.now() - timedelta(days=7)
    ).count()
    
    # Crescimento semanal
    if patients_last_week > 0:
        weekly_growth = ((patients_this_week - patients_last_week) / patients_last_week) * 100
    else:
        weekly_growth = 100 if patients_this_week > 0 else 0
    
    # Prontuários ativos (criados nos últimos 30 dias)
    active_records = MedicalRecord.objects.filter(
        record_date__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Documentos hoje (prontuários criados hoje)
    documents_today = MedicalRecord.objects.filter(
        created_at__date=today
    ).count()
    
    # Receita mensal estimada (R$ 150 por paciente ativo)
    monthly_revenue = total_patients * 150
    
    # Crescimento mensal
    patients_this_month = Patient.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    patients_last_month = Patient.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=60),
        created_at__lt=timezone.now() - timedelta(days=30)
    ).count()
    
    if patients_last_month > 0:
        monthly_growth = ((patients_this_month - patients_last_month) / patients_last_month) * 100
    else:
        monthly_growth = 100 if patients_this_month > 0 else 0
    
    # Dados semanais (últimos 7 dias)
    weekly_data = []
    days_pt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_name = days_pt[day.weekday()]
        
        patients_count = Patient.objects.filter(created_at__date=day).count()
        records_count = MedicalRecord.objects.filter(record_date__date=day).count()
        consultations = MedicalRecord.objects.filter(
            record_date__date=day,
            record_type='CONSULTA'
        ).count()
        
        weekly_data.append({
            'day': day_name,
            'pacientes': patients_count,
            'consultas': consultations,
            'documentos': records_count
        })
    
    # Tendência mensal (últimos 8 meses)
    monthly_trend = []
    months_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for i in range(7, -1, -1):
        month_date = today - timedelta(days=30 * i)
        month_start = month_date.replace(day=1)
        if month_date.month == 12:
            month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
        
        patients_in_month = Patient.objects.filter(
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        ).count()
        
        monthly_trend.append({
            'month': months_pt[month_date.month - 1],
            'value': patients_in_month
        })
    
    # Distribuição de serviços (por tipo de prontuário)
    service_distribution = []
    record_types = MedicalRecord.objects.values('record_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    total_records = MedicalRecord.objects.count()
    
    if total_records > 0:
        # Mapear tipos para nomes mais amigáveis
        type_mapping = {
            'CONSULTA': 'Consultas',
            'AVALIACAO': 'Avaliações',
            'EVOLUCAO': 'Evoluções',
            'PROCEDIMENTO': 'Procedimentos',
            'EXAME': 'Exames',
            'DIAGNOSTICO': 'Diagnósticos',
            'OUTROS': 'Outros'
        }
        
        colors = ['#009688', '#66BB6A', '#FF8099', '#BA68C8', '#FFC107', '#2196F3', '#FF9800']
        
        for idx, item in enumerate(record_types[:7]):
            percentage = (item['count'] / total_records) * 100
            service_distribution.append({
                'name': type_mapping.get(item['record_type'], item['record_type']),
                'value': round(percentage, 1),
                'color': colors[idx % len(colors)]
            })
    # Se não houver prontuários, serviceDistribution permanece vazio (array [])
    
    return Response({
        'totalPatients': total_patients,
        'activeRecords': active_records,
        'documentsToday': documents_today,
        'monthlyRevenue': monthly_revenue,
        'weeklyGrowth': round(weekly_growth, 1),
        'monthlyGrowth': round(monthly_growth, 1),
        'weeklyData': weekly_data,
        'monthlyTrend': monthly_trend,
        'serviceDistribution': service_distribution
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_statistics_gestor(request):
    """
    Endpoint para dashboard do GESTOR GERAL (Rede Multi-Filial)
    GET /api/prontuario/dashboard-stats/gestor/
    
    Retorna:
    - Métricas globais da rede
    - Estatísticas por filial (filiaisStats)
    - Transferências recentes
    - Fisioterapeutas agrupados por filial
    - Comparativo entre filiais
    """
    from authentication.models import Clinica, Filial, User
    from documentos.models import Document
    from .models import PhysioSession, PatientTransferHistory
    
    # Identificar usuário/clínica
    user = None
    if request.user.is_authenticated:
        user = request.user
    else:
        user_id = request.headers.get('X-User-Id')
        if user_id:
            try:
                user = User.objects.get(id=int(user_id), is_active_user=True)
            except (User.DoesNotExist, ValueError):
                pass
    
    if not user:
        user = User.objects.filter(is_active_user=True).order_by('id').first()
    
    if not user or not user.clinica:
        return Response({'error': 'Clínica não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    clinica = user.clinica
    today = timezone.now().date()
    
    # ==================== MÉTRICAS GLOBAIS DA REDE ====================
    all_patients = Patient.objects.filter(clinica=clinica, is_active=True)
    all_fisios = User.objects.filter(clinica=clinica, user_type='FISIOTERAPEUTA', is_active_user=True)
    all_filiais = Filial.objects.filter(clinica=clinica, ativa=True)
    
    total_patients = all_patients.count()
    total_fisioterapeutas = all_fisios.count()
    total_filiais = all_filiais.count()
    
    # Novos pacientes (últimos 30 dias)
    new_patients_month = all_patients.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Crescimento mensal
    patients_prev_month = all_patients.filter(
        created_at__gte=timezone.now() - timedelta(days=60),
        created_at__lt=timezone.now() - timedelta(days=30)
    ).count()
    
    if patients_prev_month > 0:
        monthly_growth = ((new_patients_month - patients_prev_month) / patients_prev_month) * 100
    else:
        monthly_growth = 100 if new_patients_month > 0 else 0
    
    # ==================== ESTATÍSTICAS POR FILIAL ====================
    filiais_stats = []
    filial_colors = ['#009688', '#2196F3', '#FF9800', '#9C27B0', '#4CAF50', '#F44336']
    
    for idx, filial in enumerate(all_filiais):
        filial_patients = all_patients.filter(filial=filial)
        filial_fisios = all_fisios.filter(filial=filial)
        filial_sessions = PhysioSession.objects.filter(
            clinica=clinica,
            patient__filial=filial,
            scheduled_date__gte=today - timedelta(days=30),
            status='REALIZADA'
        ).count()
        filial_docs = Document.objects.filter(
            patient__filial=filial,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Novos pacientes da filial este mês
        filial_new_patients = filial_patients.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        filiais_stats.append({
            'id': filial.id,
            'nome': filial.nome,
            'cidade': filial.cidade,
            'cor': filial_colors[idx % len(filial_colors)],
            'totalPacientes': filial_patients.count(),
            'novosPacientes': filial_new_patients,
            'fisioterapeutas': filial_fisios.count(),
            'sessoesRealizadas': filial_sessions,
            'documentos': filial_docs,
        })
    
    # ==================== TRANSFERÊNCIAS RECENTES ====================
    transferencias = PatientTransferHistory.objects.filter(
        patient__clinica=clinica
    ).select_related(
        'patient', 'from_fisioterapeuta', 'to_fisioterapeuta', 
        'from_filial', 'to_filial', 'transferred_by'
    ).order_by('-transfer_date')[:10]
    
    transferencias_recentes = []
    for t in transferencias:
        transferencias_recentes.append({
            'id': t.id,
            'paciente': t.patient.full_name,
            'paciente_id': t.patient.id,
            'de_fisio': t.from_fisioterapeuta.get_full_name() if t.from_fisioterapeuta else 'N/A',
            'para_fisio': t.to_fisioterapeuta.get_full_name() if t.to_fisioterapeuta else 'N/A',
            'de_filial': t.from_filial.nome if t.from_filial else 'N/A',
            'para_filial': t.to_filial.nome if t.to_filial else 'N/A',
            'data': t.transfer_date.strftime('%d/%m/%Y %H:%M'),
            'motivo': t.reason or 'Não informado',
            'autorizado_por': t.transferred_by.get_full_name() if t.transferred_by else 'Sistema',
            'inter_filial': t.from_filial_id != t.to_filial_id if t.from_filial and t.to_filial else False
        })
    
    total_transferencias_mes = PatientTransferHistory.objects.filter(
        patient__clinica=clinica,
        transfer_date__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # ==================== FISIOTERAPEUTAS POR FILIAL ====================
    fisioterapeutas_por_filial = []
    for filial in all_filiais:
        fisios_filial = all_fisios.filter(filial=filial)
        fisios_data = []
        for fisio in fisios_filial:
            pacientes_count = all_patients.filter(fisioterapeuta=fisio).count()
            sessoes_count = PhysioSession.objects.filter(
                fisioterapeuta=fisio,
                scheduled_date__gte=today - timedelta(days=30),
                status='REALIZADA'
            ).count()
            fisios_data.append({
                'id': fisio.id,
                'nome': fisio.get_full_name(),
                'especialidade': fisio.especialidade or 'Geral',
                'pacientes': pacientes_count,
                'sessoes': sessoes_count
            })
        
        fisioterapeutas_por_filial.append({
            'filial_id': filial.id,
            'filial_nome': filial.nome,
            'fisioterapeutas': fisios_data
        })
    
    # ==================== COMPARATIVO MENSAL POR FILIAL ====================
    comparativo_filiais = []
    for filial in all_filiais:
        filial_patients = all_patients.filter(filial=filial)
        dados_meses = []
        months_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
            
            count = filial_patients.filter(
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            ).count()
            
            dados_meses.append({
                'mes': months_pt[month_date.month - 1],
                'valor': count
            })
        
        comparativo_filiais.append({
            'filial': filial.nome,
            'dados': dados_meses
        })
    
    # ==================== RANKING TOP FISIOTERAPEUTAS ====================
    ranking_fisios = []
    for fisio in all_fisios:
        pacientes = all_patients.filter(fisioterapeuta=fisio).count()
        sessoes = PhysioSession.objects.filter(
            fisioterapeuta=fisio,
            scheduled_date__gte=today - timedelta(days=30),
            status='REALIZADA'
        ).count()
        score = pacientes * 2 + sessoes  # Pontuação simples
        
        ranking_fisios.append({
            'id': fisio.id,
            'nome': fisio.get_full_name(),
            'filial': fisio.filial.nome if fisio.filial else 'N/A',
            'especialidade': fisio.especialidade or 'Geral',
            'pacientes': pacientes,
            'sessoes': sessoes,
            'score': score
        })
    
    ranking_fisios = sorted(ranking_fisios, key=lambda x: x['score'], reverse=True)[:10]
    
    # ==================== PACIENTES DISPONÍVEIS PARA TRANSFERÊNCIA ====================
    pacientes_disponiveis = all_patients.filter(available_for_transfer=True).count()
    
    return Response({
        # Métricas globais
        'totalPacientes': total_patients,
        'totalFisioterapeutas': total_fisioterapeutas,
        'totalFiliais': total_filiais,
        'novosPacientesMes': new_patients_month,
        'crescimentoMensal': round(monthly_growth, 1),
        'totalTransferenciasMes': total_transferencias_mes,
        'pacientesDisponiveisTransferencia': pacientes_disponiveis,
        
        # Dados por filial
        'filiaisStats': filiais_stats,
        
        # Transferências
        'transferenciasRecentes': transferencias_recentes,
        
        # Fisioterapeutas
        'fisioterapeutasPorFilial': fisioterapeutas_por_filial,
        'rankingFisioterapeutas': ranking_fisios,
        
        # Comparativo
        'comparativoFiliais': comparativo_filiais,
        
        # Info da rede
        'rede': {
            'nome': clinica.nome,
            'totalFiliais': total_filiais
        }
    })



@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_statistics_gestor_filial(request):
    """
    Endpoint para dashboard do GESTOR DE FILIAL
    GET /api/prontuario/dashboard-stats/gestor-filial/
    
    Retorna estatísticas específicas da filial do gestor:
    - Métricas da filial
    - Fisioterapeutas da equipe com métricas
    - Transferências pendentes/recentes DA FILIAL
    - Ranking de performance da equipe
    """
    from authentication.models import Clinica, Filial, User
    from documentos.models import Document
    from .models import PhysioSession, PatientTransferHistory
    
    today = timezone.now().date()
    
    # Obter usuário (gestor de filial)
    user_id = request.query_params.get('user_id') or request.headers.get('X-User-Id')
    if user_id:
        try:
            current_user = User.objects.get(id=int(user_id), is_active_user=True)
        except (User.DoesNotExist, ValueError):
            current_user = None
    else:
        current_user = User.objects.filter(is_active_user=True, user_type='GESTOR_FILIAL').first()
    
    if not current_user or not current_user.clinica or not current_user.filial:
        return Response({'error': 'Gestor de filial não encontrado ou sem filial associada'}, status=400)
    
    clinica = current_user.clinica
    filial = current_user.filial
    
    # ==================== MÉTRICAS DA FILIAL ====================
    filial_patients = Patient.objects.filter(clinica=clinica, filial=filial, is_active=True)
    filial_fisios = User.objects.filter(clinica=clinica, filial=filial, user_type='FISIOTERAPEUTA', is_active_user=True)
    filial_atendentes = User.objects.filter(clinica=clinica, filial=filial, user_type='ATENDENTE', is_active_user=True)
    
    total_pacientes = filial_patients.count()
    total_fisioterapeutas = filial_fisios.count()
    total_atendentes = filial_atendentes.count()
    
    # Novos pacientes (últimos 30 dias)
    novos_pacientes_mes = filial_patients.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Sessões realizadas no mês
    sessoes_mes = PhysioSession.objects.filter(
        fisioterapeuta__filial=filial,
        scheduled_date__gte=today - timedelta(days=30),
        status='REALIZADA'
    ).count()
    
    # Sessões agendadas para hoje
    sessoes_hoje = PhysioSession.objects.filter(
        fisioterapeuta__filial=filial,
        scheduled_date=today
    ).count()
    
    # Documentos da filial
    total_documentos = Document.objects.filter(
        patient__filial=filial
    ).count()
    
    # ==================== FISIOTERAPEUTAS DA EQUIPE ====================
    equipe_fisios = []
    for fisio in filial_fisios:
        pacientes_fisio = filial_patients.filter(fisioterapeuta=fisio).count()
        sessoes_fisio = PhysioSession.objects.filter(
            fisioterapeuta=fisio,
            scheduled_date__gte=today - timedelta(days=30),
            status='REALIZADA'
        ).count()
        
        equipe_fisios.append({
            'id': fisio.id,
            'nome': fisio.get_full_name(),
            'email': fisio.email,
            'phone': fisio.phone,
            'especialidade': fisio.especialidade or 'Geral',
            'crefito': fisio.crefito,
            'pacientes': pacientes_fisio,
            'sessoes_mes': sessoes_fisio
        })
    
    # Ordenar por sessões (maior primeiro)
    equipe_fisios = sorted(equipe_fisios, key=lambda x: x['sessoes_mes'], reverse=True)
    
    # ==================== ATENDENTES DA EQUIPE ====================
    equipe_atendentes = []
    for atendente in filial_atendentes:
        equipe_atendentes.append({
            'id': atendente.id,
            'nome': atendente.get_full_name(),
            'email': atendente.email,
            'phone': atendente.phone
        })
    
    # ==================== TRANSFERÊNCIAS DA FILIAL ====================
    # Regras de visibilidade:
    # 1. Transferências INTERNAS (mesma filial origem e destino): só visível para essa filial
    # 2. Transferências INTER-FILIAIS (filiais diferentes): visível para ambas as filiais
    
    # Transferências internas da filial (from_filial == to_filial == filial atual)
    transferencias_internas = PatientTransferHistory.objects.filter(
        from_filial=filial,
        to_filial=filial,
        transfer_date__gte=timezone.now() - timedelta(days=30)
    )
    
    # Transferências inter-filiais que envolvem esta filial (origem OU destino, mas não ambos)
    transferencias_inter_filiais = PatientTransferHistory.objects.filter(
        Q(from_filial=filial) | Q(to_filial=filial),
        transfer_date__gte=timezone.now() - timedelta(days=30)
    ).exclude(
        from_filial=F('to_filial')  # Excluir transferências internas (já incluídas acima se forem da mesma filial)
    )
    
    # Combinar e ordenar
    from itertools import chain
    transferencias_combinadas = list(chain(transferencias_internas, transferencias_inter_filiais))
    transferencias_combinadas = sorted(transferencias_combinadas, key=lambda x: x.transfer_date, reverse=True)[:10]
    
    transferencias_recentes = []
    for t in transferencias_combinadas:
        is_inter_filial = t.from_filial_id != t.to_filial_id if t.from_filial and t.to_filial else False
        transferencias_recentes.append({
            'id': t.id,
            'paciente': t.patient.full_name,
            'paciente_id': t.patient.id,
            'de_fisio': t.from_fisioterapeuta.get_full_name() if t.from_fisioterapeuta else 'N/A',
            'para_fisio': t.to_fisioterapeuta.get_full_name() if t.to_fisioterapeuta else 'N/A',
            'de_filial': t.from_filial.nome if t.from_filial else 'N/A',
            'para_filial': t.to_filial.nome if t.to_filial else 'N/A',
            'data': t.transfer_date.strftime('%d/%m/%Y %H:%M'),
            'motivo': t.reason or 'Não informado',
            'tipo': 'entrada' if t.to_filial == filial else 'saida',
            'inter_filial': is_inter_filial
        })
    
    # Contagem total: internas + inter-filiais que envolvem esta filial
    total_transferencias_internas = PatientTransferHistory.objects.filter(
        from_filial=filial,
        to_filial=filial,
        transfer_date__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    total_transferencias_inter = PatientTransferHistory.objects.filter(
        Q(from_filial=filial) | Q(to_filial=filial),
        transfer_date__gte=timezone.now() - timedelta(days=30)
    ).exclude(
        from_filial=F('to_filial')
    ).count()
    
    total_transferencias_mes = total_transferencias_internas + total_transferencias_inter
    
    # ==================== TOP PACIENTES (mais sessões) ====================
    top_pacientes = []
    for paciente in filial_patients[:5]:
        sessoes_paciente = PhysioSession.objects.filter(
            patient=paciente,
            scheduled_date__gte=today - timedelta(days=30)
        ).count()
        top_pacientes.append({
            'id': paciente.id,
            'nome': paciente.full_name,
            'fisioterapeuta': paciente.fisioterapeuta.get_full_name() if paciente.fisioterapeuta else 'N/A',
            'sessoes': sessoes_paciente
        })
    
    # ==================== DISTRIBUIÇÃO HORÁRIA ====================
    # Sessões por período do dia
    sessoes_manha = PhysioSession.objects.filter(
        fisioterapeuta__filial=filial,
        scheduled_date__gte=today - timedelta(days=7),
        scheduled_time__lt='12:00:00'
    ).count()
    
    sessoes_tarde = PhysioSession.objects.filter(
        fisioterapeuta__filial=filial,
        scheduled_date__gte=today - timedelta(days=7),
        scheduled_time__gte='12:00:00',
        scheduled_time__lt='18:00:00'
    ).count()
    
    sessoes_noite = PhysioSession.objects.filter(
        fisioterapeuta__filial=filial,
        scheduled_date__gte=today - timedelta(days=7),
        scheduled_time__gte='18:00:00'
    ).count()
    
    return Response({
        # Info da filial
        'filial': {
            'id': filial.id,
            'nome': filial.nome,
            'cidade': filial.cidade
        },
        
        # Métricas da filial
        'totalPacientes': total_pacientes,
        'totalFisioterapeutas': total_fisioterapeutas,
        'totalAtendentes': total_atendentes,
        'novosPacientesMes': novos_pacientes_mes,
        'sessoesMes': sessoes_mes,
        'sessoesHoje': sessoes_hoje,
        'totalDocumentos': total_documentos,
        'totalTransferenciasMes': total_transferencias_mes,
        
        # Equipe
        'equipeFisioterapeutas': equipe_fisios,
        'equipeAtendentes': equipe_atendentes,
        
        # Transferências
        'transferenciasRecentes': transferencias_recentes,
        
        # Pacientes em destaque
        'topPacientes': top_pacientes,
        
        # Distribuição de sessões
        'distribuicaoSessoes': {
            'manha': sessoes_manha,
            'tarde': sessoes_tarde,
            'noite': sessoes_noite
        }
    })



@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_statistics_fisioterapeuta(request):
    """
    Endpoint para retornar estatísticas do dashboard do FISIOTERAPEUTA
    GET /api/prontuario/dashboard-stats/fisioterapeuta/
    
    Retorna métricas apenas dos pacientes do fisioterapeuta logado:
    - Total de pacientes próprios
    - Documentos digitalizados pelo usuário
    - Últimos pacientes atendidos
    - Atividades recentes próprias
    
    🚧 DESENVOLVIMENTO: Autenticação desabilitada temporariamente
    """
    # TODO: Reabilitar autenticação em produção
    # if not request.user.is_authenticated:
    #     return Response({'error': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
    # if not request.user.is_fisioterapeuta:
    #     return Response({'error': 'Acesso negado. Apenas fisioterapeutas.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Identificar usuário: prioridade para sessão, depois header X-User-Id
    from authentication.models import User
    user = None
    
    if request.user.is_authenticated:
        user = request.user
    else:
        # Tentar pegar do header X-User-Id
        user_id = request.headers.get('X-User-Id')
        if user_id:
            try:
                user = User.objects.get(id=int(user_id), is_active_user=True)
            except (User.DoesNotExist, ValueError):
                pass
    
    # Fallback para desenvolvimento: primeiro fisioterapeuta ativo
    if not user or user.user_type != 'FISIOTERAPEUTA':
        user = User.objects.filter(
            user_type='FISIOTERAPEUTA',
            is_active_user=True
        ).order_by('id').first()
        
        if not user:
            return Response(
                {'error': 'Nenhum fisioterapeuta encontrado no sistema'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    today = timezone.now().date()
    
    # Filtrar apenas pacientes do fisioterapeuta logado
    my_patients = Patient.objects.filter(fisioterapeuta=user, is_active=True)
    
    # Total de pacientes próprios
    total_patients = my_patients.count()
    
    # Pacientes criados esta semana
    patients_this_week = my_patients.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Pacientes semana passada
    patients_last_week = my_patients.filter(
        created_at__gte=timezone.now() - timedelta(days=14),
        created_at__lt=timezone.now() - timedelta(days=7)
    ).count()
    
    # Crescimento semanal
    if patients_last_week > 0:
        weekly_growth = ((patients_this_week - patients_last_week) / patients_last_week) * 100
    else:
        weekly_growth = 100 if patients_this_week > 0 else 0
    
    # Documentos do fisioterapeuta
    from documentos.models import Document
    my_documents = Document.objects.filter(patient__fisioterapeuta=user)
    
    # Documentos digitalizados hoje
    documents_today = my_documents.filter(created_at__date=today).count()
    
    # Prontuários/consultas desta semana
    consultas_this_week = MedicalRecord.objects.filter(
        patient__fisioterapeuta=user,
        record_date__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Prontuários ativos (últimos 30 dias)
    active_records = MedicalRecord.objects.filter(
        patient__fisioterapeuta=user,
        record_date__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Últimos pacientes atendidos (últimos 5)
    recent_patients = my_patients.order_by('-last_visit', '-updated_at')[:5]
    recent_patients_data = []
    
    for patient in recent_patients:
        recent_patients_data.append({
            'id': patient.id,
            'full_name': patient.full_name,
            'age': patient.age,
            'phone': patient.phone,
            'is_active': patient.is_active,
            'last_visit': patient.last_visit.isoformat() if patient.last_visit else None
        })
    
    # Dados semanais (últimos 7 dias) - apenas do fisioterapeuta
    weekly_data = []
    days_pt = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    
    # Calcular início da semana (segunda-feira)
    week_start = today - timedelta(days=today.weekday())
    
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_name = days_pt[i]
        
        # Pacientes criados neste dia
        patients_count = my_patients.filter(created_at__date=day).count()
        
        # Documentos reais criados neste dia (apenas dos meus pacientes)
        docs_count = my_documents.filter(created_at__date=day).count()
        
        # Sessões/consultas realizadas neste dia
        sessions_count = 0
        try:
            sessions_count = PhysioSession.objects.filter(
                fisioterapeuta=user,
                scheduled_date=day,
                status='REALIZADA'
            ).count()
        except:
            pass
        
        weekly_data.append({
            'day': day_name,
            'pacientes': patients_count,
            'consultas': sessions_count,
            'documentos': docs_count
        })
    
    # Tendência mensal (últimos 8 meses) - apenas do fisioterapeuta
    monthly_trend = []
    months_pt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for i in range(7, -1, -1):
        month_date = today - timedelta(days=30 * i)
        month_start = month_date.replace(day=1)
        if month_date.month == 12:
            month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
        
        patients_in_month = my_patients.filter(
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        ).count()
        
        monthly_trend.append({
            'month': months_pt[month_date.month - 1],
            'value': patients_in_month
        })
    
    # Distribuição de serviços (por tipo de prontuário) - apenas do fisioterapeuta
    service_distribution = []
    record_types = MedicalRecord.objects.filter(patient__fisioterapeuta=user).values('record_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    total_records = MedicalRecord.objects.filter(patient__fisioterapeuta=user).count()
    
    if total_records > 0:
        type_mapping = {
            'CONSULTA': 'Consultas',
            'AVALIACAO': 'Avaliações',
            'EVOLUCAO': 'Evoluções',
            'PROCEDIMENTO': 'Procedimentos',
            'EXAME': 'Exames',
            'DIAGNOSTICO': 'Diagnósticos',
            'OUTROS': 'Outros'
        }
        
        colors = ['#009688', '#66BB6A', '#FF8099', '#BA68C8', '#FFC107', '#2196F3', '#FF9800']
        
        for idx, item in enumerate(record_types[:7]):
            percentage = (item['count'] / total_records) * 100
            service_distribution.append({
                'name': type_mapping.get(item['record_type'], item['record_type']),
                'value': round(percentage, 1),
                'color': colors[idx % len(colors)]
            })
    # Se não houver prontuários, serviceDistribution permanece vazio (array [])
    
    # Próximas consultas do dia
    upcoming_sessions = []
    try:
        today_sessions = PhysioSession.objects.filter(
            fisioterapeuta=user,
            scheduled_date=today,
            status__in=['AGENDADA', 'CONFIRMADA']
        ).order_by('scheduled_time')[:5]
        
        for session in today_sessions:
            upcoming_sessions.append({
                'id': session.id,
                'patient_name': session.patient.full_name if session.patient else 'Paciente',
                'scheduled_time': session.scheduled_time.strftime('%H:%M') if session.scheduled_time else None,
                'duration_minutes': session.duration_minutes,
                'status': session.status,
                'status_display': session.get_status_display() if hasattr(session, 'get_status_display') else session.status
            })
    except Exception:
        pass
    
    return Response({
        'totalPatients': total_patients,
        'documentsToday': documents_today,
        'consultasThisWeek': consultas_this_week,
        'activeRecords': active_records,
        'weeklyGrowth': round(weekly_growth, 1),
        'recentPatients': recent_patients_data,
        'weeklyData': weekly_data,
        'monthlyTrend': monthly_trend,
        'serviceDistribution': service_distribution,
        'upcomingSessions': upcoming_sessions
    })


# ==================== NOVOS VIEWSETS - FASE 2 ====================

from .models import TreatmentPlan, PhysioSession, Discharge
from .serializers_session import (
    TreatmentPlanSerializer, TreatmentPlanListSerializer, TreatmentPlanCreateSerializer,
    PhysioSessionSerializer, PhysioSessionListSerializer, PhysioSessionCreateSerializer,
    DischargeSerializer, DischargeListSerializer
)
from authentication.permissions import (
    IsGestorOrFisioterapeuta, CanAccessClinicalData, 
    CanManageSchedule, IsAuthenticatedOrDevMode
)


class TreatmentPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Planos de Tratamento
    Endpoints:
    - GET /api/prontuario/treatment-plans/ - Lista planos
    - POST /api/prontuario/treatment-plans/ - Cria plano (Fisio/Gestor)
    - GET /api/prontuario/treatment-plans/{id}/ - Detalhes do plano
    - PUT/PATCH /api/prontuario/treatment-plans/{id}/ - Atualiza plano
    - DELETE /api/prontuario/treatment-plans/{id}/ - Remove plano
    """
    queryset = TreatmentPlan.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'patient__full_name', 'objectives']
    ordering_fields = ['created_at', 'start_date', 'patient__full_name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TreatmentPlanListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TreatmentPlanCreateSerializer
        return TreatmentPlanSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Para desenvolvimento: simular primeiro gestor se não autenticado
        if not user.is_authenticated or not hasattr(user, 'clinica'):
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).first()
        
        if user and hasattr(user, 'clinica'):
            queryset = queryset.filter(clinica=user.clinica)
            
            # Fisioterapeuta vê apenas seus planos
            if hasattr(user, 'is_fisioterapeuta') and user.is_fisioterapeuta:
                queryset = queryset.filter(fisioterapeuta=user)
        
        # Filtros opcionais
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        
        if user and hasattr(user, 'clinica'):
            if user.is_fisioterapeuta:
                serializer.save(fisioterapeuta=user, clinica=user.clinica)
            else:
                serializer.save(clinica=user.clinica)
        else:
            serializer.save()


class PhysioSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Sessões de Fisioterapia (Agenda)
    Endpoints:
    - GET /api/prontuario/sessions/ - Lista sessões
    - POST /api/prontuario/sessions/ - Cria sessão (Atendente/Gestor/Fisio)
    - GET /api/prontuario/sessions/{id}/ - Detalhes da sessão
    - PUT/PATCH /api/prontuario/sessions/{id}/ - Atualiza sessão
    - DELETE /api/prontuario/sessions/{id}/ - Remove sessão
    - GET /api/prontuario/sessions/today/ - Sessões de hoje
    - GET /api/prontuario/sessions/my_schedule/ - Minha agenda (fisio)
    - POST /api/prontuario/sessions/{id}/confirm/ - Confirma sessão
    - POST /api/prontuario/sessions/{id}/complete/ - Finaliza sessão
    - POST /api/prontuario/sessions/{id}/cancel/ - Cancela sessão
    """
    queryset = PhysioSession.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__full_name', 'fisioterapeuta__first_name']
    ordering_fields = ['scheduled_date', 'scheduled_time', 'patient__full_name']
    ordering = ['-scheduled_date', '-scheduled_time']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PhysioSessionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PhysioSessionCreateSerializer
        return PhysioSessionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Identificar usuário: prioridade para sessão, depois header X-User-Id
        user = None
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            user_id = self.request.headers.get('X-User-Id')
            if user_id:
                from authentication.models import User
                try:
                    user = User.objects.get(id=int(user_id), is_active_user=True)
                except (User.DoesNotExist, ValueError):
                    pass
        
        # Fallback para gestor
        if not user:
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).first()
        
        if user and hasattr(user, 'clinica') and user.clinica:
            queryset = queryset.filter(clinica=user.clinica)
            
            # Fisioterapeuta vê apenas sua agenda
            if user.user_type == 'FISIOTERAPEUTA':
                queryset = queryset.filter(fisioterapeuta=user)
        
        # Filtros opcionais
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(scheduled_date=date_filter)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        fisio_filter = self.request.query_params.get('fisioterapeuta', None)
        if fisio_filter:
            queryset = queryset.filter(fisioterapeuta_id=fisio_filter)
        
        patient_filter = self.request.query_params.get('patient', None)
        if patient_filter:
            queryset = queryset.filter(patient_id=patient_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Identificar usuário: prioridade para sessão, depois header X-User-Id
        user = None
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            user_id = self.request.headers.get('X-User-Id')
            if user_id:
                from authentication.models import User
                try:
                    user = User.objects.get(id=int(user_id), is_active_user=True)
                except (User.DoesNotExist, ValueError):
                    pass
        
        # Fallback para desenvolvimento
        if not user:
            from authentication.models import User
            user = User.objects.filter(is_active_user=True).order_by('id').first()
        
        # Preencher clinica automaticamente
        if user and hasattr(user, 'clinica') and user.clinica:
            serializer.save(clinica=user.clinica, created_by=user)
        else:
            # Fallback: usar primeira clínica
            from authentication.models import Clinica
            clinica = Clinica.objects.first()
            serializer.save(clinica=clinica, created_by=user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Retorna sessões de hoje"""
        from datetime import date
        queryset = self.get_queryset().filter(scheduled_date=date.today())
        serializer = PhysioSessionListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """Retorna agenda do fisioterapeuta logado"""
        user = request.user if request.user.is_authenticated else None
        
        if not user or not hasattr(user, 'is_fisioterapeuta'):
            from authentication.models import User
            user = User.objects.filter(user_type='FISIOTERAPEUTA', is_active_user=True).first()
        
        if user:
            queryset = PhysioSession.objects.filter(
                fisioterapeuta=user,
                scheduled_date__gte=timezone.now().date()
            ).order_by('scheduled_date', 'scheduled_time')[:20]
            
            serializer = PhysioSessionListSerializer(queryset, many=True)
            return Response(serializer.data)
        
        return Response([])
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirma uma sessão agendada"""
        session = self.get_object()
        if session.status not in ['AGENDADA']:
            return Response(
                {'error': 'Sessão não pode ser confirmada neste status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.status = 'CONFIRMADA'
        session.save()
        return Response({'status': 'Sessão confirmada'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marca sessão como realizada"""
        session = self.get_object()
        if session.status not in ['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO']:
            return Response(
                {'error': 'Sessão não pode ser finalizada neste status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar com dados do request se fornecidos
        session.status = 'REALIZADA'
        session.procedures = request.data.get('procedures', session.procedures)
        session.evolution = request.data.get('evolution', session.evolution)
        session.pain_scale_before = request.data.get('pain_scale_before', session.pain_scale_before)
        session.pain_scale_after = request.data.get('pain_scale_after', session.pain_scale_after)
        session.observations = request.data.get('observations', session.observations)
        session.save()
        
        # Atualizar last_visit do paciente
        session.patient.last_visit = timezone.now()
        session.patient.save()
        
        return Response({'status': 'Sessão finalizada'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela uma sessão"""
        session = self.get_object()
        if session.status in ['REALIZADA', 'CANCELADA']:
            return Response(
                {'error': 'Sessão não pode ser cancelada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.status = 'CANCELADA'
        session.observations = request.data.get('reason', '') + '\n' + session.observations
        session.save()
        return Response({'status': 'Sessão cancelada'})
    
    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        """Marca sessão como falta do paciente"""
        session = self.get_object()
        if session.status in ['REALIZADA', 'CANCELADA', 'FALTA']:
            return Response(
                {'error': 'Status inválido para marcar falta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.status = 'FALTA'
        session.observations = f"Falta registrada\n{session.observations}"
        session.save()
        return Response({'status': 'Falta registrada'})


class DischargeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Altas/Encerramentos
    Endpoints:
    - GET /api/prontuario/discharges/ - Lista altas
    - POST /api/prontuario/discharges/ - Registra alta (apenas Fisio/Gestor)
    - GET /api/prontuario/discharges/{id}/ - Detalhes da alta
    """
    queryset = Discharge.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__full_name', 'reason']
    ordering_fields = ['discharge_date', 'patient__full_name']
    ordering = ['-discharge_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DischargeListSerializer
        return DischargeSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated or not hasattr(user, 'clinica'):
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).first()
        
        if user and hasattr(user, 'clinica'):
            queryset = queryset.filter(clinica=user.clinica)
            
            if hasattr(user, 'is_fisioterapeuta') and user.is_fisioterapeuta:
                queryset = queryset.filter(fisioterapeuta=user)
        
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        
        if user and hasattr(user, 'clinica'):
            if user.is_fisioterapeuta:
                serializer.save(fisioterapeuta=user, clinica=user.clinica)
            else:
                serializer.save(clinica=user.clinica)
        else:
            serializer.save()


# ==========================================
# SOLICITAÇÕES DE TRANSFERÊNCIA
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_transfer_requests(request):
    """
    Lista solicitações de transferência
    - Fisioterapeuta: vê apenas as suas solicitações
    - Gestor de Filial: vê solicitações que envolvem sua filial
    - Gestor Geral: vê todas as solicitações da clínica
    """
    from authentication.models import User
    
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    status_filter = request.query_params.get('status', None)
    
    if not user_id:
        return Response({'error': 'Usuário não identificado'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Base queryset
    queryset = TransferRequest.objects.select_related(
        'patient', 'requested_by', 'from_filial',
        'to_fisioterapeuta', 'to_filial', 'reviewed_by'
    )
    
    # Filtrar por clínica
    if user.clinica:
        queryset = queryset.filter(patient__clinica=user.clinica)
    
    # Filtrar por papel do usuário
    if user.user_type == 'FISIOTERAPEUTA':
        # Fisioterapeuta vê apenas suas próprias solicitações
        queryset = queryset.filter(requested_by=user)
    elif user.user_type == 'GESTOR_FILIAL':
        # Gestor de filial vê solicitações que envolvem sua filial
        if user.filial:
            queryset = queryset.filter(
                Q(from_filial=user.filial) | Q(to_filial=user.filial)
            )
    # GESTOR_GERAL vê todas da clínica (já filtrado acima)
    
    # Filtrar por status
    if status_filter:
        queryset = queryset.filter(status=status_filter.upper())
    
    # Ordenar por data de criação (mais recentes primeiro)
    queryset = queryset.order_by('-created_at')
    
    serializer = TransferRequestSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_transfer_request(request):
    """
    Cria uma solicitação de transferência de paciente
    Apenas Fisioterapeutas podem criar solicitações para seus próprios pacientes
    """
    from authentication.models import User
    
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    
    if not user_id:
        return Response({'error': 'Usuário não identificado'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Apenas fisioterapeutas podem criar solicitações
    if user.user_type != 'FISIOTERAPEUTA':
        return Response(
            {'error': 'Apenas fisioterapeutas podem criar solicitações de transferência'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = TransferRequestCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    patient_id = serializer.validated_data['patient_id']
    to_fisioterapeuta_id = serializer.validated_data['to_fisioterapeuta_id']
    reason = serializer.validated_data['reason']
    
    # Buscar paciente
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Paciente não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar se o paciente pertence ao fisioterapeuta
    if patient.fisioterapeuta != user:
        return Response(
            {'error': 'Você só pode solicitar transferência de seus próprios pacientes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Buscar fisioterapeuta de destino
    try:
        to_fisio = User.objects.get(id=to_fisioterapeuta_id, user_type='FISIOTERAPEUTA')
    except User.DoesNotExist:
        return Response({'error': 'Fisioterapeuta de destino não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Não pode transferir para si mesmo
    if to_fisio == user:
        return Response(
            {'error': 'Não é possível transferir para você mesmo'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar se já existe uma solicitação pendente para este paciente
    existing = TransferRequest.objects.filter(
        patient=patient,
        status='PENDENTE'
    ).exists()
    
    if existing:
        return Response(
            {'error': 'Já existe uma solicitação pendente para este paciente'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Criar a solicitação
    transfer_request = TransferRequest.objects.create(
        patient=patient,
        requested_by=user,
        from_filial=user.filial,
        to_fisioterapeuta=to_fisio,
        to_filial=to_fisio.filial,
        reason=reason
    )
    
    response_serializer = TransferRequestSerializer(transfer_request)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def approve_transfer_request(request, pk):
    """
    Aprova uma solicitação de transferência
    Apenas Gestores podem aprovar
    """
    from authentication.models import User
    
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    
    if not user_id:
        return Response({'error': 'Usuário não identificado'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Apenas gestores podem aprovar
    if user.user_type not in ['GESTOR_FILIAL', 'GESTOR_GERAL']:
        return Response(
            {'error': 'Apenas gestores podem aprovar solicitações'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        transfer_request = TransferRequest.objects.get(id=pk)
    except TransferRequest.DoesNotExist:
        return Response({'error': 'Solicitação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar se já foi processada
    if transfer_request.status != 'PENDENTE':
        return Response(
            {'error': f'Esta solicitação já foi {transfer_request.get_status_display().lower()}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Gestor de filial só pode aprovar solicitações que envolvem sua filial
    if user.user_type == 'GESTOR_FILIAL':
        if user.filial not in [transfer_request.from_filial, transfer_request.to_filial]:
            return Response(
                {'error': 'Você não tem permissão para aprovar esta solicitação'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    note = request.data.get('note', '')
    transfer_request.approve(reviewer=user, note=note)
    
    serializer = TransferRequestSerializer(transfer_request)
    return Response({
        'message': 'Solicitação aprovada com sucesso! Paciente transferido.',
        'data': serializer.data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def reject_transfer_request(request, pk):
    """
    Rejeita uma solicitação de transferência
    Apenas Gestores podem rejeitar
    """
    from authentication.models import User
    
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    
    if not user_id:
        return Response({'error': 'Usuário não identificado'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Apenas gestores podem rejeitar
    if user.user_type not in ['GESTOR_FILIAL', 'GESTOR_GERAL']:
        return Response(
            {'error': 'Apenas gestores podem rejeitar solicitações'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        transfer_request = TransferRequest.objects.get(id=pk)
    except TransferRequest.DoesNotExist:
        return Response({'error': 'Solicitação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar se já foi processada
    if transfer_request.status != 'PENDENTE':
        return Response(
            {'error': f'Esta solicitação já foi {transfer_request.get_status_display().lower()}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Gestor de filial só pode rejeitar solicitações que envolvem sua filial
    if user.user_type == 'GESTOR_FILIAL':
        if user.filial not in [transfer_request.from_filial, transfer_request.to_filial]:
            return Response(
                {'error': 'Você não tem permissão para rejeitar esta solicitação'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    note = request.data.get('note', '')
    if not note:
        return Response(
            {'error': 'É necessário informar o motivo da rejeição'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    transfer_request.reject(reviewer=user, note=note)
    
    serializer = TransferRequestSerializer(transfer_request)
    return Response({
        'message': 'Solicitação rejeitada.',
        'data': serializer.data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_transfer_request(request, pk):
    """
    Cancela uma solicitação de transferência
    Apenas o fisioterapeuta que criou pode cancelar
    """
    from authentication.models import User
    
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    
    if not user_id:
        return Response({'error': 'Usuário não identificado'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        transfer_request = TransferRequest.objects.get(id=pk)
    except TransferRequest.DoesNotExist:
        return Response({'error': 'Solicitação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Apenas o criador pode cancelar
    if transfer_request.requested_by != user:
        return Response(
            {'error': 'Você só pode cancelar suas próprias solicitações'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Verificar se já foi processada
    if transfer_request.status != 'PENDENTE':
        return Response(
            {'error': f'Esta solicitação já foi {transfer_request.get_status_display().lower()}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    transfer_request.cancel()
    
    serializer = TransferRequestSerializer(transfer_request)
    return Response({
        'message': 'Solicitação cancelada.',
        'data': serializer.data
    })
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Patient, MedicalRecord, MedicalRecordHistory
from .serializers import (
    PatientSerializer, PatientListSerializer,
    MedicalRecordSerializer, MedicalRecordListSerializer,
    MedicalRecordCreateUpdateSerializer, MedicalRecordHistorySerializer
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
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # 🚧 DESENVOLVIMENTO: RBAC desabilitado temporariamente
        # TODO: Reabilitar filtros de segurança em produção
        
        # Para desenvolvimento: simular primeiro gestor ativo se não houver usuário autenticado
        if not user.is_authenticated or not hasattr(user, 'clinica'):
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).order_by('id').first()
        
        # RBAC: Filtrar por clínica e papel do usuário
        if user and hasattr(user, 'clinica') and user.clinica:
            # Filtrar pela clínica do usuário (Multi-Tenant)
            queryset = queryset.filter(clinica=user.clinica)
            
            # Se for fisioterapeuta, mostrar apenas seus pacientes
            if hasattr(user, 'is_fisioterapeuta') and user.is_fisioterapeuta:
                queryset = queryset.filter(fisioterapeuta=user)
            # Se for gestor, mostra todos os pacientes da clínica (já filtrado acima)
        
        # Filtrar por status ativo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        # RBAC: Associar automaticamente a clínica e fisioterapeuta
        if self.request.user.is_authenticated:
            # Se for fisioterapeuta, associar automaticamente como responsável
            if self.request.user.is_fisioterapeuta:
                serializer.save(
                    fisioterapeuta=self.request.user,
                    clinica=self.request.user.clinica
                )
            # Se for gestor, precisa especificar o fisioterapeuta
            elif self.request.user.is_gestor:
                # O fisioterapeuta deve ser fornecido no request
                serializer.save(clinica=self.request.user.clinica)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'])
    def medical_records(self, request, pk=None):
        """
        Retorna todos os prontuários de um paciente específico
        """
        patient = self.get_object()
        records = patient.medical_records.all()
        serializer = MedicalRecordListSerializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Busca avançada de pacientes
        """
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
    Endpoint para retornar estatísticas do dashboard do GESTOR
    GET /api/prontuario/dashboard-stats/gestor/
    
    Retorna métricas de toda a clínica:
    - Total de pacientes da clínica (todos os fisioterapeutas)
    - Novos pacientes por período
    - Total de documentos digitalizados
    - Métricas de atividade por fisioterapeuta
    
    🚧 DESENVOLVIMENTO: Autenticação desabilitada temporariamente
    """
    # TODO: Reabilitar autenticação em produção
    # if not request.user.is_authenticated:
    #     return Response({'error': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
    # if not request.user.is_gestor:
    #     return Response({'error': 'Acesso negado. Apenas gestores.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Buscar clínica correta para desenvolvimento (sem autenticação)
    from authentication.models import Clinica, User
    try:
        # Tentar usar usuário autenticado se existir
        if request.user.is_authenticated and hasattr(request.user, 'clinica'):
            clinica = request.user.clinica
        else:
            # Fallback: usar clínica do último usuário logado (por last_login)
            last_user = User.objects.filter(
                is_active_user=True, 
                clinica__isnull=False
            ).order_by('-last_login').first()
            
            if last_user and last_user.clinica:
                clinica = last_user.clinica
            else:
                # Se não houver, usar primeira clínica
                clinica = Clinica.objects.first()
                
            if not clinica:
                return Response(
                    {'error': 'Nenhuma clínica encontrada no sistema'},
                    status=status.HTTP_404_NOT_FOUND
                )
    except Exception as e:
        return Response(
            {'error': f'Erro ao buscar clínica: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    today = timezone.now().date()
    
    # Filtrar todos os pacientes da clínica
    patients_clinica = Patient.objects.filter(clinica=clinica, is_active=True)
    
    # Total de pacientes da clínica
    total_patients = patients_clinica.count()
    
    # Novos pacientes este mês
    new_patients_this_month = patients_clinica.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Pacientes mês passado
    patients_last_month = patients_clinica.filter(
        created_at__gte=timezone.now() - timedelta(days=60),
        created_at__lt=timezone.now() - timedelta(days=30)
    ).count()
    
    # Crescimento mensal de pacientes
    if patients_last_month > 0:
        monthly_growth = ((new_patients_this_month - patients_last_month) / patients_last_month) * 100
    else:
        monthly_growth = 100 if new_patients_this_month > 0 else 0
    
    # Total de documentos (via relacionamento paciente->documento)
    from documentos.models import Document
    total_documents = Document.objects.filter(patient__clinica=clinica).count()
    
    # Documentos digitalizados hoje
    documents_today = Document.objects.filter(
        patient__clinica=clinica,
        created_at__date=today
    ).count()
    
    # Fisioterapeutas ativos da clínica
    from authentication.models import User
    fisioterapeutas_ativos = User.objects.filter(
        clinica=clinica,
        user_type='FISIOTERAPEUTA',
        is_active_user=True
    ).count()
    
    # Prontuários ativos (últimos 30 dias)
    active_records = MedicalRecord.objects.filter(
        patient__clinica=clinica,
        record_date__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Métricas por fisioterapeuta
    fisioterapeutas = User.objects.filter(
        clinica=clinica,
        user_type='FISIOTERAPEUTA',
        is_active_user=True
    )
    
    fisioterapeutas_metrics = []
    for fisio in fisioterapeutas:
        pacientes_count = Patient.objects.filter(fisioterapeuta=fisio, is_active=True).count()
        consultas_count = MedicalRecord.objects.filter(
            patient__fisioterapeuta=fisio,
            record_type='CONSULTA',
            record_date__gte=timezone.now() - timedelta(days=30)
        ).count()
        documentos_count = Document.objects.filter(
            patient__fisioterapeuta=fisio,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        fisioterapeutas_metrics.append({
            'id': fisio.id,
            'name': fisio.get_full_name() or fisio.username,
            'pacientes': pacientes_count,
            'consultas': consultas_count,
            'documentos': documentos_count
        })
    
    # Dados semanais (últimos 7 dias) - da clínica
    weekly_data = []
    days_pt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_name = days_pt[day.weekday()]
        
        patients_count = patients_clinica.filter(created_at__date=day).count()
        records_count = MedicalRecord.objects.filter(
            patient__clinica=clinica,
            record_date__date=day
        ).count()
        consultations = MedicalRecord.objects.filter(
            patient__clinica=clinica,
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
        
        patients_in_month = patients_clinica.filter(
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        ).count()
        
        monthly_trend.append({
            'month': months_pt[month_date.month - 1],
            'value': patients_in_month
        })
    
    # Distribuição de serviços (por tipo de prontuário)
    service_distribution = []
    record_types = MedicalRecord.objects.filter(patient__clinica=clinica).values('record_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    total_records = MedicalRecord.objects.filter(patient__clinica=clinica).count()
    
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
    
    return Response({
        'totalPatients': total_patients,
        'newPatientsThisMonth': new_patients_this_month,
        'totalDocuments': total_documents,
        'documentsToday': documents_today,
        'fisioterapeutasAtivos': fisioterapeutas_ativos,
        'activeRecords': active_records,
        'monthlyGrowth': round(monthly_growth, 1),
        'weeklyData': weekly_data,
        'monthlyTrend': monthly_trend,
        'serviceDistribution': service_distribution,
        'fisioterapeutasMetrics': fisioterapeutas_metrics
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
    
    # Buscar primeiro fisioterapeuta para desenvolvimento (sem autenticação)
    from authentication.models import User
    try:
        # Tentar usar usuário autenticado se existir
        if request.user.is_authenticated and hasattr(request.user, 'clinica'):
            user = request.user
        else:
            # Fallback: usar último fisioterapeuta logado (por last_login)
            user = User.objects.filter(
                user_type='FISIOTERAPEUTA',
                is_active_user=True
            ).order_by('-last_login').first()
            if not user:
                return Response(
                    {'error': 'Nenhum fisioterapeuta encontrado no sistema'},
                    status=status.HTTP_404_NOT_FOUND
                )
    except Exception as e:
        return Response(
            {'error': f'Erro ao buscar usuário: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
    days_pt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_name = days_pt[day.weekday()]
        
        patients_count = my_patients.filter(created_at__date=day).count()
        records_count = MedicalRecord.objects.filter(
            patient__fisioterapeuta=user,
            record_date__date=day
        ).count()
        consultations = MedicalRecord.objects.filter(
            patient__fisioterapeuta=user,
            record_date__date=day,
            record_type='CONSULTA'
        ).count()
        
        weekly_data.append({
            'day': day_name,
            'pacientes': patients_count,
            'consultas': consultations,
            'documentos': records_count
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
    
    return Response({
        'totalPatients': total_patients,
        'documentsToday': documents_today,
        'consultasThisWeek': consultas_this_week,
        'activeRecords': active_records,
        'weeklyGrowth': round(weekly_growth, 1),
        'recentPatients': recent_patients_data,
        'weeklyData': weekly_data,
        'monthlyTrend': monthly_trend,
        'serviceDistribution': service_distribution
    })
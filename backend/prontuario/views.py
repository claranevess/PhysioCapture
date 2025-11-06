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
        
        # Filtrar por status ativo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        # Temporário: verificar se há usuário autenticado
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
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
    else:
        # Dados de exemplo se não houver prontuários
        service_distribution = [
            {'name': 'Consultas', 'value': 35, 'color': '#009688'},
            {'name': 'Avaliações', 'value': 25, 'color': '#66BB6A'},
            {'name': 'Procedimentos', 'value': 20, 'color': '#FF8099'},
            {'name': 'Evoluções', 'value': 15, 'color': '#BA68C8'},
            {'name': 'Outros', 'value': 5, 'color': '#FFC107'}
        ]
    
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

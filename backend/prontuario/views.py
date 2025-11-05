from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
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
    permission_classes = [IsAuthenticated]
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
        serializer.save(created_by=self.request.user)
    
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
    permission_classes = [IsAuthenticated]
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
        record = serializer.save(created_by=self.request.user)
        
        # Criar registro no histórico
        MedicalRecordHistory.objects.create(
            medical_record=record,
            action='CREATE',
            user=self.request.user,
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
    
    def perform_update(self, serializer):
        """
        Atualiza um prontuário e registra as alterações no histórico
        """
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
        # Criar registro no histórico antes de deletar
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


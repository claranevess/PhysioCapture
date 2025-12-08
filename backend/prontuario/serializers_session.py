"""
Serializers para Sessões de Fisioterapia, Planos de Tratamento e Alta
"""

from rest_framework import serializers
from .models import TreatmentPlan, PhysioSession, Discharge, Patient


class TreatmentPlanSerializer(serializers.ModelSerializer):
    """Serializer completo para Plano de Tratamento"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completed_sessions = serializers.IntegerField(source='completed_sessions_count', read_only=True)
    progress = serializers.IntegerField(source='progress_percentage', read_only=True)
    
    class Meta:
        model = TreatmentPlan
        fields = [
            'id', 'patient', 'patient_name', 'fisioterapeuta', 'fisioterapeuta_name',
            'clinica', 'initial_evaluation', 'title', 'objectives', 'diagnosis',
            'total_sessions', 'frequency', 'frequency_display', 'session_duration_minutes',
            'status', 'status_display', 'start_date', 'expected_end_date', 'actual_end_date',
            'observations', 'completed_sessions', 'progress',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'clinica', 'created_at', 'updated_at']


class TreatmentPlanListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de Planos de Tratamento"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress = serializers.IntegerField(source='progress_percentage', read_only=True)
    
    class Meta:
        model = TreatmentPlan
        fields = [
            'id', 'title', 'patient', 'patient_name', 'fisioterapeuta_name',
            'status', 'status_display', 'total_sessions', 'progress',
            'start_date', 'expected_end_date'
        ]


class TreatmentPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de Plano de Tratamento"""
    
    class Meta:
        model = TreatmentPlan
        fields = [
            'patient', 'initial_evaluation', 'title', 'objectives', 'diagnosis',
            'total_sessions', 'frequency', 'session_duration_minutes',
            'start_date', 'expected_end_date', 'observations'
        ]


class PhysioSessionSerializer(serializers.ModelSerializer):
    """Serializer completo para Sessão de Fisioterapia"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone', read_only=True)
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    treatment_plan_title = serializers.CharField(source='treatment_plan.title', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    can_be_edited = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PhysioSession
        fields = [
            'id', 'patient', 'patient_name', 'patient_phone',
            'fisioterapeuta', 'fisioterapeuta_name',
            'clinica', 'treatment_plan', 'treatment_plan_title',
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'status', 'status_display', 'session_number',
            'procedures', 'evolution', 'pain_scale_before', 'pain_scale_after', 'observations',
            'actual_start_time', 'actual_end_time',
            'is_today', 'can_be_edited',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'clinica', 'created_at', 'updated_at', 'created_by']


class PhysioSessionListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de Sessões (agenda)"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PhysioSession
        fields = [
            'id', 'patient', 'patient_name', 'fisioterapeuta', 'fisioterapeuta_name',
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'status', 'status_display', 'session_number', 'is_today'
        ]


class PhysioSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação/atualização de Sessão"""
    
    class Meta:
        model = PhysioSession
        fields = [
            'patient', 'fisioterapeuta', 'treatment_plan',
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'status', 'session_number',
            'procedures', 'evolution', 'pain_scale_before', 'pain_scale_after', 'observations',
            'actual_start_time', 'actual_end_time'
        ]


class DischargeSerializer(serializers.ModelSerializer):
    """Serializer completo para Alta/Encerramento"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    treatment_plan_title = serializers.CharField(source='treatment_plan.title', read_only=True, allow_null=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    
    class Meta:
        model = Discharge
        fields = [
            'id', 'patient', 'patient_name', 'fisioterapeuta', 'fisioterapeuta_name',
            'treatment_plan', 'treatment_plan_title', 'clinica',
            'reason', 'reason_display', 'reason_details', 'discharge_date',
            'final_evaluation', 'initial_condition', 'final_condition', 'treatment_summary',
            'recommendations', 'follow_up_instructions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'clinica', 'created_at', 'updated_at']


class DischargeListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de Altas"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    
    class Meta:
        model = Discharge
        fields = [
            'id', 'patient', 'patient_name', 'reason', 'reason_display', 'discharge_date'
        ]

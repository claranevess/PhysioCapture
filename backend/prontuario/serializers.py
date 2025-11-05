from rest_framework import serializers
from .models import Patient, MedicalRecord, MedicalRecordHistory
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para informações básicas do usuário
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Patient com foto
    """
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    age = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'full_name', 'cpf', 'birth_date', 'gender',
            'phone', 'email', 'address', 'city', 'state', 'zip_code',
            'photo', 'photo_url',
            'chief_complaint', 'blood_type', 'allergies', 'medications', 'medical_history',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'is_active', 'age', 'last_visit', 'notes'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'photo_url']
    
    def get_age(self, obj):
        """
        Calcula a idade do paciente
        """
        from datetime import date
        today = date.today()
        return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
    
    def get_photo_url(self, obj):
        """
        Retorna URL completa da foto
        """
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class PatientListSerializer(serializers.ModelSerializer):
    """
    Serializer resumido para listagem de pacientes (otimizado para mobile)
    """
    age = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'full_name', 'cpf', 'birth_date', 'age', 'phone', 'photo_url', 'last_visit', 'is_active']
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class MedicalRecordHistorySerializer(serializers.ModelSerializer):
    """
    Serializer para histórico de alterações
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = MedicalRecordHistory
        fields = [
            'id', 'action', 'action_display', 'previous_data', 'changed_fields',
            'timestamp', 'user', 'user_name', 'ip_address'
        ]
        read_only_fields = fields


class MedicalRecordSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo MedicalRecord
    """
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    last_modified_by_name = serializers.CharField(source='last_modified_by.get_full_name', read_only=True)
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    history_records = MedicalRecordHistorySerializer(source='history_logs', many=True, read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'record_type', 'record_type_display',
            'title', 'chief_complaint', 'history', 'physical_exam',
            'diagnosis', 'treatment_plan', 'observations',
            'record_date', 'created_at', 'updated_at',
            'created_by', 'created_by_name',
            'last_modified_by', 'last_modified_by_name',
            'history_records'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class MedicalRecordListSerializer(serializers.ModelSerializer):
    """
    Serializer resumido para listagem de prontuários
    """
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'record_type', 'record_type_display',
            'title', 'record_date', 'created_at'
        ]


class MedicalRecordCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para criar/atualizar prontuários médicos
    """
    class Meta:
        model = MedicalRecord
        fields = [
            'patient', 'record_type', 'title', 'chief_complaint',
            'history', 'physical_exam', 'diagnosis', 'treatment_plan',
            'observations', 'record_date'
        ]

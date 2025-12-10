from rest_framework import serializers
from .models import Patient, MedicalRecord, MedicalRecordHistory, PatientTransferHistory, TransferRequest
from authentication.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para informações básicas do usuário
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer mínimo para referências"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'filial_nome', 'especialidade']


class PatientTransferHistorySerializer(serializers.ModelSerializer):
    """Serializer para histórico de transferências de pacientes"""
    from_fisioterapeuta_name = serializers.CharField(source='from_fisioterapeuta.get_full_name', read_only=True, allow_null=True)
    to_fisioterapeuta_name = serializers.CharField(source='to_fisioterapeuta.get_full_name', read_only=True, allow_null=True)
    from_filial_name = serializers.CharField(source='from_filial.nome', read_only=True, allow_null=True)
    to_filial_name = serializers.CharField(source='to_filial.nome', read_only=True, allow_null=True)
    transferred_by_name = serializers.CharField(source='transferred_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = PatientTransferHistory
        fields = [
            'id', 'patient',
            'from_fisioterapeuta', 'from_fisioterapeuta_name',
            'from_filial', 'from_filial_name',
            'to_fisioterapeuta', 'to_fisioterapeuta_name',
            'to_filial', 'to_filial_name',
            'transfer_date', 'reason',
            'transferred_by', 'transferred_by_name'
        ]
        read_only_fields = fields


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Patient com foto e informações de filial
    """
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True)
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    age = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    transfer_history = PatientTransferHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'full_name', 'cpf', 'birth_date', 'gender',
            'phone', 'email', 'address', 'city', 'state', 'zip_code',
            'photo', 'photo_url',
            'chief_complaint', 'blood_type', 'allergies', 'medications', 'medical_history',
            'created_at', 'updated_at', 
            'clinica', 'clinica_nome',
            'filial', 'filial_nome',
            'fisioterapeuta', 'fisioterapeuta_name',
            'is_active', 'available_for_transfer', 'age', 'last_visit', 'notes',
            'transfer_history'
        ]
        read_only_fields = ['created_at', 'updated_at', 'fisioterapeuta', 'photo_url', 'clinica_nome', 'filial_nome', 'transfer_history']
    
    def get_age(self, obj):
        """Calcula a idade do paciente"""
        from datetime import date
        today = date.today()
        return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
    
    def get_photo_url(self, obj):
        """Retorna URL completa da foto"""
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
    fisioterapeuta_name = serializers.CharField(source='fisioterapeuta.get_full_name', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'full_name', 'cpf', 'birth_date', 'age', 'phone', 
            'photo_url', 'last_visit', 'is_active', 'available_for_transfer',
            'filial', 'filial_nome',
            'fisioterapeuta', 'fisioterapeuta_name'
        ]
    
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


class PatientTransferSerializer(serializers.Serializer):
    """Serializer para transferência de paciente"""
    to_fisioterapeuta_id = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, default='')
    
    def validate_to_fisioterapeuta_id(self, value):
        try:
            fisioterapeuta = User.objects.get(id=value, user_type='FISIOTERAPEUTA')
        except User.DoesNotExist:
            raise serializers.ValidationError("Fisioterapeuta não encontrado.")
        return value


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
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'record_type', 'record_type_display',
            'title', 'chief_complaint', 'physical_exam', 'diagnosis', 
            'treatment_plan', 'observations', 'record_date', 'created_at',
            'created_by', 'created_by_name'
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


class TransferRequestSerializer(serializers.ModelSerializer):
    """Serializer para solicitações de transferência"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    from_filial_name = serializers.CharField(source='from_filial.nome', read_only=True)
    to_fisioterapeuta_name = serializers.CharField(source='to_fisioterapeuta.get_full_name', read_only=True)
    to_filial_name = serializers.CharField(source='to_filial.nome', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_inter_filial = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TransferRequest
        fields = [
            'id', 'patient', 'patient_name',
            'requested_by', 'requested_by_name',
            'from_filial', 'from_filial_name',
            'to_fisioterapeuta', 'to_fisioterapeuta_name',
            'to_filial', 'to_filial_name',
            'reason', 'status', 'status_display',
            'response_note', 'reviewed_by', 'reviewed_by_name',
            'created_at', 'updated_at', 'reviewed_at',
            'is_inter_filial'
        ]
        read_only_fields = [
            'id', 'requested_by', 'from_filial', 'status',
            'response_note', 'reviewed_by', 'reviewed_at',
            'created_at', 'updated_at'
        ]


class TransferRequestCreateSerializer(serializers.Serializer):
    """Serializer para criar solicitações de transferência"""
    patient_id = serializers.IntegerField(required=True)
    to_fisioterapeuta_id = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=True)
    
    def validate_patient_id(self, value):
        try:
            patient = Patient.objects.get(id=value)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Paciente não encontrado.")
        return value
    
    def validate_to_fisioterapeuta_id(self, value):
        try:
            fisioterapeuta = User.objects.get(id=value, user_type='FISIOTERAPEUTA')
        except User.DoesNotExist:
            raise serializers.ValidationError("Fisioterapeuta não encontrado.")
        return value

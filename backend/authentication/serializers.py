from rest_framework import serializers
from .models import User, Clinica, Filial, Lead


class ClinicaSerializer(serializers.ModelSerializer):
    """Serializer para Clínica (Tenant)"""
    
    class Meta:
        model = Clinica
        fields = [
            'id', 'nome', 'cnpj', 'razao_social', 'email', 'telefone',
            'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep',
            'ativa', 'data_contratacao', 'data_vencimento', 'logo', 'max_fisioterapeutas',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'data_contratacao']


class FilialSerializer(serializers.ModelSerializer):
    """Serializer para Filial da rede"""
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    
    class Meta:
        model = Filial
        fields = [
            'id', 'clinica', 'clinica_nome', 'nome',
            'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep',
            'telefone', 'email', 'ativa',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'clinica_nome']


class FilialListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem de filiais"""
    
    class Meta:
        model = Filial
        fields = ['id', 'nome', 'cidade', 'estado', 'ativa']


class UserSerializer(serializers.ModelSerializer):
    """Serializer para listagem de usuários"""
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True, allow_null=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 
            'clinica', 'clinica_nome',
            'filial', 'filial_nome',
            'crefito', 'especialidade', 'phone', 'cpf', 'profile_picture',
            'is_active_user', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'clinica_nome', 'filial_nome', 'user_type_display']


class UserListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem de usuários (dropdown, seleção)"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'user_type', 'filial', 'filial_nome', 'especialidade']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários
    IMPORTANTE: Apenas GESTORES podem criar novos usuários
    """
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'clinica', 'filial',
            'crefito', 'especialidade', 'phone', 'cpf'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        
        # Validar tipo de usuário
        valid_types = ['GESTOR_GERAL', 'GESTOR_FILIAL', 'FISIOTERAPEUTA', 'ATENDENTE']
        if attrs.get('user_type') not in valid_types:
            raise serializers.ValidationError({"user_type": "Tipo de usuário inválido."})
        
        # CREFITO obrigatório para fisioterapeutas
        if attrs.get('user_type') == 'FISIOTERAPEUTA' and not attrs.get('crefito'):
            raise serializers.ValidationError({"crefito": "CREFITO é obrigatório para fisioterapeutas."})
        
        # Filial obrigatória para usuários que não são Gestor Geral
        if attrs.get('user_type') != 'GESTOR_GERAL' and not attrs.get('filial'):
            raise serializers.ValidationError({"filial": "Filial é obrigatória para este tipo de usuário."})
        
        # Gestor Geral não deve ter filial
        if attrs.get('user_type') == 'GESTOR_GERAL':
            attrs['filial'] = None
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer para login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer detalhado para perfil do usuário logado"""
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    clinica_data = ClinicaSerializer(source='clinica', read_only=True)
    filial_data = FilialSerializer(source='filial', read_only=True)
    
    # Permissões calculadas
    is_gestor_geral = serializers.BooleanField(read_only=True)
    is_gestor_filial = serializers.BooleanField(read_only=True)
    is_gestor = serializers.BooleanField(read_only=True)
    is_fisioterapeuta = serializers.BooleanField(read_only=True)
    is_atendente = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 
            'clinica', 'clinica_data',
            'filial', 'filial_data',
            'crefito', 'especialidade', 'phone', 'cpf',
            'profile_picture', 'is_active_user', 'created_at', 'updated_at',
            # Permissões
            'is_gestor_geral', 'is_gestor_filial', 'is_gestor', 'is_fisioterapeuta', 'is_atendente'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_type_display', 'clinica_data', 'filial_data']


class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer para captura de leads de novas clínicas
    Usado na landing page para interesse de contratação
    """
    
    class Meta:
        model = Lead
        fields = [
            'id', 'nome_clinica', 'nome_responsavel', 'email', 'telefone',
            'num_fisioterapeutas', 'mensagem', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate_email(self, value):
        """Validar email corporativo (opcional)"""
        return value.lower()
    
    def validate_num_fisioterapeutas(self, value):
        """Validar número de fisioterapeutas"""
        if value < 1:
            raise serializers.ValidationError("Deve haver pelo menos 1 fisioterapeuta.")
        if value > 999:
            raise serializers.ValidationError("Número muito alto. Entre em contato diretamente.")
        return value

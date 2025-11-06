from rest_framework import serializers
from .models import User, Clinica


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


class UserSerializer(serializers.ModelSerializer):
    """Serializer para listagem de usuários"""
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 'clinica', 'clinica_nome',
            'crefito', 'especialidade', 'phone', 'cpf', 'profile_picture',
            'is_active_user', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'clinica_nome', 'user_type_display']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários
    IMPORTANTE: Apenas GESTOR pode criar novos usuários (fisioterapeutas)
    """
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'clinica',
            'crefito', 'especialidade', 'phone', 'cpf'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        
        # Validar tipo de usuário (apenas GESTOR ou FISIOTERAPEUTA)
        if attrs.get('user_type') not in ['GESTOR', 'FISIOTERAPEUTA']:
            raise serializers.ValidationError({"user_type": "Tipo de usuário inválido."})
        
        # CREFITO obrigatório para fisioterapeutas
        if attrs.get('user_type') == 'FISIOTERAPEUTA' and not attrs.get('crefito'):
            raise serializers.ValidationError({"crefito": "CREFITO é obrigatório para fisioterapeutas."})
        
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
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 'clinica', 'clinica_data',
            'crefito', 'especialidade', 'phone', 'cpf',
            'profile_picture', 'is_active_user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_type_display', 'clinica_data']

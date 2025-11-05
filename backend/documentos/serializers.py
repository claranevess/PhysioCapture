from rest_framework import serializers
from .models import DocumentCategory, Document, DocumentAccessLog
from prontuario.models import Patient


class DocumentCategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorias de documentos
    """
    documents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'created_at', 'is_active', 'documents_count']
        read_only_fields = ['created_at']
    
    def get_documents_count(self, obj):
        """
        Retorna a quantidade de documentos na categoria
        """
        return obj.documents.filter(is_active=True).count()


class DocumentAccessLogSerializer(serializers.ModelSerializer):
    """
    Serializer para logs de acesso
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = DocumentAccessLog
        fields = [
            'id', 'action', 'action_display', 'timestamp',
            'user', 'user_name', 'ip_address', 'details'
        ]
        read_only_fields = fields


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer completo para documentos
    """
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    last_modified_by_name = serializers.CharField(source='last_modified_by.get_full_name', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    access_level_display = serializers.CharField(source='get_access_level_display', read_only=True)
    file_size_formatted = serializers.CharField(read_only=True)
    file_url = serializers.SerializerMethodField()
    access_logs = DocumentAccessLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'patient', 'patient_name', 'category', 'category_name',
            'title', 'description', 'document_type', 'document_type_display',
            'file', 'file_url', 'file_size', 'file_size_formatted', 'file_extension',
            'access_level', 'access_level_display', 'allowed_users',
            'document_date', 'tags',
            'created_at', 'updated_at',
            'uploaded_by', 'uploaded_by_name',
            'last_modified_by', 'last_modified_by_name',
            'is_active', 'is_verified', 'access_logs'
        ]
        read_only_fields = ['file_size', 'file_extension', 'created_at', 'updated_at', 'uploaded_by']
    
    def get_file_url(self, obj):
        """
        Retorna a URL completa do arquivo
        """
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentListSerializer(serializers.ModelSerializer):
    """
    Serializer resumido para listagem de documentos
    """
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_size_formatted = serializers.CharField(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'patient', 'patient_name', 'category', 'category_name',
            'title', 'document_type', 'document_type_display',
            'file_url', 'file_size_formatted',
            'created_at', 'is_verified'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criar documentos
    """
    class Meta:
        model = Document
        fields = [
            'patient', 'category', 'title', 'description',
            'document_type', 'file', 'access_level',
            'allowed_users', 'document_date', 'tags'
        ]
    
    def validate_file(self, value):
        """
        Valida o tamanho do arquivo (máximo 50MB)
        """
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError("O arquivo não pode ser maior que 50MB.")
        return value


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualizar documentos (sem permitir alterar o arquivo)
    """
    class Meta:
        model = Document
        fields = [
            'category', 'title', 'description', 'document_type',
            'access_level', 'allowed_users', 'document_date',
            'tags', 'is_verified'
        ]

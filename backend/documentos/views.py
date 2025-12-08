from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.http import FileResponse, Http404
from .models import DocumentCategory, Document, DocumentAccessLog
from .serializers import (
    DocumentCategorySerializer,
    DocumentSerializer, DocumentListSerializer,
    DocumentCreateSerializer, DocumentUpdateSerializer,
    DocumentAccessLogSerializer
)
import os


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar categorias de documentos
    Endpoints:
    - GET /api/documentos/categories/ - Lista categorias
    - POST /api/documentos/categories/ - Cria categoria
    - GET /api/documentos/categories/{id}/ - Detalhes da categoria
    - PUT/PATCH /api/documentos/categories/{id}/ - Atualiza categoria
    - DELETE /api/documentos/categories/{id}/ - Remove categoria
    """
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar apenas categorias ativas
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar documentos
    Endpoints:
    - GET /api/documentos/documents/ - Lista documentos
    - POST /api/documentos/documents/ - Upload de documento
    - GET /api/documentos/documents/{id}/ - Detalhes do documento
    - PATCH /api/documentos/documents/{id}/ - Atualiza documento
    - DELETE /api/documentos/documents/{id}/ - Remove documento
    - GET /api/documentos/documents/{id}/download/ - Download do arquivo
    - GET /api/documentos/documents/{id}/access_logs/ - Logs de acesso
    """
    queryset = Document.objects.all()
    permission_classes = [AllowAny]  # Temporário para desenvolvimento
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'patient__full_name', 'tags']
    ordering_fields = ['created_at', 'title', 'document_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action == 'create':
            return DocumentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DocumentUpdateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # 🚧 DESENVOLVIMENTO: RBAC desabilitado temporariamente
        # TODO: Reabilitar filtros de segurança em produção
        
        # RBAC: Filtrar por clínica e papel do usuário
        if user.is_authenticated and hasattr(user, 'clinica'):
            # Filtrar pela clínica do usuário através do relacionamento patient
            queryset = queryset.filter(patient__clinica=user.clinica)
            
            # Se for fisioterapeuta, mostrar apenas documentos dos seus pacientes
            if user.is_fisioterapeuta:
                queryset = queryset.filter(patient__fisioterapeuta=user)
            # Se for gestor, mostra todos os documentos da clínica (já filtrado acima)
        # else: Em desenvolvimento, mostrar todos os documentos
        
        # Filtrar por paciente
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrar por categoria
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filtrar por tipo de documento
        doc_type = self.request.query_params.get('document_type', None)
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        
        # Filtrar por nível de acesso
        access_level = self.request.query_params.get('access_level', None)
        if access_level:
            queryset = queryset.filter(access_level=access_level)
        
        # Filtrar apenas ativos
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Cria um novo documento e registra no log
        """
        # Definir uploaded_by apenas se usuário autenticado
        user = self.request.user if self.request.user.is_authenticated else None
        document = serializer.save(uploaded_by=user)
        
        # Registrar acesso no log (apenas se usuário autenticado)
        if user:
            DocumentAccessLog.objects.create(
                document=document,
                user=user,
                action='VIEW',
                ip_address=self.get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', '')
            )
    
    def perform_update(self, serializer):
        """
        Atualiza um documento e registra no log
        """
        document = serializer.save(last_modified_by=self.request.user)
        
        # Registrar edição no log
        DocumentAccessLog.objects.create(
            document=document,
            user=self.request.user,
            action='EDIT',
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            details={'action': 'update', 'fields': list(serializer.validated_data.keys())}
        )
    
    def perform_destroy(self, instance):
        """
        Remove um documento e registra no log
        """
        # Registrar exclusão no log
        DocumentAccessLog.objects.create(
            document=instance,
            user=self.request.user,
            action='DELETE',
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            details={'document_title': instance.title, 'patient': instance.patient.full_name}
        )
        
        instance.delete()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override para registrar visualização
        """
        instance = self.get_object()
        
        # Registrar visualização no log (apenas se usuário autenticado)
        if request.user.is_authenticated:
            DocumentAccessLog.objects.create(
                document=instance,
                user=request.user,
                action='VIEW',
                ip_address=self.get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download do arquivo do documento
        """
        document = self.get_object()
        
        # Verificar se o arquivo existe
        if not document.file:
            raise Http404("Arquivo não encontrado")
        
        # Registrar download no log (apenas se usuário autenticado)
        if request.user.is_authenticated:
            DocumentAccessLog.objects.create(
                document=document,
                user=request.user,
                action='DOWNLOAD',
                ip_address=self.get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        # Retornar o arquivo
        try:
            response = FileResponse(
                document.file.open('rb'),
                content_type='application/octet-stream'
            )
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.file.name)}"'
            return response
        except FileNotFoundError:
            raise Http404("Arquivo não encontrado no servidor")
    
    @action(detail=True, methods=['get'])
    def access_logs(self, request, pk=None):
        """
        Retorna os logs de acesso de um documento
        """
        document = self.get_object()
        logs = document.access_logs.all()
        serializer = DocumentAccessLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_patient(self, request):
        """
        Lista documentos agrupados por paciente
        """
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        documents = self.get_queryset().filter(patient_id=patient_id)
        serializer = DocumentListSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Busca avançada de documentos
        """
        query = request.query_params.get('q', '')
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(patient__full_name__icontains=query) |
                Q(tags__icontains=query)
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DocumentListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = DocumentListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Marca um documento como verificado
        """
        document = self.get_object()
        document.is_verified = True
        document.last_modified_by = request.user
        document.save()
        
        # Registrar no log
        DocumentAccessLog.objects.create(
            document=document,
            user=request.user,
            action='EDIT',
            ip_address=self.get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details={'action': 'verify'}
        )
        
        serializer = self.get_serializer(document)
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

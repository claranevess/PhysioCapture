from django.db import models
from django.contrib.auth.models import User
from prontuario.models import Patient
import os


def document_upload_path(instance, filename):
    """
    Define o caminho de upload dos documentos
    Organiza por paciente: documents/patient_{id}/{filename}
    """
    return f'documents/patient_{instance.patient.id}/{filename}'


class DocumentCategory(models.Model):
    """
    Categorias para organizar os documentos
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name="Ícone")
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name="Cor (hex)")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        ordering = ['name']
        verbose_name = "Categoria de Documento"
        verbose_name_plural = "Categorias de Documentos"

    def __str__(self):
        return self.name


class Document(models.Model):
    """
    Modelo para armazenar documentos digitalizados dos pacientes
    """
    DOCUMENT_TYPE_CHOICES = [
        ('PDF', 'PDF'),
        ('IMAGE', 'Imagem'),
        ('DOC', 'Documento Word'),
        ('EXCEL', 'Planilha Excel'),
        ('FICHA', 'Ficha de Avaliação'),
        ('EXAME', 'Exame'),
        ('ATESTADO', 'Atestado'),
        ('RECEITA', 'Receita'),
        ('OTHER', 'Outro'),
    ]

    ACCESS_LEVEL_CHOICES = [
        ('PUBLIC', 'Público'),
        ('RESTRICTED', 'Restrito'),
        ('CONFIDENTIAL', 'Confidencial'),
    ]

    # Relacionamentos
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='documents', verbose_name="Paciente")
    category = models.ForeignKey(DocumentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents', verbose_name="Categoria")
    
    # Informações do documento
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPE_CHOICES, verbose_name="Tipo de Documento")
    
    # Arquivo
    file = models.FileField(upload_to=document_upload_path, verbose_name="Arquivo")
    file_size = models.IntegerField(blank=True, null=True, verbose_name="Tamanho do Arquivo (bytes)")
    file_extension = models.CharField(max_length=10, blank=True, null=True, verbose_name="Extensão")
    
    # OCR - Texto extraído (NOVO - Feature principal H01)
    ocr_text = models.TextField(blank=True, null=True, verbose_name="Texto Extraído (OCR)")
    ocr_confidence = models.FloatField(blank=True, null=True, verbose_name="Confiança do OCR (%)")
    ocr_processed = models.BooleanField(default=False, verbose_name="OCR Processado")
    ocr_language = models.CharField(max_length=10, default='por', verbose_name="Idioma OCR")
    
    # Thumbnail para preview mobile
    thumbnail = models.ImageField(upload_to='documents/thumbnails/', blank=True, null=True, verbose_name="Miniatura")
    
    # Segurança e controle de acesso
    access_level = models.CharField(max_length=15, choices=ACCESS_LEVEL_CHOICES, default='RESTRICTED', verbose_name="Nível de Acesso")
    allowed_users = models.ManyToManyField(User, blank=True, related_name='allowed_documents', verbose_name="Usuários Permitidos")
    
    # Metadados
    document_date = models.DateField(blank=True, null=True, verbose_name="Data do Documento")
    tags = models.CharField(max_length=300, blank=True, null=True, verbose_name="Tags (separadas por vírgula)")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='documents_uploaded', verbose_name="Enviado por")
    last_modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='documents_modified', verbose_name="Última modificação por")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    is_verified = models.BooleanField(default=False, verbose_name="Verificado")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"

    def __str__(self):
        return f"{self.title} - {self.patient.full_name}"

    def save(self, *args, **kwargs):
        """
        Override do save para calcular automaticamente o tamanho e extensão do arquivo
        """
        if self.file:
            self.file_size = self.file.size
            self.file_extension = os.path.splitext(self.file.name)[1].lower()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Override do delete para remover o arquivo físico quando o registro é deletado
        """
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        if self.thumbnail and os.path.isfile(self.thumbnail.path):
            os.remove(self.thumbnail.path)
        super().delete(*args, **kwargs)

    @property
    def file_size_formatted(self):
        """
        Retorna o tamanho do arquivo formatado (KB, MB, GB)
        """
        if not self.file_size:
            return "0 B"
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"


class DocumentAccessLog(models.Model):
    """
    Modelo para registrar acessos aos documentos (auditoria)
    """
    ACTION_CHOICES = [
        ('VIEW', 'Visualização'),
        ('DOWNLOAD', 'Download'),
        ('EDIT', 'Edição'),
        ('DELETE', 'Exclusão'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='access_logs', verbose_name="Documento")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuário")
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, verbose_name="Ação")
    
    # Informações de auditoria
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="Endereço IP")
    user_agent = models.TextField(blank=True, null=True, verbose_name="User Agent")
    
    # Detalhes adicionais
    details = models.JSONField(blank=True, null=True, verbose_name="Detalhes")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Log de Acesso a Documento"
        verbose_name_plural = "Logs de Acesso a Documentos"

    def __str__(self):
        return f"{self.get_action_display()} - {self.document.title} - {self.user} ({self.timestamp.strftime('%d/%m/%Y %H:%M')})"

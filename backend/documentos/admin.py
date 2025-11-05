from django.contrib import admin
from .models import DocumentCategory, Document, DocumentAccessLog


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'category', 'document_type', 'file_size_formatted', 'access_level', 'uploaded_by', 'created_at']
    list_filter = ['document_type', 'access_level', 'category', 'is_active', 'is_verified', 'created_at']
    search_fields = ['title', 'description', 'patient__full_name', 'tags']
    readonly_fields = ['file_size', 'file_extension', 'created_at', 'updated_at']
    filter_horizontal = ['allowed_users']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('patient', 'category', 'title', 'description', 'document_type')
        }),
        ('Arquivo', {
            'fields': ('file', 'file_size', 'file_extension', 'document_date')
        }),
        ('Segurança', {
            'fields': ('access_level', 'allowed_users')
        }),
        ('Metadados', {
            'fields': ('tags', 'is_verified')
        }),
        ('Controle', {
            'fields': ('is_active', 'uploaded_by', 'last_modified_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'action', 'timestamp', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['document__title', 'user__username', 'ip_address']
    readonly_fields = ['document', 'user', 'action', 'timestamp', 'ip_address', 'user_agent', 'details']
    
    def has_add_permission(self, request):
        # Não permite adicionar logs manualmente
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Não permite deletar logs
        return False

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Clinica, Filial, Lead


@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cnpj', 'cidade', 'estado', 'ativa', 'data_contratacao']
    list_filter = ['ativa', 'estado', 'data_contratacao']
    search_fields = ['nome', 'cnpj', 'razao_social', 'email']
    readonly_fields = ['created_at', 'updated_at', 'data_contratacao']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'cnpj', 'razao_social', 'logo')
        }),
        ('Contato', {
            'fields': ('email', 'telefone')
        }),
        ('Endereço', {
            'fields': ('endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep')
        }),
        ('Assinatura', {
            'fields': ('ativa', 'data_contratacao', 'data_vencimento', 'max_fisioterapeutas')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Filial)
class FilialAdmin(admin.ModelAdmin):
    list_display = ['nome', 'clinica', 'cidade', 'estado', 'ativa', 'created_at']
    list_filter = ['ativa', 'clinica', 'estado', 'created_at']
    search_fields = ['nome', 'cidade', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('clinica', 'nome', 'ativa')
        }),
        ('Endereço', {
            'fields': ('endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep')
        }),
        ('Contato', {
            'fields': ('telefone', 'email')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'filial', 'user_type', 'is_active_user']
    list_filter = ['user_type', 'is_active_user', 'is_staff', 'is_superuser', 'clinica', 'filial']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'cpf']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações da Clínica/Filial', {
            'fields': ('clinica', 'filial')
        }),
        ('Informações Profissionais', {
            'fields': ('user_type', 'crefito', 'especialidade')
        }),
        ('Contato', {
            'fields': ('phone', 'cpf', 'profile_picture')
        }),
        ('Status', {
            'fields': ('is_active_user',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informações da Clínica/Filial', {
            'fields': ('clinica', 'filial')
        }),
        ('Informações Profissionais', {
            'fields': ('user_type', 'crefito', 'especialidade', 'email', 'first_name', 'last_name')
        }),
        ('Contato', {
            'fields': ('phone', 'cpf')
        }),
    )


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """
    Admin para gerenciamento de leads da landing page
    Equipe Core Hive usa isso para acompanhar interesse de novas clínicas
    """
    list_display = [
        'nome_clinica', 
        'nome_responsavel', 
        'email', 
        'telefone', 
        'num_fisioterapeutas',
        'status', 
        'created_at',
        'dias_desde_criacao'
    ]
    list_filter = ['status', 'created_at', 'num_fisioterapeutas']
    search_fields = ['nome_clinica', 'nome_responsavel', 'email', 'telefone']
    readonly_fields = ['created_at', 'updated_at', 'dias_desde_criacao']
    
    fieldsets = (
        ('Informações da Clínica', {
            'fields': ('nome_clinica', 'nome_responsavel', 'email', 'telefone', 'num_fisioterapeutas')
        }),
        ('Mensagem', {
            'fields': ('mensagem',)
        }),
        ('Controle', {
            'fields': ('status', 'clinica_convertida')
        }),
        ('Notas Internas', {
            'fields': ('notas',),
            'description': 'Observações internas da equipe Core Hive'
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at', 'dias_desde_criacao'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['marcar_como_contato', 'marcar_como_demonstracao', 'marcar_como_proposta']
    
    def marcar_como_contato(self, request, queryset):
        queryset.update(status='CONTATO')
        self.message_user(request, f"{queryset.count()} lead(s) marcado(s) como 'Em Contato'")
    marcar_como_contato.short_description = "Marcar como 'Em Contato'"
    
    def marcar_como_demonstracao(self, request, queryset):
        queryset.update(status='DEMONSTRACAO')
        self.message_user(request, f"{queryset.count()} lead(s) marcado(s) como 'Demonstração Agendada'")
    marcar_como_demonstracao.short_description = "Marcar como 'Demonstração Agendada'"
    
    def marcar_como_proposta(self, request, queryset):
        queryset.update(status='PROPOSTA')
        self.message_user(request, f"{queryset.count()} lead(s) marcado(s) como 'Proposta Enviada'")
    marcar_como_proposta.short_description = "Marcar como 'Proposta Enviada'"

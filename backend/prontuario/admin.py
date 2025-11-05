from django.contrib import admin
from .models import Patient, MedicalRecord, MedicalRecordHistory


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'cpf', 'birth_date', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'gender', 'created_at']
    search_fields = ['full_name', 'cpf', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Dados Pessoais', {
            'fields': ('full_name', 'cpf', 'birth_date', 'gender')
        }),
        ('Contato', {
            'fields': ('phone', 'email')
        }),
        ('Endereço', {
            'fields': ('address', 'city', 'state', 'zip_code')
        }),
        ('Informações Médicas', {
            'fields': ('blood_type', 'allergies', 'medications')
        }),
        ('Controle', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'title', 'record_type', 'record_date', 'created_by']
    list_filter = ['record_type', 'record_date', 'created_at']
    search_fields = ['patient__full_name', 'title', 'diagnosis']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'record_date'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('patient', 'record_type', 'title', 'record_date')
        }),
        ('Conteúdo do Prontuário', {
            'fields': ('chief_complaint', 'history', 'physical_exam', 'diagnosis', 'treatment_plan', 'observations')
        }),
        ('Controle', {
            'fields': ('created_by', 'last_modified_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(MedicalRecordHistory)
class MedicalRecordHistoryAdmin(admin.ModelAdmin):
    list_display = ['medical_record', 'action', 'user', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['medical_record__patient__full_name', 'user__username']
    readonly_fields = ['medical_record', 'action', 'previous_data', 'changed_fields', 'timestamp', 'user', 'ip_address', 'user_agent']
    
    def has_add_permission(self, request):
        # Não permite adicionar histórico manualmente
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Não permite deletar histórico
        return False

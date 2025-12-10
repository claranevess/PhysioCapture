from django.contrib import admin
from .models import (
    Patient, MedicalRecord, MedicalRecordHistory, 
    PatientTransferHistory, TreatmentPlan, PhysioSession, Discharge
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'cpf', 'filial', 'fisioterapeuta', 'is_active', 'available_for_transfer', 'created_at']
    list_filter = ['is_active', 'available_for_transfer', 'gender', 'filial', 'clinica', 'created_at']
    search_fields = ['full_name', 'cpf', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['fisioterapeuta', 'filial', 'clinica']
    
    fieldsets = (
        ('Vinculação', {
            'fields': ('clinica', 'filial', 'fisioterapeuta')
        }),
        ('Dados Pessoais', {
            'fields': ('full_name', 'cpf', 'birth_date', 'gender', 'photo')
        }),
        ('Contato', {
            'fields': ('phone', 'email')
        }),
        ('Endereço', {
            'fields': ('address', 'city', 'state', 'zip_code')
        }),
        ('Informações Médicas', {
            'fields': ('chief_complaint', 'blood_type', 'allergies', 'medications', 'medical_history')
        }),
        ('Controle', {
            'fields': ('is_active', 'available_for_transfer', 'last_visit', 'notes', 'created_at', 'updated_at')
        }),
    )


@admin.register(PatientTransferHistory)
class PatientTransferHistoryAdmin(admin.ModelAdmin):
    list_display = ['patient', 'from_fisioterapeuta', 'to_fisioterapeuta', 'from_filial', 'to_filial', 'transfer_date', 'transferred_by']
    list_filter = ['transfer_date', 'from_filial', 'to_filial']
    search_fields = ['patient__full_name', 'reason']
    readonly_fields = ['patient', 'from_fisioterapeuta', 'to_fisioterapeuta', 'from_filial', 'to_filial', 'transfer_date', 'transferred_by', 'reason']
    date_hierarchy = 'transfer_date'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


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
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(TreatmentPlan)
class TreatmentPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'fisioterapeuta', 'status', 'total_sessions', 'start_date']
    list_filter = ['status', 'frequency', 'clinica', 'created_at']
    search_fields = ['title', 'patient__full_name', 'objectives']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(PhysioSession)
class PhysioSessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'fisioterapeuta', 'scheduled_date', 'scheduled_time', 'status', 'session_number']
    list_filter = ['status', 'clinica', 'scheduled_date', 'created_at']
    search_fields = ['patient__full_name', 'procedures', 'evolution']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'scheduled_date'


@admin.register(Discharge)
class DischargeAdmin(admin.ModelAdmin):
    list_display = ['patient', 'fisioterapeuta', 'reason', 'discharge_date']
    list_filter = ['reason', 'clinica', 'discharge_date']
    search_fields = ['patient__full_name', 'final_evaluation']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'discharge_date'

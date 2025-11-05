from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Patient(models.Model):
    """
    Modelo para armazenar informações dos pacientes
    """
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]

    # Dados pessoais
    full_name = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    birth_date = models.DateField(verbose_name="Data de Nascimento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Gênero")
    
    # Contato
    phone = models.CharField(max_length=20, verbose_name="Telefone")
    email = models.EmailField(blank=True, null=True, verbose_name="E-mail")
    
    # Endereço
    address = models.CharField(max_length=300, verbose_name="Endereço")
    city = models.CharField(max_length=100, verbose_name="Cidade")
    state = models.CharField(max_length=2, verbose_name="Estado")
    zip_code = models.CharField(max_length=10, verbose_name="CEP")
    
    # Informações médicas básicas
    blood_type = models.CharField(max_length=3, blank=True, null=True, verbose_name="Tipo Sanguíneo")
    allergies = models.TextField(blank=True, null=True, verbose_name="Alergias")
    medications = models.TextField(blank=True, null=True, verbose_name="Medicações em Uso")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='patients_created', verbose_name="Criado por")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        ordering = ['full_name']
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"

    def __str__(self):
        return f"{self.full_name} - CPF: {self.cpf}"


class MedicalRecord(models.Model):
    """
    Modelo para prontuários médicos dos pacientes
    """
    RECORD_TYPE_CHOICES = [
        ('CONSULTA', 'Consulta'),
        ('AVALIACAO', 'Avaliação'),
        ('EVOLUCAO', 'Evolução'),
        ('PROCEDIMENTO', 'Procedimento'),
        ('EXAME', 'Exame'),
        ('DIAGNOSTICO', 'Diagnóstico'),
        ('OUTROS', 'Outros'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records', verbose_name="Paciente")
    record_type = models.CharField(max_length=20, choices=RECORD_TYPE_CHOICES, verbose_name="Tipo de Registro")
    
    # Conteúdo do prontuário
    title = models.CharField(max_length=200, verbose_name="Título")
    chief_complaint = models.TextField(blank=True, null=True, verbose_name="Queixa Principal")
    history = models.TextField(blank=True, null=True, verbose_name="História")
    physical_exam = models.TextField(blank=True, null=True, verbose_name="Exame Físico")
    diagnosis = models.TextField(blank=True, null=True, verbose_name="Diagnóstico")
    treatment_plan = models.TextField(blank=True, null=True, verbose_name="Plano de Tratamento")
    observations = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    # Controle
    record_date = models.DateTimeField(default=timezone.now, verbose_name="Data do Registro")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='records_created', verbose_name="Criado por")
    last_modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='records_modified', verbose_name="Última modificação por")

    class Meta:
        ordering = ['-record_date']
        verbose_name = "Prontuário Médico"
        verbose_name_plural = "Prontuários Médicos"

    def __str__(self):
        return f"{self.patient.full_name} - {self.title} ({self.record_date.strftime('%d/%m/%Y')})"


class MedicalRecordHistory(models.Model):
    """
    Modelo para rastrear histórico de alterações nos prontuários
    """
    ACTION_CHOICES = [
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Exclusão'),
    ]

    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='history_logs', verbose_name="Prontuário")
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, verbose_name="Ação")
    
    # Snapshot dos dados antes da alteração
    previous_data = models.JSONField(blank=True, null=True, verbose_name="Dados Anteriores")
    
    # Campos alterados
    changed_fields = models.JSONField(blank=True, null=True, verbose_name="Campos Alterados")
    
    # Controle
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Usuário")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="Endereço IP")
    user_agent = models.TextField(blank=True, null=True, verbose_name="User Agent")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Histórico de Prontuário"
        verbose_name_plural = "Históricos de Prontuários"

    def __str__(self):
        return f"{self.get_action_display()} - {self.medical_record.patient.full_name} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"

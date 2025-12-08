from django.db import models
from django.conf import settings
from django.utils import timezone


def patient_photo_upload_path(instance, filename):
    """Define o caminho de upload das fotos dos pacientes"""
    return f'patients/photos/{instance.clinica_id}/{instance.id}/{filename}'


class Patient(models.Model):
    """
    REGISTRO DE PACIENTE - NÃO É UM USUÁRIO!
    
    Pacientes não fazem login no sistema.
    São apenas registros de dados (como uma "ficha").
    Criados e gerenciados por Fisioterapeutas.
    Pertencem a uma Clínica (Tenant).
    """
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]

    # TENANT - Paciente pertence a uma clínica
    clinica = models.ForeignKey(
        'authentication.Clinica',
        on_delete=models.CASCADE,
        related_name='pacientes',
        verbose_name='Clínica'
    )
    
    # FISIOTERAPEUTA RESPONSÁVEL - Quem criou e gerencia este paciente
    fisioterapeuta = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='meus_pacientes',
        verbose_name='Fisioterapeuta Responsável',
        help_text='Fisioterapeuta que criou e gerencia este paciente'
    )
    
    # Dados pessoais
    full_name = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=14, verbose_name="CPF")
    birth_date = models.DateField(verbose_name="Data de Nascimento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Gênero")
    
    # Foto do paciente (NOVO - Mobile-first)
    photo = models.ImageField(
        upload_to=patient_photo_upload_path, 
        blank=True, 
        null=True, 
        verbose_name="Foto"
    )
    
    # Contato
    phone = models.CharField(max_length=20, verbose_name="Telefone")
    email = models.EmailField(blank=True, null=True, verbose_name="E-mail")
    
    # Endereço
    address = models.CharField(max_length=300, blank=True, verbose_name="Endereço")
    city = models.CharField(max_length=100, blank=True, verbose_name="Cidade")
    state = models.CharField(max_length=2, blank=True, verbose_name="Estado")
    zip_code = models.CharField(max_length=10, blank=True, verbose_name="CEP")
    
    # Informações médicas básicas (NOVO - Prontuário inicial)
    chief_complaint = models.TextField(blank=True, null=True, verbose_name="Queixa Principal")
    blood_type = models.CharField(max_length=3, blank=True, null=True, verbose_name="Tipo Sanguíneo")
    allergies = models.TextField(blank=True, null=True, verbose_name="Alergias")
    medications = models.TextField(blank=True, null=True, verbose_name="Medicações em Uso")
    medical_history = models.TextField(blank=True, null=True, verbose_name="Histórico Médico")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    
    # Metadados úteis para mobile
    last_visit = models.DateTimeField(blank=True, null=True, verbose_name="Última Visita")
    notes = models.TextField(blank=True, null=True, verbose_name="Observações Gerais")

    class Meta:
        ordering = ['full_name']
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        # CPF único por clínica (um paciente não pode estar duplicado na mesma clínica)
        unique_together = [['clinica', 'cpf']]

    def __str__(self):
        return f"{self.full_name} - CPF: {self.cpf} ({self.clinica.nome})"
    
    @property
    def age(self):
        """Calcula a idade do paciente"""
        from datetime import date
        today = date.today()
        return today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )


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
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='records_created', verbose_name="Criado por")
    last_modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='records_modified', verbose_name="Última modificação por")

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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Usuário")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="Endereço IP")
    user_agent = models.TextField(blank=True, null=True, verbose_name="User Agent")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Histórico de Prontuário"
        verbose_name_plural = "Históricos de Prontuários"

    def __str__(self):
        return f"{self.get_action_display()} - {self.medical_record.patient.full_name} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"


# ==================== NOVOS MODELOS - FASE 1 ====================

class TreatmentPlan(models.Model):
    """
    Plano de tratamento do paciente
    Define objetivos, frequência e quantidade de sessões planejadas
    """
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    FREQUENCY_CHOICES = [
        ('1x_semana', '1x por semana'),
        ('2x_semana', '2x por semana'),
        ('3x_semana', '3x por semana'),
        ('4x_semana', '4x por semana'),
        ('5x_semana', '5x por semana'),
        ('diario', 'Diário'),
        ('sob_demanda', 'Sob demanda'),
    ]
    
    # Relacionamentos
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='treatment_plans',
        verbose_name="Paciente"
    )
    fisioterapeuta = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        related_name='treatment_plans_created',
        verbose_name="Fisioterapeuta Responsável"
    )
    clinica = models.ForeignKey(
        'authentication.Clinica', 
        on_delete=models.CASCADE,
        related_name='treatment_plans',
        verbose_name="Clínica"
    )
    
    # Avaliação inicial vinculada (opcional)
    initial_evaluation = models.ForeignKey(
        MedicalRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='treatment_plans',
        verbose_name="Avaliação Inicial"
    )
    
    # Objetivos e descrição
    title = models.CharField(max_length=200, verbose_name="Título do Plano")
    objectives = models.TextField(verbose_name="Objetivos do Tratamento")
    diagnosis = models.TextField(blank=True, verbose_name="Diagnóstico Fisioterapêutico")
    
    # Planejamento de sessões
    total_sessions = models.IntegerField(verbose_name="Total de Sessões Planejadas")
    frequency = models.CharField(
        max_length=20, 
        choices=FREQUENCY_CHOICES, 
        default='2x_semana',
        verbose_name="Frequência"
    )
    session_duration_minutes = models.IntegerField(default=50, verbose_name="Duração por Sessão (min)")
    
    # Status e datas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO', verbose_name="Status")
    start_date = models.DateField(verbose_name="Data de Início")
    expected_end_date = models.DateField(null=True, blank=True, verbose_name="Previsão de Término")
    actual_end_date = models.DateField(null=True, blank=True, verbose_name="Data de Término Real")
    
    # Observações
    observations = models.TextField(blank=True, verbose_name="Observações Gerais")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Plano de Tratamento"
        verbose_name_plural = "Planos de Tratamento"
    
    def __str__(self):
        return f"{self.title} - {self.patient.full_name} ({self.get_status_display()})"
    
    @property
    def completed_sessions_count(self):
        """Conta quantas sessões foram realizadas"""
        return self.sessions.filter(status='REALIZADA').count()
    
    @property
    def progress_percentage(self):
        """Retorna a porcentagem de progresso do tratamento"""
        if self.total_sessions == 0:
            return 0
        return int((self.completed_sessions_count / self.total_sessions) * 100)


class PhysioSession(models.Model):
    """
    Sessão de fisioterapia
    Representa uma sessão individual de atendimento
    """
    STATUS_CHOICES = [
        ('AGENDADA', 'Agendada'),
        ('CONFIRMADA', 'Confirmada'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('REALIZADA', 'Realizada'),
        ('CANCELADA', 'Cancelada'),
        ('FALTA', 'Falta do Paciente'),
        ('REMARCADA', 'Remarcada'),
    ]
    
    # Relacionamentos principais
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='sessions',
        verbose_name="Paciente"
    )
    fisioterapeuta = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        related_name='sessions_as_therapist',
        verbose_name="Fisioterapeuta"
    )
    clinica = models.ForeignKey(
        'authentication.Clinica', 
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name="Clínica"
    )
    treatment_plan = models.ForeignKey(
        TreatmentPlan, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='sessions',
        verbose_name="Plano de Tratamento"
    )
    
    # Agendamento
    scheduled_date = models.DateField(verbose_name="Data Agendada")
    scheduled_time = models.TimeField(verbose_name="Horário Agendado")
    duration_minutes = models.IntegerField(default=50, verbose_name="Duração (minutos)")
    
    # Status e controle
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AGENDADA', verbose_name="Status")
    session_number = models.IntegerField(null=True, blank=True, verbose_name="Número da Sessão")
    
    # Registro clínico (preenchido após/durante a sessão)
    procedures = models.TextField(blank=True, verbose_name="Procedimentos Realizados")
    evolution = models.TextField(blank=True, verbose_name="Evolução do Quadro")
    pain_scale_before = models.IntegerField(null=True, blank=True, verbose_name="Escala de Dor (Antes)")
    pain_scale_after = models.IntegerField(null=True, blank=True, verbose_name="Escala de Dor (Depois)")
    observations = models.TextField(blank=True, verbose_name="Observações")
    
    # Horário real de atendimento
    actual_start_time = models.TimeField(null=True, blank=True, verbose_name="Hora Início Real")
    actual_end_time = models.TimeField(null=True, blank=True, verbose_name="Hora Término Real")
    
    # Controle de criação
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='sessions_created',
        verbose_name="Criado por"
    )
    
    class Meta:
        ordering = ['-scheduled_date', '-scheduled_time']
        verbose_name = "Sessão de Fisioterapia"
        verbose_name_plural = "Sessões de Fisioterapia"
    
    def __str__(self):
        session_info = f"#{self.session_number}" if self.session_number else ""
        return f"Sessão {session_info} - {self.patient.full_name} ({self.scheduled_date.strftime('%d/%m/%Y')} {self.scheduled_time.strftime('%H:%M')})"
    
    @property
    def is_today(self):
        """Verifica se a sessão é hoje"""
        from datetime import date
        return self.scheduled_date == date.today()
    
    @property
    def can_be_edited(self):
        """Verifica se a sessão ainda pode ser editada"""
        return self.status in ['AGENDADA', 'CONFIRMADA']


class Discharge(models.Model):
    """
    Registro de alta/encerramento do tratamento
    Documenta o motivo e avaliação final do tratamento
    """
    REASON_CHOICES = [
        ('MELHORA', 'Alta por Melhora'),
        ('CURA', 'Alta por Cura'),
        ('ABANDONO', 'Abandono do Tratamento'),
        ('ENCAMINHAMENTO', 'Encaminhamento para Outro Profissional'),
        ('TRANSFERENCIA', 'Transferência de Clínica'),
        ('OBITO', 'Óbito'),
        ('OUTRO', 'Outro Motivo'),
    ]
    
    # Relacionamentos
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='discharges',
        verbose_name="Paciente"
    )
    fisioterapeuta = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        related_name='discharges_given',
        verbose_name="Fisioterapeuta Responsável"
    )
    treatment_plan = models.ForeignKey(
        TreatmentPlan, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='discharges',
        verbose_name="Plano de Tratamento"
    )
    clinica = models.ForeignKey(
        'authentication.Clinica', 
        on_delete=models.CASCADE,
        related_name='discharges',
        verbose_name="Clínica"
    )
    
    # Informações da alta
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, verbose_name="Motivo da Alta")
    reason_details = models.TextField(blank=True, verbose_name="Detalhes do Motivo")
    discharge_date = models.DateField(verbose_name="Data da Alta")
    
    # Avaliação final
    final_evaluation = models.TextField(verbose_name="Avaliação Final")
    initial_condition = models.TextField(blank=True, verbose_name="Condição Inicial")
    final_condition = models.TextField(blank=True, verbose_name="Condição Final")
    treatment_summary = models.TextField(blank=True, verbose_name="Resumo do Tratamento")
    
    # Recomendações
    recommendations = models.TextField(blank=True, verbose_name="Recomendações ao Paciente")
    follow_up_instructions = models.TextField(blank=True, verbose_name="Instruções de Acompanhamento")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        ordering = ['-discharge_date']
        verbose_name = "Alta/Encerramento"
        verbose_name_plural = "Altas/Encerramentos"
    
    def __str__(self):
        return f"Alta - {self.patient.full_name} ({self.discharge_date.strftime('%d/%m/%Y')}) - {self.get_reason_display()}"


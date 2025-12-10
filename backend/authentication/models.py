from django.db import models
from django.contrib.auth.models import AbstractUser


class Clinica(models.Model):
    """
    TENANT PRINCIPAL - A "Caixa Grande"
    Cada clínica que contrata o PhysioCapture
    Todos os dados pertencem a uma clínica específica
    """
    nome = models.CharField(max_length=255, verbose_name='Nome da Clínica')
    cnpj = models.CharField(max_length=18, unique=True, verbose_name='CNPJ')
    razao_social = models.CharField(max_length=255, verbose_name='Razão Social')
    
    # Contato
    email = models.EmailField(verbose_name='E-mail')
    telefone = models.CharField(max_length=20, verbose_name='Telefone')
    
    # Endereço
    endereco = models.CharField(max_length=255, verbose_name='Endereço')
    numero = models.CharField(max_length=10, verbose_name='Número')
    complemento = models.CharField(max_length=100, blank=True, verbose_name='Complemento')
    bairro = models.CharField(max_length=100, verbose_name='Bairro')
    cidade = models.CharField(max_length=100, verbose_name='Cidade')
    estado = models.CharField(max_length=2, verbose_name='Estado')
    cep = models.CharField(max_length=9, verbose_name='CEP')
    
    # Assinatura
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    data_contratacao = models.DateField(auto_now_add=True, verbose_name='Data de Contratação')
    data_vencimento = models.DateField(null=True, blank=True, verbose_name='Data de Vencimento')
    
    # Configurações
    logo = models.ImageField(upload_to='clinicas/logos/', blank=True, null=True, verbose_name='Logo')
    max_fisioterapeutas = models.IntegerField(default=5, verbose_name='Máximo de Fisioterapeutas')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Clínica'
        verbose_name_plural = 'Clínicas'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Filial(models.Model):
    """
    FILIAL DA REDE DE CLÍNICAS
    Cada clínica pode ter múltiplas filiais.
    Exemplo: FisioVida Recife, FisioVida Olinda
    """
    clinica = models.ForeignKey(
        Clinica,
        on_delete=models.CASCADE,
        related_name='filiais',
        verbose_name='Clínica'
    )
    nome = models.CharField(max_length=255, verbose_name='Nome da Filial')
    
    # Endereço
    endereco = models.CharField(max_length=255, verbose_name='Endereço')
    numero = models.CharField(max_length=10, verbose_name='Número')
    complemento = models.CharField(max_length=100, blank=True, verbose_name='Complemento')
    bairro = models.CharField(max_length=100, verbose_name='Bairro')
    cidade = models.CharField(max_length=100, verbose_name='Cidade')
    estado = models.CharField(max_length=2, verbose_name='Estado')
    cep = models.CharField(max_length=9, verbose_name='CEP')
    
    # Contato
    telefone = models.CharField(max_length=20, verbose_name='Telefone')
    email = models.EmailField(blank=True, verbose_name='E-mail')
    
    # Status
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Filial'
        verbose_name_plural = 'Filiais'
        ordering = ['nome']
        unique_together = [['clinica', 'nome']]
    
    def __str__(self):
        return f"{self.nome} ({self.clinica.nome})"


class User(AbstractUser):
    """
    USUÁRIOS DO SISTEMA - Apenas quem pode fazer LOGIN
    
    GESTOR_GERAL: Gerencia toda a rede de clínicas (todas as filiais)
    GESTOR_FILIAL: Gerencia apenas sua filial específica
    FISIOTERAPEUTA: Atende pacientes, gerencia prontuários clínicos
    ATENDENTE: Recepção, agenda, cadastro básico de pacientes
    
    IMPORTANTE: Pacientes NÃO são usuários! São apenas registros de dados.
    """
    
    USER_TYPE_CHOICES = [
        ('GESTOR_GERAL', 'Gestor Geral da Rede'),
        ('GESTOR_FILIAL', 'Gestor da Filial'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
        ('ATENDENTE', 'Atendente/Recepção'),
    ]
    
    # TENANT - Cada usuário pertence a uma clínica
    clinica = models.ForeignKey(
        Clinica,
        on_delete=models.CASCADE,
        related_name='usuarios',
        verbose_name='Clínica'
    )
    
    # FILIAL - Filial do usuário (null para GESTOR_GERAL que acessa todas)
    filial = models.ForeignKey(
        Filial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios',
        verbose_name='Filial',
        help_text='Filial do usuário. Deixe vazio para Gestor Geral.'
    )
    
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='FISIOTERAPEUTA',
        verbose_name='Tipo de Usuário'
    )
    
    # Informações Profissionais
    crefito = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='CREFITO (apenas Fisioterapeuta)'
    )
    
    especialidade = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Especialidade'
    )
    
    # Contato
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Telefone'
    )
    
    cpf = models.CharField(
        max_length=14,
        unique=True,
        verbose_name='CPF'
    )
    
    profile_picture = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True,
        verbose_name='Foto de Perfil'
    )
    
    # Status
    is_active_user = models.BooleanField(
        default=True,
        verbose_name='Usuário Ativo'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']
    
    def __str__(self):
        filial_info = f" - {self.filial.nome}" if self.filial else " (Rede)"
        return f"{self.get_full_name() or self.username} ({self.get_user_type_display()}){filial_info}"
    
    # ==================== PROPRIEDADES DE PAPEL ====================
    
    @property
    def is_gestor_geral(self):
        """Gestor geral da rede - pode gerenciar todas as filiais"""
        return self.user_type == 'GESTOR_GERAL'
    
    @property
    def is_gestor_filial(self):
        """Gestor de filial - gerencia apenas sua filial"""
        return self.user_type == 'GESTOR_FILIAL'
    
    @property
    def is_gestor(self):
        """Qualquer tipo de gestor (geral ou filial)"""
        return self.is_gestor_geral or self.is_gestor_filial
    
    @property
    def is_fisioterapeuta(self):
        """Fisioterapeuta - atende pacientes"""
        return self.user_type == 'FISIOTERAPEUTA'
    
    @property
    def is_atendente(self):
        """Atendente/Recepção - gerencia agenda e cadastros básicos"""
        return self.user_type == 'ATENDENTE'
    
    # ==================== MÉTODOS DE PERMISSÃO ====================
    
    def can_manage_users(self):
        """
        Verifica se pode gerenciar usuários.
        - Gestor Geral: gerencia todos os usuários da rede
        - Gestor Filial: gerencia apenas usuários da sua filial
        """
        return self.is_gestor
    
    def can_manage_user(self, target_user):
        """
        Verifica se pode gerenciar um usuário específico.
        - Gestor Geral: pode gerenciar qualquer usuário da rede
        - Gestor Filial: pode gerenciar apenas usuários da sua filial
        """
        if self.clinica_id != target_user.clinica_id:
            return False
        
        if self.is_gestor_geral:
            return True
        
        if self.is_gestor_filial:
            return target_user.filial_id == self.filial_id
        
        return False
    
    def can_access_clinical_data(self):
        """
        Verifica se pode acessar dados clínicos detalhados
        - Gestores e Fisioterapeutas: SIM
        - Atendente: NÃO
        """
        return self.is_gestor or self.is_fisioterapeuta
    
    def can_manage_schedule(self):
        """
        Verifica se pode gerenciar agenda/sessões
        - Gestores e Atendente: podem criar/editar/cancelar sessões
        - Fisioterapeuta: apenas visualiza sua própria agenda
        """
        return self.is_gestor or self.is_atendente
    
    def can_manage_inventory(self):
        """Apenas gestores podem gerenciar estoque"""
        return self.is_gestor
    
    def can_view_reports(self):
        """
        Verifica se pode ver relatórios.
        - Gestor Geral: relatórios globais de toda a rede
        - Gestor Filial: relatórios apenas da sua filial
        """
        return self.is_gestor
    
    def can_access_filial(self, filial):
        """
        Verifica se pode acessar uma filial específica.
        - Gestor Geral: acessa todas as filiais da rede
        - Outros: apenas sua própria filial
        """
        if filial.clinica_id != self.clinica_id:
            return False
        
        if self.is_gestor_geral:
            return True
        
        return self.filial_id == filial.id
    
    def can_access_patient(self, paciente):
        """
        Verifica se o usuário pode acessar um paciente.
        - Gestor Geral: acessa todos os pacientes da rede
        - Gestor Filial: acessa todos os pacientes da sua filial
        - Fisioterapeuta: acessa apenas seus próprios pacientes
        - Atendente: acessa dados básicos de todos os pacientes da filial
        """
        # Sempre verificar se pertence à mesma clínica
        if self.clinica_id != paciente.clinica_id:
            return False
        
        # Gestor Geral acessa todos
        if self.is_gestor_geral:
            return True
        
        # Gestor Filial acessa todos da sua filial
        if self.is_gestor_filial:
            return paciente.filial_id == self.filial_id
        
        # Fisioterapeuta acessa apenas seus pacientes
        if self.is_fisioterapeuta:
            return paciente.fisioterapeuta_id == self.id
        
        # Atendente acessa todos da filial (mas apenas dados básicos, não clínicos)
        if self.is_atendente:
            return paciente.filial_id == self.filial_id
        
        return False
    
    def can_access_patient_clinical_data(self, paciente):
        """
        Verifica se pode acessar dados CLÍNICOS de um paciente.
        - Gestor Geral: acessa todos
        - Gestor Filial: acessa todos da filial
        - Fisioterapeuta: apenas seus pacientes
        - Atendente: NUNCA
        """
        if not self.can_access_clinical_data():
            return False
        
        return self.can_access_patient(paciente)
    
    def can_transfer_patient(self, paciente, to_filial=None):
        """
        Verifica se pode transferir um paciente.
        - Gestor Geral: pode transferir qualquer paciente para qualquer filial
        - Gestor Filial: pode transferir pacientes da sua filial para qualquer filial
        - Fisioterapeuta: pode transferir seus próprios pacientes (apenas intra-filial)
        """
        # Verificar se pode acessar o paciente
        if not self.can_access_patient(paciente):
            return False
        
        # Gestor Geral pode transferir para qualquer lugar
        if self.is_gestor_geral:
            return True
        
        # Gestor Filial pode transferir pacientes da sua filial
        if self.is_gestor_filial:
            return paciente.filial_id == self.filial_id
        
        # Fisioterapeuta pode transferir seus pacientes dentro da mesma filial
        if self.is_fisioterapeuta:
            if paciente.fisioterapeuta_id != self.id:
                return False
            # Se for transferência inter-filial, não pode
            if to_filial and to_filial.id != self.filial_id:
                return False
            return True
        
        return False


class Lead(models.Model):
    """
    Captura de interesse de novas clínicas
    Leads são clínicas que demonstraram interesse em contratar o PhysioCapture
    A equipe Core Hive entra em contato e converte o lead em cliente
    """
    
    STATUS_CHOICES = [
        ('NOVO', 'Novo Lead'),
        ('CONTATO', 'Em Contato'),
        ('DEMONSTRACAO', 'Demonstração Agendada'),
        ('PROPOSTA', 'Proposta Enviada'),
        ('CONVERTIDO', 'Convertido em Cliente'),
        ('PERDIDO', 'Lead Perdido'),
    ]
    
    # Informações da Clínica
    nome_clinica = models.CharField(max_length=255, verbose_name='Nome da Clínica')
    nome_responsavel = models.CharField(max_length=255, verbose_name='Nome do Responsável')
    email = models.EmailField(verbose_name='Email')
    telefone = models.CharField(max_length=20, verbose_name='Telefone')
    num_fisioterapeutas = models.IntegerField(
        default=1,
        verbose_name='Número de Fisioterapeutas',
        help_text='Quantidade estimada de profissionais que usarão o sistema'
    )
    mensagem = models.TextField(blank=True, verbose_name='Mensagem')
    
    # Controle
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NOVO',
        verbose_name='Status'
    )
    
    # Conversão
    clinica_convertida = models.ForeignKey(
        Clinica,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leads',
        verbose_name='Clínica Convertida',
        help_text='Preenchido quando o lead se torna cliente'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Data de Cadastro')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última Atualização')
    
    # Observações internas (Core Hive)
    notas = models.TextField(
        blank=True,
        verbose_name='Notas Internas',
        help_text='Observações da equipe Core Hive'
    )
    
    class Meta:
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nome_clinica} - {self.get_status_display()}"
    
    @property
    def dias_desde_criacao(self):
        """Quantos dias desde que o lead foi criado"""
        from django.utils import timezone
        delta = timezone.now() - self.created_at
        return delta.days

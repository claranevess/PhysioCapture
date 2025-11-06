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


class User(AbstractUser):
    """
    USUÁRIOS DO SISTEMA - Apenas quem pode fazer LOGIN
    
    GESTOR: Gerencia a clínica, cadastra fisioterapeutas
    FISIOTERAPEUTA: Atende pacientes, gerencia prontuários
    
    IMPORTANTE: Pacientes NÃO são usuários! São apenas registros de dados.
    """
    
    USER_TYPE_CHOICES = [
        ('GESTOR', 'Gestor da Clínica'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
    ]
    USER_TYPE_CHOICES = [
        ('GESTOR', 'Gestor da Clínica'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
    ]
    
    # TENANT - Cada usuário pertence a uma clínica
    clinica = models.ForeignKey(
        Clinica,
        on_delete=models.CASCADE,
        related_name='usuarios',
        verbose_name='Clínica'
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
        # Um CPF pode existir em múltiplas clínicas (improvável, mas possível)
        # Mas username deve ser único globalmente
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_user_type_display()}) - {self.clinica.nome}"
    
    @property
    def is_gestor(self):
        """Gestor da clínica - pode gerenciar fisioterapeutas"""
        return self.user_type == 'GESTOR'
    
    @property
    def is_fisioterapeuta(self):
        """Fisioterapeuta - atende pacientes"""
        return self.user_type == 'FISIOTERAPEUTA'
    
    def can_manage_users(self):
        """Apenas gestores podem criar/editar usuários"""
        return self.is_gestor
    
    def can_access_patient(self, paciente):
        """
        Verifica se o usuário pode acessar um paciente
        - Gestor: acessa todos os pacientes da sua clínica
        - Fisioterapeuta: acessa apenas seus próprios pacientes
        """
        if self.clinica_id != paciente.clinica_id:
            return False
        
        if self.is_gestor:
            return True
        
        if self.is_fisioterapeuta:
            return paciente.fisioterapeuta_id == self.id
        
        return False

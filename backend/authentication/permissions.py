"""
Classes de permissão customizadas para o PhysioCapture
Controle de acesso baseado em papéis (GESTOR, FISIOTERAPEUTA, ATENDENTE)
"""

from rest_framework import permissions


class IsGestor(permissions.BasePermission):
    """
    Permite acesso apenas para usuários com papel GESTOR
    """
    message = "Apenas gestores podem acessar este recurso."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_gestor
        )


class IsFisioterapeuta(permissions.BasePermission):
    """
    Permite acesso apenas para usuários com papel FISIOTERAPEUTA
    """
    message = "Apenas fisioterapeutas podem acessar este recurso."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_fisioterapeuta
        )


class IsAtendente(permissions.BasePermission):
    """
    Permite acesso apenas para usuários com papel ATENDENTE
    """
    message = "Apenas atendentes podem acessar este recurso."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_atendente
        )


class IsGestorOrFisioterapeuta(permissions.BasePermission):
    """
    Permite acesso para GESTOR ou FISIOTERAPEUTA
    """
    message = "Apenas gestores ou fisioterapeutas podem acessar este recurso."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_gestor or request.user.is_fisioterapeuta)
        )


class IsGestorOrAtendente(permissions.BasePermission):
    """
    Permite acesso para GESTOR ou ATENDENTE (gerenciamento de agenda)
    """
    message = "Apenas gestores ou atendentes podem acessar este recurso."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_gestor or request.user.is_atendente)
        )


class CanAccessPatient(permissions.BasePermission):
    """
    Verifica se o usuário pode acessar o paciente específico
    - Gestor: acessa todos os pacientes da clínica
    - Fisioterapeuta: acessa apenas seus pacientes
    - Atendente: acessa dados básicos de todos os pacientes
    """
    message = "Você não tem permissão para acessar este paciente."
    
    def has_object_permission(self, request, view, obj):
        # obj pode ser o próprio paciente ou um objeto relacionado
        from prontuario.models import Patient
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Se obj é um paciente
        if isinstance(obj, Patient):
            patient = obj
        # Se obj tem um campo patient
        elif hasattr(obj, 'patient'):
            patient = obj.patient
        # Se obj tem um campo paciente
        elif hasattr(obj, 'paciente'):
            patient = obj.paciente
        else:
            return False
        
        return request.user.can_access_patient(patient)


class CanAccessClinicalData(permissions.BasePermission):
    """
    Verifica se o usuário pode acessar dados clínicos
    Atendentes são BLOQUEADOS de conteúdo clínico
    """
    message = "Você não tem permissão para acessar dados clínicos."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.can_access_clinical_data()
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar se pode acessar dados clínicos
        if not request.user.can_access_clinical_data():
            return False
        
        # Se for gestor, pode acessar todos
        if request.user.is_gestor:
            return True
        
        # Se for fisioterapeuta, verificar se é o paciente dele
        from prontuario.models import Patient
        
        if isinstance(obj, Patient):
            patient = obj
        elif hasattr(obj, 'patient'):
            patient = obj.patient
        elif hasattr(obj, 'paciente'):
            patient = obj.paciente
        else:
            return True  # Não é relacionado a paciente
        
        return request.user.can_access_patient(patient)


class CanManageSchedule(permissions.BasePermission):
    """
    Permite gerenciamento de agenda
    - Gestor e Atendente: podem criar/editar/cancelar sessões
    - Fisioterapeuta: apenas visualiza (método seguro)
    """
    message = "Você não tem permissão para gerenciar a agenda."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Métodos seguros (GET, HEAD, OPTIONS) permitidos para todos autenticados
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Métodos de escrita apenas para gestor e atendente
        return request.user.can_manage_schedule()


class CanManageInventory(permissions.BasePermission):
    """
    Apenas GESTOR pode gerenciar estoque
    """
    message = "Apenas gestores podem gerenciar o estoque."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Métodos seguros permitidos para gestores apenas também
        return request.user.can_manage_inventory()


class CanViewReports(permissions.BasePermission):
    """
    Apenas GESTOR pode ver relatórios globais da clínica
    """
    message = "Apenas gestores podem ver relatórios da clínica."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.can_view_reports()


class IsAuthenticatedOrDevMode(permissions.BasePermission):
    """
    Permite acesso autenticado ou em modo de desenvolvimento
    APENAS para uso durante desenvolvimento - remover em produção
    """
    def has_permission(self, request, view):
        from django.conf import settings
        
        # Em desenvolvimento, permitir sem autenticação
        if settings.DEBUG:
            return True
        
        return request.user and request.user.is_authenticated

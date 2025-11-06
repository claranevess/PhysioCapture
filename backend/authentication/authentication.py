"""
Classe de autenticação customizada para SessionAuthentication sem CSRF
Apenas para desenvolvimento - em produção usar CSRF token completo
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication sem validação de CSRF
    Use apenas em desenvolvimento ou APIs que não modificam dados sensíveis
    """
    def enforce_csrf(self, request):
        return  # Não faz nada, bypass da verificação de CSRF

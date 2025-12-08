# -*- coding: utf-8 -*-
"""
Assistant App Configuration
"""

from django.apps import AppConfig


class AssistantConfig(AppConfig):
    """Configuração do app de assistente de IA."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'assistant'
    verbose_name = 'Assistente de IA'

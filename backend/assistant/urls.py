# -*- coding: utf-8 -*-
"""
Assistant App URL Configuration
"""

from django.urls import path

from .views import assistant_view, assistant_status_view

urlpatterns = [
    # Endpoint principal do assistente
    path("assistant/", assistant_view, name="assistant"),
    
    # Endpoint de status (para verificar se o modelo está disponível)
    path("assistant/status/", assistant_status_view, name="assistant_status"),
]

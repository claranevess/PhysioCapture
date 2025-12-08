# -*- coding: utf-8 -*-
"""
Physio AI Module
================
Módulo de IA para o Physio Capture usando Hugging Face Inference API.
"""

from .huggingface_llm import ask_physio_assistant, check_model_status

__all__ = ['ask_physio_assistant', 'check_model_status']

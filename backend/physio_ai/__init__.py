# -*- coding: utf-8 -*-
"""
Physio AI Module
================
Módulo de IA local para o Physio Capture usando llama-cpp-python.
"""

from .local_llm import get_llm, ask_physio_assistant

__all__ = ['get_llm', 'ask_physio_assistant']

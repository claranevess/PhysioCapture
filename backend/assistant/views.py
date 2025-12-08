# -*- coding: utf-8 -*-
"""
Assistant Views
===============
Views para o endpoint do assistente de IA do Physio Capture.
"""

import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from physio_ai import ask_physio_assistant
from physio_ai.huggingface_llm import check_model_status

# Configuração de logging
logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def assistant_view(request):
    """
    Endpoint para o assistente de IA do Physio Capture.
    
    Recebe uma pergunta do usuário e retorna a resposta gerada pelo modelo local.
    
    Request (POST):
        Content-Type: application/json
        Body: {"message": "Sua pergunta sobre o Physio Capture"}
    
    Response (success - 200):
        {"answer": "Resposta do assistente"}
    
    Response (error - 400/500):
        {"error": "Descrição do erro", "detail": "Detalhes adicionais"}
    """
    try:
        # Parse do JSON de entrada
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {
                    "error": "Formato de requisição inválido",
                    "detail": "O corpo da requisição deve ser um JSON válido."
                },
                status=400
            )
        
        # Extrai a mensagem
        message = data.get("message", "").strip()
        
        # Valida se a mensagem não está vazia
        if not message:
            return JsonResponse(
                {
                    "error": "Mensagem vazia",
                    "detail": "O campo 'message' é obrigatório e não pode estar vazio."
                },
                status=400
            )
        
        # Limita o tamanho da mensagem (segurança)
        if len(message) > 2000:
            return JsonResponse(
                {
                    "error": "Mensagem muito longa",
                    "detail": "A mensagem não pode ter mais de 2000 caracteres."
                },
                status=400
            )
        
        logger.info(f"Recebida pergunta do assistente: {message[:100]}...")
        
        # Chama o assistente de IA
        answer = ask_physio_assistant(message)
        
        logger.info(f"Resposta gerada com sucesso ({len(answer)} caracteres)")
        
        return JsonResponse({"answer": answer})
        
    except FileNotFoundError as e:
        logger.error(f"Modelo não encontrado: {str(e)}")
        return JsonResponse(
            {
                "error": "Modelo de IA não disponível",
                "detail": "O arquivo do modelo não foi encontrado. Por favor, contate o administrador do sistema."
            },
            status=503
        )
        
    except ImportError as e:
        logger.error(f"Dependência não instalada: {str(e)}")
        return JsonResponse(
            {
                "error": "Serviço de IA não configurado",
                "detail": "A biblioteca de IA não está instalada corretamente."
            },
            status=503
        )
        
    except ValueError as e:
        logger.warning(f"Erro de validação: {str(e)}")
        return JsonResponse(
            {
                "error": "Erro de validação",
                "detail": str(e)
            },
            status=400
        )
        
    except Exception as e:
        logger.error(f"Erro inesperado no assistente: {str(e)}", exc_info=True)
        return JsonResponse(
            {
                "error": "Erro ao processar a pergunta",
                "detail": "Ocorreu um erro interno. Por favor, tente novamente."
            },
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
def assistant_status_view(request):
    """
    Endpoint para verificar o status do assistente de IA.
    
    Response (200):
        {
            "status": "ok" | "unavailable",
            "model_exists": true/false,
            "model_loaded": true/false,
            "llama_cpp_installed": true/false,
            ...
        }
    """
    try:
        status_info = check_model_status()
        
        # Determina o status geral
        if status_info["model_exists"] and status_info["llama_cpp_installed"]:
            status_info["status"] = "ok"
        else:
            status_info["status"] = "unavailable"
        
        return JsonResponse(status_info)
        
    except Exception as e:
        logger.error(f"Erro ao verificar status: {str(e)}")
        return JsonResponse(
            {
                "status": "error",
                "error": str(e)
            },
            status=500
        )

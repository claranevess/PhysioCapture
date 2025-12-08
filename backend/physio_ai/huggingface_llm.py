# -*- coding: utf-8 -*-
"""
Hugging Face LLM Module for Physio Capture
============================================

Este módulo gerencia a integração com o modelo de linguagem via Hugging Face
Inference API. Usa o modelo OpenAI GPT-OSS 20B.

Uso:
    from physio_ai import ask_physio_assistant
    resposta = ask_physio_assistant("Como cadastrar um paciente?")
"""

import os
import re
import logging

from django.conf import settings

# Configuração de logging
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURAÇÕES DO MODELO
# ============================================================================

# Modelo padrão
DEFAULT_MODEL = "openai/gpt-oss-20b"

# Obtém configurações via settings ou variáveis de ambiente
def get_api_token():
    """Retorna o token da API do Hugging Face."""
    return getattr(settings, 'HUGGINGFACE_API_TOKEN', '') or os.environ.get('HUGGINGFACE_API_TOKEN', '')

def get_model_id():
    """Retorna o ID do modelo a ser usado."""
    return getattr(settings, 'HUGGINGFACE_MODEL', DEFAULT_MODEL)

# Parâmetros de geração
GENERATION_CONFIG = {
    "temperature": 0.5,
    "max_new_tokens": 1024,
    "top_p": 0.9,
}

# ============================================================================
# SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT = """Você é o assistente oficial do sistema Physio Capture, uma plataforma de gestão clínica para fisioterapia.

REGRAS OBRIGATÓRIAS:
1. SEMPRE responda em português do Brasil.
2. NUNCA mostre seu processo de pensamento ou tags <think>.
3. Responda diretamente à pergunta do usuário.
4. Seja claro, objetivo e didático.
5. Use emojis para tornar a resposta amigável.

FUNCIONALIDADES DO SISTEMA:

📋 PRONTUÁRIO ELETRÔNICO:
- Cadastro de pacientes com dados pessoais e foto
- Histórico clínico completo
- Evolução do tratamento

📅 AGENDAMENTO:
- Marcação de consultas e sessões
- Calendário de disponibilidade
- Notificações

📷 DIGITALIZAÇÃO DE DOCUMENTOS:
- Upload de documentos (PDF, imagens)
- OCR para extrair texto automaticamente
- Organização por categorias

📊 RELATÓRIOS:
- Relatórios clínicos
- Relatórios administrativos
- Estatísticas

EXEMPLOS DE RESPOSTAS:
- Se perguntarem sobre cadastro de paciente: explique os passos no menu Pacientes > Novo Paciente
- Se perguntarem sobre documentos: explique o fluxo de digitalização e OCR
- Se perguntarem sobre prontuário: explique as abas e campos disponíveis"""


# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def clean_response(text: str) -> str:
    """
    Limpa a resposta do modelo, removendo tags de pensamento.
    
    O modelo pode adicionar seções <think>...</think> com seu processo
    de raciocínio. Esta função remove essas seções e retorna apenas a resposta final.
    
    Args:
        text: Texto da resposta do modelo.
    
    Returns:
        str: Texto limpo, apenas com a resposta final.
    """
    if not text:
        return ""
    
    # Se houver </think>, pega apenas o conteúdo DEPOIS dele
    if '</think>' in text.lower():
        match = re.search(r'</think>', text, re.IGNORECASE)
        if match:
            text = text[match.end():]
    
    # Remove qualquer tag <think> de abertura que sobrou
    text = re.sub(r'<think>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<thinking>', '', text, flags=re.IGNORECASE)
    
    # Remove tags de fechamento órfãs
    text = re.sub(r'</think>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</thinking>', '', text, flags=re.IGNORECASE)
    
    # Remove blocos completos <think>...</think> que ainda possam existir
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove espaços extras e quebras de linha no início/fim
    text = text.strip()
    
    # Remove múltiplas quebras de linha consecutivas
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text


# ============================================================================
# FUNÇÕES PRINCIPAIS
# ============================================================================

def ask_physio_assistant(message: str) -> str:
    """
    Envia uma pergunta ao assistente Physio Capture via Hugging Face API.
    
    Args:
        message: A pergunta do usuário sobre o sistema Physio Capture.
    
    Returns:
        str: A resposta gerada pelo modelo de IA.
    
    Raises:
        ValueError: Se a mensagem estiver vazia.
        ImportError: Se huggingface_hub não estiver instalado.
        Exception: Se ocorrer erro na geração da resposta.
    """
    # Validação de entrada
    if not message or not message.strip():
        raise ValueError("A mensagem não pode estar vazia.")
    
    message = message.strip()
    logger.info(f"Processando pergunta via Hugging Face: {message[:100]}...")
    
    # Importação lazy para evitar erros se a biblioteca não estiver instalada
    try:
        from huggingface_hub import InferenceClient
    except ImportError as e:
        logger.error("huggingface_hub não está instalado. Execute: pip install huggingface_hub")
        raise ImportError(
            "A biblioteca huggingface_hub é necessária. "
            "Instale com: pip install huggingface_hub"
        ) from e
    
    # Verifica token
    api_token = get_api_token()
    if not api_token:
        raise ValueError(
            "Token da API do Hugging Face não configurado. "
            "Defina HUGGINGFACE_API_TOKEN no arquivo .env"
        )
    
    # Cria o cliente
    client = InferenceClient(token=api_token)
    
    # Monta a lista de mensagens para o chat
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": message},
    ]
    
    # Gera a resposta
    try:
        response = client.chat_completion(
            model=get_model_id(),
            messages=messages,
            temperature=GENERATION_CONFIG["temperature"],
            max_tokens=GENERATION_CONFIG["max_new_tokens"],
            top_p=GENERATION_CONFIG["top_p"],
        )
        
        # Extrai o texto da resposta
        answer = response.choices[0].message.content
        
        # Limpa a resposta (remove tags de pensamento e espaços extras)
        answer = clean_response(answer)
        
        logger.info(f"Resposta gerada com sucesso ({len(answer)} caracteres)")
        return answer
        
    except Exception as e:
        logger.error(f"Erro ao gerar resposta: {str(e)}")
        raise


def check_model_status() -> dict:
    """
    Verifica o status da configuração do Hugging Face.
    
    Returns:
        dict: Dicionário com informações sobre o status da configuração.
    """
    status = {
        "model_id": get_model_id(),
        "api_token_configured": bool(get_api_token()),
        "huggingface_hub_installed": False,
        "status": "unavailable",
    }
    
    # Verifica se huggingface_hub está instalado
    try:
        import huggingface_hub
        status["huggingface_hub_installed"] = True
        status["huggingface_hub_version"] = getattr(huggingface_hub, "__version__", "unknown")
    except ImportError:
        pass
    
    # Determina status geral
    if status["api_token_configured"] and status["huggingface_hub_installed"]:
        status["status"] = "ok"
    
    return status

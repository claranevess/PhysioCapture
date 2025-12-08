# -*- coding: utf-8 -*-
"""
Local LLM Module for Physio Capture
====================================

Este módulo gerencia a integração com o modelo de linguagem local (LLM)
usando llama-cpp-python. O modelo DeepSeek-R1-Distill-Qwen-1.5B-Q8_0 é
carregado uma única vez (singleton) e reutilizado para todas as requisições.

Uso:
    from physio_ai import ask_physio_assistant
    resposta = ask_physio_assistant("Como cadastrar um paciente?")
"""

import os
import re
import logging
from functools import lru_cache
from pathlib import Path

# Configuração de logging
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURAÇÕES DO MODELO
# ============================================================================

# Caminho padrão do modelo (relativo ao diretório backend)
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent / "models_llm" / "DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf"

# Obtém o caminho do modelo via variável de ambiente ou usa o padrão
MODEL_PATH = os.environ.get("PHYSIO_LLM_MODEL", str(DEFAULT_MODEL_PATH))

# Parâmetros do modelo
MODEL_CONFIG = {
    "n_ctx": 4096,           # Tamanho do contexto
    "n_threads": os.cpu_count() or 4,  # Número de threads (baseado em CPUs)
    "verbose": False,        # Desativa logs verbosos em produção
}

# Parâmetros de geração
GENERATION_CONFIG = {
    "temperature": 0.5,      # Temperatura moderada para respostas variadas mas coerentes
    "max_tokens": 1024,      # Máximo de tokens na resposta
    "top_p": 0.9,            # Nucleus sampling
    "top_k": 40,             # Top-k sampling
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
    Limpa a resposta do modelo DeepSeek-R1, removendo tags de pensamento.
    
    O modelo DeepSeek-R1 adiciona seções <think>...</think> com seu processo
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
        # Encontra a posição do </think> (case insensitive)
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

@lru_cache(maxsize=1)
def get_llm():
    """
    Carrega e retorna a instância do modelo LLM.
    
    Usa @lru_cache para garantir que o modelo seja carregado apenas uma vez
    (padrão singleton), evitando recarregamentos e melhorando a performance.
    
    Returns:
        llama_cpp.Llama: Instância do modelo carregado.
    
    Raises:
        FileNotFoundError: Se o arquivo do modelo não existir.
        ImportError: Se llama-cpp-python não estiver instalado.
    """
    # Importação lazy para evitar erros se a biblioteca não estiver instalada
    try:
        from llama_cpp import Llama
    except ImportError as e:
        logger.error("llama-cpp-python não está instalado. Execute: pip install llama-cpp-python")
        raise ImportError(
            "A biblioteca llama-cpp-python é necessária. "
            "Instale com: pip install llama-cpp-python"
        ) from e
    
    # Verifica se o arquivo do modelo existe
    model_path = Path(MODEL_PATH)
    if not model_path.exists():
        error_msg = (
            f"Arquivo do modelo não encontrado: {model_path}\n"
            f"Por favor, baixe o modelo DeepSeek-R1-Distill-Qwen-1.5B-Q8_0.gguf "
            f"e coloque-o na pasta: {model_path.parent}"
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    logger.info(f"Carregando modelo LLM de: {model_path}")
    logger.info(f"Configurações: n_ctx={MODEL_CONFIG['n_ctx']}, n_threads={MODEL_CONFIG['n_threads']}")
    
    # Carrega o modelo
    llm = Llama(
        model_path=str(model_path),
        n_ctx=MODEL_CONFIG["n_ctx"],
        n_threads=MODEL_CONFIG["n_threads"],
        verbose=MODEL_CONFIG["verbose"],
        chat_format="chatml",  # Formato de chat compatível com DeepSeek
    )
    
    logger.info("Modelo LLM carregado com sucesso!")
    return llm


def ask_physio_assistant(message: str) -> str:
    """
    Envia uma pergunta ao assistente Physio Capture e retorna a resposta.
    
    Args:
        message: A pergunta do usuário sobre o sistema Physio Capture.
    
    Returns:
        str: A resposta gerada pelo modelo de IA.
    
    Raises:
        ValueError: Se a mensagem estiver vazia.
        Exception: Se ocorrer erro na geração da resposta.
    """
    # Validação de entrada
    if not message or not message.strip():
        raise ValueError("A mensagem não pode estar vazia.")
    
    message = message.strip()
    logger.info(f"Processando pergunta: {message[:100]}...")
    
    # Obtém a instância do modelo
    llm = get_llm()
    
    # Monta a lista de mensagens para o chat
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": message},
    ]
    
    # Gera a resposta
    try:
        response = llm.create_chat_completion(
            messages=messages,
            temperature=GENERATION_CONFIG["temperature"],
            max_tokens=GENERATION_CONFIG["max_tokens"],
            top_p=GENERATION_CONFIG["top_p"],
            top_k=GENERATION_CONFIG["top_k"],
        )
        
        # Extrai o texto da resposta
        answer = response["choices"][0]["message"]["content"]
        
        # Limpa a resposta (remove tags de pensamento e espaços extras)
        answer = clean_response(answer)
        
        logger.info(f"Resposta gerada com sucesso ({len(answer)} caracteres)")
        return answer
        
    except Exception as e:
        logger.error(f"Erro ao gerar resposta: {str(e)}")
        raise


def check_model_status() -> dict:
    """
    Verifica o status do modelo e retorna informações de diagnóstico.
    
    Returns:
        dict: Dicionário com informações sobre o status do modelo.
    """
    model_path = Path(MODEL_PATH)
    
    status = {
        "model_path": str(model_path),
        "model_exists": model_path.exists(),
        "model_size_mb": None,
        "llama_cpp_installed": False,
        "model_loaded": False,
        "n_threads": MODEL_CONFIG["n_threads"],
        "n_ctx": MODEL_CONFIG["n_ctx"],
    }
    
    # Verifica tamanho do modelo
    if model_path.exists():
        status["model_size_mb"] = round(model_path.stat().st_size / (1024 * 1024), 2)
    
    # Verifica se llama-cpp-python está instalado
    try:
        import llama_cpp
        status["llama_cpp_installed"] = True
        status["llama_cpp_version"] = getattr(llama_cpp, "__version__", "unknown")
    except ImportError:
        pass
    
    # Verifica se o modelo já foi carregado
    try:
        # Tenta acessar o cache do get_llm
        if get_llm.cache_info().hits > 0 or get_llm.cache_info().currsize > 0:
            status["model_loaded"] = True
    except Exception:
        pass
    
    return status

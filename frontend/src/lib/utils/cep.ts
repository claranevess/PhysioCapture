// Função para formatar CEP
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
}

// Interface para resposta do CEP
interface CEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface AddressData {
  street: string
  neighborhood: string
  city: string
  state: string
}

// Função auxiliar para fazer fetch com timeout
async function fetchWithTimeout(url: string, timeout: number = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    // Usar fetch com configurações mais básicas para melhor compatibilidade
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    // Capturar erros específicos
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout na requisição')
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        throw new Error('Erro de rede')
      }
    }
    
    throw error
  }
}

// Função para buscar endereço por CEP via ViaCEP com retry automático
export async function fetchAddressByCEP(cep: string, maxRetries: number = 2): Promise<AddressData> {
  const cleanCEP = cep.replace(/\D/g, '')
  
  // Validação básica
  if (!cleanCEP || cleanCEP.length !== 8) {
    throw new Error('CEP deve ter exatamente 8 dígitos')
  }

  // Validar padrão do CEP (não pode ser sequencial como 00000000)
  if (/^(\d)\1{7}$/.test(cleanCEP)) {
    throw new Error('CEP inválido')
  }

  let lastError: Error | null = null
  
  // Primeiro tenta o ViaCEP
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `https://viacep.com.br/ws/${cleanCEP}/json/`,
        8000 // 8 segundos de timeout
      )

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
      }

      const data: CEPResponse = await response.json()

      // Verificar se o CEP foi encontrado
      if (data.erro === true) {
        throw new Error('CEP não encontrado na base de dados dos Correios')
      }

      // Verificar se retornou dados válidos
      if (!data.localidade && !data.uf) {
        throw new Error('CEP não encontrado ou dados incompletos')
      }
      
      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido')
      
      // Se não é o último retry e o erro pode ser temporário, tenta novamente
      const isRetryableError = (
        lastError.name === 'AbortError' || // Timeout
        lastError.message.includes('NetworkError') || // Erro de rede
        lastError.message.includes('fetch') || // Erro de fetch
        lastError.message.includes('network') || // Erro de network
        lastError.message.includes('Failed to fetch') || // Falha no fetch
        lastError.message.includes('Erro de rede') || // Nossa mensagem personalizada
        lastError.message.includes('Timeout na requisição') || // Nossa mensagem de timeout
        lastError.message.toLowerCase().includes('connection') // Erro de conexão
      )
      
      if (attempt < maxRetries && isRetryableError) {
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000))
        continue
      }
      
      // Se chegou aqui, todas as tentativas falharam ou é um erro não-retentável
      
      // Personalizar mensagem de erro baseada no tipo
      if (lastError.message.includes('CEP não encontrado') || lastError.message.includes('não encontrado na base')) {
        throw new Error('CEP não encontrado. Verifique se o CEP está correto.')
      } else if (lastError.message.includes('CEP inválido') || lastError.message.includes('8 dígitos')) {
        throw lastError // Manter mensagem original para erros de validação
      } else if (lastError.name === 'AbortError' || lastError.message.includes('timeout') || lastError.message.includes('Timeout na requisição')) {
        throw new Error('Tempo limite esgotado. Verifique sua conexão e tente novamente.')
      } else if (
        lastError.message.includes('NetworkError') ||
        lastError.message.includes('Failed to fetch') ||
        lastError.message.includes('fetch') ||
        lastError.message.includes('network') ||
        lastError.message.includes('Erro de rede') ||
        lastError.message.toLowerCase().includes('connection')
      ) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else if (lastError.message.includes('HTTP')) {
        throw new Error('Serviço de CEP temporariamente indisponível. Tente novamente.')
      } else {
        throw new Error('Erro ao buscar CEP. Tente novamente em alguns instantes.')
      }
    }
  }
  
  // Fallback (nunca deveria chegar aqui)
  throw new Error('Erro interno ao buscar CEP')
}

// Função para validar CEP com verificações mais robustas
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  
  // Verificar se tem 8 dígitos
  if (cleanCEP.length !== 8) {
    return false
  }
  
  // Verificar se não é sequencial (como 00000000, 11111111, etc.)
  if (/^(\d)\1{7}$/.test(cleanCEP)) {
    return false
  }
  
  // Verificar se não é um CEP obviamente inválido
  const invalidCEPs = ['00000000', '99999999']
  if (invalidCEPs.includes(cleanCEP)) {
    return false
  }
  
  return true
}

// Função para obter mensagem de validação do CEP
export function getCEPValidationMessage(cep: string): string | null {
  const cleanCEP = cep.replace(/\D/g, '')
  
  if (cleanCEP.length === 0) {
    return 'CEP é obrigatório'
  }
  
  if (cleanCEP.length < 8) {
    return 'CEP deve ter 8 dígitos'
  }
  
  if (cleanCEP.length > 8) {
    return 'CEP deve ter exatamente 8 dígitos'
  }
  
  if (/^(\d)\1{7}$/.test(cleanCEP)) {
    return 'CEP inválido (não pode ser sequencial)'
  }
  
  const invalidCEPs = ['00000000', '99999999']
  if (invalidCEPs.includes(cleanCEP)) {
    return 'CEP inválido'
  }
  
  return null
}

// Função para verificar se o CEP existe (validação rápida sem buscar dados completos)
export async function checkCEPExists(cep: string): Promise<boolean> {
  const cleanCEP = cep.replace(/\D/g, '')
  
  if (!validateCEP(cleanCEP)) {
    return false
  }
  
  try {
    const response = await fetchWithTimeout(
      `https://viacep.com.br/ws/${cleanCEP}/json/`,
      3000 // timeout menor para verificação rápida
    )
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return !data.erro && (data.localidade || data.uf)
  } catch {
    return false
  }
}
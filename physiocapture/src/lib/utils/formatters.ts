// Função para formatar telefone brasileiro
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// Função para validar telefone brasileiro
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

// Função para calcular idade
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Função para formatar data brasileira
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

// Função para formatar data e hora brasileira
export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Função para calcular tempo de tratamento em dias
export function calculateTreatmentDuration(firstConsultation: Date): number {
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - firstConsultation.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Função para formatar bytes em formato legível
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
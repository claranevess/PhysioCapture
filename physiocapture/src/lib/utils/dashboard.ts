import { Period } from '@/components/dashboard/period-selector'

export function getPeriodDates(period: Period): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  switch (period) {
    case '7days':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30days':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '3months':
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case '6months':
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
  }

  return { startDate, endDate }
}

export function getLast7DaysLabels(): string[] {
  const labels: string[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Formato: "Seg 01/10"
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
    const dayNum = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    
    labels.push(`${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum}`)
  }
  
  return labels
}

export function getLast30DaysData(): Date[] {
  const dates: Date[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    dates.push(date)
  }
  
  return dates
}

export function groupConsultationsByDate(
  consultations: Array<{ date: Date }>,
  periodDays: number = 7
): Array<{ date: string; consultations: number }> {
  const today = new Date()
  const data: Array<{ date: string; consultations: number }> = []
  
  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const count = consultations.filter(c => {
      const consultDate = new Date(c.date)
      return consultDate >= date && consultDate < nextDay
    }).length
    
    const label = date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
    
    data.push({ date: label, consultations: count })
  }
  
  return data
}

export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}

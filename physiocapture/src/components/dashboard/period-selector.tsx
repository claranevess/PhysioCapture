'use client'

import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type Period = '7days' | '30days' | '3months' | '6months' | 'year'

interface PeriodSelectorProps {
  selectedPeriod: Period
  onPeriodChange: (period: Period) => void
}

const periods: Array<{ value: Period; label: string }> = [
  { value: '7days', label: '7 dias' },
  { value: '30days', label: '30 dias' },
  { value: '3months', label: '3 meses' },
  { value: '6months', label: '6 meses' },
  { value: 'year', label: '1 ano' },
]

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Período:</span>
          <div className="flex gap-2 flex-wrap">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange(period.value)}
                className={cn(
                  'transition-all',
                  selectedPeriod === period.value && 'shadow-md'
                )}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

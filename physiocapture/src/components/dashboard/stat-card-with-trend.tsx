'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatCardWithTrendProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: number // Percentual de crescimento
  description?: string
  className?: string
}

export function StatCardWithTrend({
  title,
  value,
  icon,
  trend,
  description,
  className
}: StatCardWithTrendProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground'
    return trend > 0 ? 'text-green-500' : 'text-red-500'
  }

  const TrendIcon = getTrendIcon()
  const trendColor = getTrendColor()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend !== undefined && (
            <>
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
              <span className={cn("text-xs font-medium", trendColor)}>
                {trend > 0 && '+'}{trend}%
              </span>
            </>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {trend !== undefined && '• '}{description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        primary: 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100',
        secondary: 'border-secondary-200 bg-secondary-50 text-secondary-700 hover:bg-secondary-100',
        success: 'border-success-200 bg-success-50 text-success-700 hover:bg-success-100',
        warning: 'border-warning-200 bg-warning-50 text-warning-800 hover:bg-warning-100',
        error: 'border-error-200 bg-error-50 text-error-700 hover:bg-error-100',
        outline: 'border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50',
        solid: 'border-transparent bg-neutral-900 text-white hover:bg-neutral-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, removable = false, onRemove, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
        {children}
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Remover"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

// Componentes específicos para status comuns

export function StatusBadge({ 
  status, 
  className = '',
  ...props 
}: { 
  status: string
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  const getVariant = (status: string) => {
    const statusMap = {
      'ativo': 'success',
      'em tratamento': 'success',
      'tratamento': 'success',
      'completo': 'success',
      'concluído': 'success',
      'aprovado': 'success',
      
      'inativo': 'default',
      'pausado': 'default',
      'cancelado': 'default',
      'rejeitado': 'error',
      
      'pendente': 'warning',
      'aguardando': 'warning',
      'avaliação': 'warning',
      'revisão': 'warning',
      
      'novo': 'primary',
      'agendado': 'primary',
      'confirmado': 'primary',
      
      'urgente': 'error',
      'crítico': 'error',
      'emergência': 'error',
    }
    
    const key = status.toLowerCase()
    return statusMap[key as keyof typeof statusMap] || 'default'
  }

  return (
    <Badge 
      variant={getVariant(status) as any} 
      className={className}
      {...props}
    >
      {status}
    </Badge>
  )
}

export function PriorityBadge({ 
  priority, 
  className = '',
  ...props 
}: { 
  priority: 'baixa' | 'normal' | 'alta' | 'urgente'
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  const variants = {
    baixa: 'default',
    normal: 'primary',
    alta: 'warning',
    urgente: 'error',
  }

  const icons = {
    baixa: '↓',
    normal: '→',
    alta: '↑',
    urgente: '⚠',
  }

  return (
    <Badge 
      variant={variants[priority] as any}
      icon={<span>{icons[priority]}</span>}
      className={className}
      {...props}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

export function CategoryBadge({ 
  category, 
  color,
  className = '',
  ...props 
}: { 
  category: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  return (
    <Badge 
      variant={color || 'primary'} 
      className={className}
      {...props}
    >
      {category}
    </Badge>
  )
}

export function CountBadge({ 
  count, 
  max = 99,
  className = '',
  ...props 
}: { 
  count: number
  max?: number
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <Badge 
      variant="error" 
      size="sm"
      className={cn('min-w-[20px] h-5 px-1.5 justify-center', className)}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

export function NewBadge({ 
  className = '',
  ...props 
}: { 
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  return (
    <Badge 
      variant="error" 
      size="sm"
      className={cn('animate-pulse', className)}
      {...props}
    >
      Novo
    </Badge>
  )
}

export function OnlineBadge({ 
  isOnline, 
  className = '',
  ...props 
}: { 
  isOnline: boolean
  className?: string 
} & Omit<BadgeProps, 'variant'>) {
  return (
    <Badge 
      variant={isOnline ? 'success' : 'default'} 
      size="sm"
      icon={
        <div className={cn(
          'w-2 h-2 rounded-full',
          isOnline ? 'bg-success-500' : 'bg-neutral-400'
        )} />
      }
      className={className}
      {...props}
    >
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  )
}

// Badge com tooltip
export function TooltipBadge({ 
  tooltip, 
  children,
  className = '',
  ...props 
}: { 
  tooltip: string
  children: React.ReactNode
  className?: string 
} & BadgeProps) {
  return (
    <div className="relative group">
      <Badge className={className} {...props}>
        {children}
      </Badge>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
      </div>
    </div>
  )
}

export { Badge, badgeVariants }
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl bg-white border border-neutral-200 shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-white',
        primary: 'bg-gradient-primary text-white border-primary-600',
        secondary: 'bg-gradient-secondary text-white border-secondary-600',
        success: 'bg-gradient-success text-white border-success-600',
        warning: 'bg-gradient-warning text-white border-warning-600',
        error: 'bg-gradient-error text-white border-error-600',
        bordered: 'border-l-4 border-l-primary-500',
        elevated: 'shadow-lg',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
        scale: 'hover:scale-105 transition-transform duration-200 cursor-pointer',
        glow: 'hover:shadow-primary hover:border-primary-300 transition-all duration-300 cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: 'none',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold font-display text-neutral-800 leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Componentes específicos para casos de uso comum

// Card de Estatística
export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  className = '',
  ...props 
}: {
  title: string
  value: string | number
  change?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const trendColors = {
    up: 'text-success-700 bg-success-50',
    down: 'text-error-700 bg-error-50',
    neutral: 'text-neutral-700 bg-neutral-100'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  return (
    <Card variant="default" hover="lift" className={cn('relative overflow-hidden', className)} {...props}>
      {/* Borda superior colorida */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
      
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-3xl font-bold text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-600 font-medium mt-1">{title}</p>
          </div>
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          )}
        </div>
        
        {change && (
          <span className={cn(
            'inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md',
            trendColors[trend]
          )}>
            <span>{trendIcons[trend]}</span>
            {change}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

// Card de Paciente
export function PatientCard({
  patient,
  onClick,
  className = '',
  ...props
}: {
  patient: {
    id: string
    name: string
    initials: string
    phone: string
    age: number
    lastVisit: string
    status: string
  }
  onClick?: () => void
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  
  const getStatusClass = (status: string) => {
    const classes = {
      'Em Tratamento': 'badge-success',
      'Recuperação': 'badge-primary',
      'Avaliação': 'badge-warning',
      'Inativo': 'badge-neutral',
    }
    return classes[status as keyof typeof classes] || 'badge-neutral'
  }

  return (
    <Card 
      variant="default" 
      hover="lift" 
      padding="sm"
      className={cn('cursor-pointer', className)}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {patient.initials}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{patient.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {patient.phone}
            </span>
            <span>{patient.age} anos</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Última consulta: {patient.lastVisit}
          </p>
        </div>
        
        {/* Status Badge */}
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium flex-shrink-0', getStatusClass(patient.status))}>
          {patient.status}
        </span>
      </div>
    </Card>
  )
}

// Card de Ação Rápida
export function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  className = '',
  ...props
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card 
      variant="default" 
      hover="glow" 
      className={cn('text-center', className)}
      onClick={onClick}
      {...props}
    >
      <CardContent className="pt-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="mb-2 text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

// Card de Informação
export function InfoCard({
  variant = 'primary',
  title,
  message,
  icon: Icon,
  className = '',
  ...props
}: {
  variant?: 'primary' | 'success' | 'warning' | 'error'
  title: string
  message: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  
  const variantStyles = {
    primary: 'border-l-primary-500 bg-primary-50',
    success: 'border-l-success-500 bg-success-50',
    warning: 'border-l-warning-500 bg-warning-50',
    error: 'border-l-error-500 bg-error-50',
  }

  const iconColors = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  }

  return (
    <Card 
      variant="bordered" 
      className={cn('border-l-4', variantStyles[variant], className)}
      {...props}
    >
      <CardContent className="flex items-start gap-3">
        {Icon && (
          <Icon className={cn('w-6 h-6 flex-shrink-0', iconColors[variant])} />
        )}
        <div>
          <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
          <p className="text-sm text-neutral-600">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-primary text-white shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-primary-500',
        secondary: 'bg-gradient-secondary text-white shadow-secondary hover:shadow-secondary-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-secondary-500',
        success: 'bg-gradient-success text-white shadow-success hover:shadow-success-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-success-500',
        warning: 'bg-gradient-warning text-white hover:opacity-90 focus-visible:ring-warning-500',
        danger: 'bg-gradient-error text-white hover:opacity-90 focus-visible:ring-error-500',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
        ghost: 'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        sm: 'h-9 px-4 py-2 text-sm',
        md: 'h-12 px-6 py-3 text-base',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children && <span>Carregando...</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="w-5 h-5 flex items-center justify-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="w-5 h-5 flex items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Componentes específicos para uso comum
export function PrimaryButton({ children, ...props }: ButtonProps) {
  return <Button variant="primary" {...props}>{children}</Button>
}

export function SecondaryButton({ children, ...props }: ButtonProps) {
  return <Button variant="secondary" {...props}>{children}</Button>
}

export function OutlineButton({ children, ...props }: ButtonProps) {
  return <Button variant="outline" {...props}>{children}</Button>
}

export function GhostButton({ children, ...props }: ButtonProps) {
  return <Button variant="ghost" {...props}>{children}</Button>
}

export function SuccessButton({ children, ...props }: ButtonProps) {
  return <Button variant="success" {...props}>{children}</Button>
}

export function DangerButton({ children, ...props }: ButtonProps) {
  return <Button variant="danger" {...props}>{children}</Button>
}

export function LoadingButton({ loading, children, ...props }: ButtonProps & { loading: boolean }) {
  return <Button loading={loading} {...props}>{children}</Button>
}

// Floating Action Button
export function FloatingActionButton({ 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  return (
    <Button
      variant="primary"
      size="icon"
      className={cn(
        'fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl hover:scale-110 z-50',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export { Button, buttonVariants }
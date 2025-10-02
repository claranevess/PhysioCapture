import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    iconColor: 'text-success-600',
    titleColor: 'text-success-900',
    messageColor: 'text-success-700'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    iconColor: 'text-error-600',
    titleColor: 'text-error-900',
    messageColor: 'text-error-700'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
    iconColor: 'text-warning-600',
    titleColor: 'text-warning-900',
    messageColor: 'text-warning-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    iconColor: 'text-primary-600',
    titleColor: 'text-primary-900',
    messageColor: 'text-primary-700'
  }
}

export function Notification({ type, title, message, onClose, className }: NotificationProps) {
  const config = notificationConfig[type]
  const Icon = config.icon

  return (
    <div className={cn(
      "p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-up",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 w-6 h-6", config.iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-sm font-semibold", config.titleColor)}>
            {title}
          </h4>
          {message && (
            <p className={cn("mt-1 text-sm", config.messageColor)}>
              {message}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors",
              "hover:bg-gray-200/50",
              config.iconColor
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function useNotification() {
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    // Este é um exemplo básico - em uma implementação real, você usaria um context ou store
    console.log(`${type.toUpperCase()}: ${title}${message ? ` - ${message}` : ''}`)
  }

  return { showNotification }
}
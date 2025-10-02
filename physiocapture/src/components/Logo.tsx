import React from 'react'

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ variant = 'full', className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const subtextSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  }

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary ${className}`}>
        <span className="text-white font-bold text-lg">PC</span>
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary relative overflow-hidden`}>
        {/* Pulse effect background */}
        <div className="absolute inset-0 bg-gradient-secondary opacity-30 animate-pulse-slow"></div>
        
        {/* Main icon */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Person figure */}
          <div className="w-3 h-3 rounded-full bg-white mb-0.5 opacity-90"></div>
          <div className="w-4 h-2 rounded bg-white opacity-90"></div>
          
          {/* Pulse line */}
          <svg 
            className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-4 h-2" 
            viewBox="0 0 20 8" 
            fill="none"
          >
            <path 
              d="M2 4 L5 4 L7 1 L9 7 L11 4 L18 4" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>
      
      {/* Text */}
      <div>
        <h1 className={`${textSizeClasses[size]} font-bold font-display text-gradient-primary leading-none`}>
          PhysioCapture
        </h1>
        {variant === 'full' && (
          <>
            <p className={`${subtextSizeClasses[size]} font-medium text-neutral-600 tracking-wider uppercase mt-0.5`}>
              SISTEMA DE GESTÃO
            </p>
            <div className="w-12 h-0.5 bg-gradient-primary rounded-full mt-1 opacity-80"></div>
          </>
        )}
      </div>
    </div>
  )
}

// Logo para uso em documentos/impressos
export function LogoDocument({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-secondary opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white mb-1"></div>
          <div className="w-5 h-3 rounded bg-white"></div>
          <svg 
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-6 h-3" 
            viewBox="0 0 24 12" 
            fill="none"
          >
            <path 
              d="M2 6 L6 6 L8 2 L12 10 L14 6 L22 6" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <div>
        <h1 className="text-4xl font-bold font-display text-gradient-primary">
          PhysioCapture
        </h1>
        <p className="text-sm font-medium text-neutral-600 tracking-widest uppercase">
          SISTEMA DE GESTÃO PARA FISIOTERAPIA
        </p>
        <div className="w-20 h-1 bg-gradient-primary rounded-full mt-2"></div>
      </div>
    </div>
  )
}

// Logo simplificado para uso em headers compactos
export function LogoMini({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
        <span className="text-white font-bold text-sm">PC</span>
      </div>
      <span className="text-lg font-bold font-display text-gradient-primary">
        PhysioCapture
      </span>
    </div>
  )
}
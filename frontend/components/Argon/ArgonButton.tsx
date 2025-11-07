'use client';

/**
 * Argon Button Component - PhysioCapture
 * Botões profissionais inspirados no Argon Dashboard
 */

import React from 'react';
import { argonTheme } from '@/lib/argon-theme';
import { Loader2 } from 'lucide-react';

interface ArgonButtonProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'solid' | 'outline' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const ArgonButton: React.FC<ArgonButtonProps> = ({
  children,
  variant = 'gradient',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const getStyles = () => {
    const baseStyles = {
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: argonTheme.transitions.base,
    };

    if (variant === 'gradient') {
      return {
        ...baseStyles,
        background: argonTheme.gradients[color],
        color: '#FFFFFF',
        border: 'none',
        boxShadow: argonTheme.shadows.md,
      };
    }

    if (variant === 'solid') {
      return {
        ...baseStyles,
        backgroundColor: argonTheme.colors[color].main,
        color: '#FFFFFF',
        border: 'none',
        boxShadow: argonTheme.shadows.sm,
      };
    }

    if (variant === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: argonTheme.colors[color].main,
        border: `2px solid ${argonTheme.colors[color].main}`,
      };
    }

    // text variant
    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: argonTheme.colors[color].main,
      border: 'none',
    };
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-lg inline-flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'gradient' || variant === 'solid' ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${variant === 'outline' ? 'hover:bg-opacity-10' : ''}
        ${variant === 'text' ? 'hover:bg-opacity-10' : ''}
        transition-all duration-300
        ${className}
      `}
      style={getStyles()}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

// Botão com ícone apenas (para actions)
interface ArgonIconButtonProps {
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const ArgonIconButton: React.FC<ArgonIconButtonProps> = ({
  icon,
  color = 'primary',
  size = 'md',
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-lg flex items-center justify-center
        hover:shadow-md transition-all duration-300
        ${className}
      `}
      style={{
        backgroundColor: `${argonTheme.colors[color].main}20`,
        color: argonTheme.colors[color].main,
      }}
    >
      {icon}
    </button>
  );
};

/**
 * Button Component - PhysioCapture Design System
 * Desenvolvido por Core Hive
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#14B8B8] to-[#26C2C2] text-white shadow-md hover:shadow-lg hover:scale-105 focus:ring-[#14B8B8]/30 active:scale-95',
    secondary: 'bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white shadow-md hover:shadow-lg hover:scale-105 focus:ring-[#4CAF50]/30 active:scale-95',
    accent: 'bg-gradient-to-r from-[#FF9800] to-[#FFB74D] text-white shadow-md hover:shadow-lg hover:scale-105 focus:ring-[#FF9800]/30 active:scale-95',
    outline: 'border-2 border-[#14B8B8] text-[#14B8B8] hover:bg-[#14B8B8] hover:text-white focus:ring-[#14B8B8]/30',
    ghost: 'text-[#14B8B8] hover:bg-[#E6F7F7] focus:ring-[#14B8B8]/30',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

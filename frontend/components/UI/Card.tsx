/**
 * Card Component - PhysioCapture Design System
 * Desenvolvido por Core Hive
 */

import React from 'react';
import { designTokens } from '@/lib/design-system';

interface CardProps {
  children: React.ReactNode;
  variant?: 'base' | 'elevated' | 'gradient';
  gradient?: 'primary' | 'secondary' | 'accent';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'base',
  gradient,
  className = '',
  onClick,
  hover = true,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    base: 'bg-white shadow-md',
    elevated: 'bg-white shadow-lg',
    gradient: '',
  };

  const hoverClasses = hover
    ? variant === 'gradient'
      ? 'hover:shadow-2xl hover:scale-[1.02]'
      : 'hover:shadow-xl hover:scale-[1.01]'
    : '';

  const gradientStyle = gradient
    ? { background: designTokens.colors.gradients[gradient] }
    : {};

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      style={gradient ? gradientStyle : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'accent' | 'header';
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  icon,
  gradient,
  className = '',
}) => {
  const gradientStyle = gradient
    ? { background: designTokens.colors.gradients[gradient] }
    : {};

  return (
    <div
      className={`flex items-center gap-3 p-6 ${gradient ? 'text-white rounded-t-xl' : ''} ${className}`}
      style={gradient ? gradientStyle : undefined}
    >
      {icon && (
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${gradient ? 'bg-white/20' : 'bg-gray-100'}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 rounded-b-xl bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
};

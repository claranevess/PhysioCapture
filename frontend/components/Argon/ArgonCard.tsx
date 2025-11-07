'use client';

/**
 * Argon Card Components - PhysioCapture
 * Componentes de Card inspirados no Argon Dashboard
 */

import React from 'react';
import { argonTheme } from '@/lib/argon-theme';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

// ============================================
// Base Card Component
// ============================================
interface ArgonCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ArgonCard: React.FC<ArgonCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  shadow = 'sm',
}) => {
  return (
    <div
      className={`bg-white rounded-xl transition-all duration-300 ${
        hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
      } ${className}`}
      style={{ boxShadow: argonTheme.shadows[shadow] }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ============================================
// Statistics Card (para dashboard)
// ============================================
interface ArgonStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconGradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const ArgonStatsCard: React.FC<ArgonStatsCardProps> = ({
  title,
  value,
  icon,
  iconGradient = 'primary',
  trend,
  onClick,
}) => {
  return (
    <ArgonCard hover onClick={onClick}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p 
              className="text-xs font-medium uppercase tracking-wide mb-2"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {title}
            </p>
            <p 
              className="text-4xl font-bold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              {value}
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: argonTheme.gradients[iconGradient] }}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <div 
              className="flex items-center gap-1"
              style={{ color: trend.isPositive !== false ? argonTheme.colors.success.main : argonTheme.colors.error.main }}
            >
              {trend.isPositive !== false ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-bold">{Math.abs(trend.value)}%</span>
            </div>
            <span 
              className="text-xs"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </ArgonCard>
  );
};

// ============================================
// Action Card (para ações rápidas)
// ============================================
interface ArgonActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  href?: string;
  onClick?: () => void;
}

export const ArgonActionCard: React.FC<ArgonActionCardProps> = ({
  title,
  description,
  icon,
  gradient = 'primary',
  href,
  onClick,
}) => {
  const content = (
    <div 
      className="relative p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer group"
      style={{ background: argonTheme.gradients[gradient] }}
      onClick={onClick}
    >
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
      
      <div className="relative">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
};

// ============================================
// Gradient Card (card com gradiente de fundo)
// ============================================
interface ArgonGradientCardProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark';
  className?: string;
}

export const ArgonGradientCard: React.FC<ArgonGradientCardProps> = ({
  children,
  gradient = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl p-6 shadow-lg ${className}`}
      style={{ background: argonTheme.gradients[gradient] }}
    >
      {children}
    </div>
  );
};

// ============================================
// Info Card (com header colorido)
// ============================================
interface ArgonInfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconGradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ArgonInfoCard: React.FC<ArgonInfoCardProps> = ({
  title,
  subtitle,
  icon,
  iconGradient = 'primary',
  children,
  footer,
}) => {
  return (
    <ArgonCard shadow="md">
      {/* Header */}
      <div 
        className="px-6 py-4 border-b border-gray-100"
        style={{ background: 'linear-gradient(to right, rgba(245, 247, 250, 1), transparent)' }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${argonTheme.colors[iconGradient].main}20` }}
            >
              <div style={{ color: argonTheme.colors[iconGradient].main }}>
                {icon}
              </div>
            </div>
          )}
          <div>
            <h3 
              className="text-lg font-bold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              {title}
            </h3>
            {subtitle && (
              <p 
                className="text-xs"
                style={{ color: argonTheme.colors.text.secondary }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>

      {/* Footer */}
      {footer && (
        <div 
          className="px-6 py-4 border-t border-gray-100"
          style={{ backgroundColor: argonTheme.colors.light.main }}
        >
          {footer}
        </div>
      )}
    </ArgonCard>
  );
};

// ============================================
// Avatar Group Card (para lista de usuários/pacientes)
// ============================================
interface ArgonAvatarCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  badge?: {
    text: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  onClick?: () => void;
}

export const ArgonAvatarCard: React.FC<ArgonAvatarCardProps> = ({
  name,
  subtitle,
  avatar,
  badge,
  onClick,
}) => {
  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 group cursor-pointer rounded-lg"
      onClick={onClick}
    >
      <div className="relative">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
          style={{ background: argonTheme.gradients.primary }}
        >
          {avatar || name.charAt(0)}
        </div>
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full"
          style={{ backgroundColor: argonTheme.colors.success.main }}
        />
      </div>
      <div className="flex-1">
        <h3
          className="font-semibold group-hover:text-primary transition-colors"
          style={{ color: argonTheme.colors.text.primary }}
        >
          {name}
        </h3>
        {subtitle && (
          <p 
            className="text-sm"
            style={{ color: argonTheme.colors.text.secondary }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {badge && (
        <span
          className="px-3 py-1 text-xs font-bold rounded-full text-white"
          style={{ background: argonTheme.gradients[badge.color] }}
        >
          {badge.text}
        </span>
      )}
    </div>
  );
};

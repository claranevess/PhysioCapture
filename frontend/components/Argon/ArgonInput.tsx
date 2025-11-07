'use client';

/**
 * Argon Input Component - PhysioCapture
 * Inputs profissionais inspirados no Argon Dashboard
 */

import React, { forwardRef } from 'react';
import { argonTheme } from '@/lib/argon-theme';

interface ArgonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

export const ArgonInput = forwardRef<HTMLInputElement, ArgonInputProps>(
  ({ label, error, icon, iconPosition = 'left', helperText, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
            style={{ color: argonTheme.colors.text.primary }}
          >
            {label}
            {props.required && (
              <span style={{ color: argonTheme.colors.error.main }}> *</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full py-3 border rounded-lg
              focus:outline-none focus:ring-2 transition-all
              ${icon && iconPosition === 'left' ? 'pl-11 pr-4' : ''}
              ${icon && iconPosition === 'right' ? 'pr-11 pl-4' : ''}
              ${!icon ? 'px-4' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            style={{
              borderColor: error 
                ? argonTheme.colors.error.main 
                : argonTheme.colors.grey[200],
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = argonTheme.colors.primary.main;
                e.target.style.boxShadow = argonTheme.shadows.primary;
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.borderColor = argonTheme.colors.grey[200];
                e.target.style.boxShadow = 'none';
              }
            }}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            className="text-sm mt-1"
            style={{ color: argonTheme.colors.error.main }}
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            className="text-xs mt-1"
            style={{ color: argonTheme.colors.text.secondary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ArgonInput.displayName = 'ArgonInput';

// Textarea Component
interface ArgonTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ArgonTextarea = forwardRef<HTMLTextAreaElement, ArgonTextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium mb-2"
            style={{ color: argonTheme.colors.text.primary }}
          >
            {label}
            {props.required && (
              <span style={{ color: argonTheme.colors.error.main }}> *</span>
            )}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:outline-none focus:ring-2 transition-all
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          style={{
            borderColor: error 
              ? argonTheme.colors.error.main 
              : argonTheme.colors.grey[200],
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = argonTheme.colors.primary.main;
              e.target.style.boxShadow = argonTheme.shadows.primary;
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = argonTheme.colors.grey[200];
              e.target.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        
        {error && (
          <p 
            className="text-sm mt-1"
            style={{ color: argonTheme.colors.error.main }}
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            className="text-xs mt-1"
            style={{ color: argonTheme.colors.text.secondary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ArgonTextarea.displayName = 'ArgonTextarea';

// Select Component
interface ArgonSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const ArgonSelect = forwardRef<HTMLSelectElement, ArgonSelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-2"
            style={{ color: argonTheme.colors.text.primary }}
          >
            {label}
            {props.required && (
              <span style={{ color: argonTheme.colors.error.main }}> *</span>
            )}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 border rounded-lg
            focus:outline-none focus:ring-2 transition-all
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          style={{
            borderColor: error 
              ? argonTheme.colors.error.main 
              : argonTheme.colors.grey[200],
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = argonTheme.colors.primary.main;
              e.target.style.boxShadow = argonTheme.shadows.primary;
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = argonTheme.colors.grey[200];
              e.target.style.boxShadow = 'none';
            }
          }}
          {...props}
        >
          <option value="">Selecione uma opção</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p 
            className="text-sm mt-1"
            style={{ color: argonTheme.colors.error.main }}
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            className="text-xs mt-1"
            style={{ color: argonTheme.colors.text.secondary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ArgonSelect.displayName = 'ArgonSelect';

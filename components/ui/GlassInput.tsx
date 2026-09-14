'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'glass-input w-full px-4 py-3 text-sm',
            error && 'border-error focus:border-error focus:shadow-error/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'glass-input w-full px-4 py-3 text-sm resize-none',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

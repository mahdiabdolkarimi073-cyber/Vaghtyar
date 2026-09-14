'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'accent' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, loading = false, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'gradient-button',
      accent: 'bg-gradient-to-br from-primary-light to-secondary shadow-soft hover:shadow-card-hover',
      success: 'bg-gradient-to-br from-secondary to-green-600 shadow-soft hover:shadow-card-hover',
      danger: 'bg-gradient-to-br from-error to-red-600 shadow-soft hover:shadow-card-hover',
    };
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-sm rounded-xl',
      lg: 'px-8 py-3.5 text-base rounded-xl',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium text-white transition-all duration-200',
          'hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
export default GradientButton;

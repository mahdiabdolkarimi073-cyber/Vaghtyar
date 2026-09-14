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
      accent: 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30',
      success: 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30',
      danger: 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30',
    };
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-3 text-base rounded-xl',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium text-white transition-all duration-300',
          'hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
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

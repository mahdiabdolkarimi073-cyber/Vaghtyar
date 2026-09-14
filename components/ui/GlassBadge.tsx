'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

const variants = {
  default: 'bg-white/5 text-secondary-custom border-white/10',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border-red-500/20',
  info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
};

export default function GlassBadge({ className, variant = 'default', children, ...props }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

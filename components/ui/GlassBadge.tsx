'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

const variants = {
  default: 'bg-muted text-text-secondary border-border',
  success: 'bg-secondary/10 text-secondary border-secondary/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-error/10 text-error border-error/20',
  info: 'bg-primary/10 text-primary border-primary/20',
  primary: 'bg-primary/10 text-primary border-primary/20',
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

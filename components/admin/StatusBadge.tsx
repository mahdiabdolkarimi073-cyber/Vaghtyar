'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  success: 'bg-secondary/10 text-secondary border-secondary/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-error/10 text-error border-error/20',
  info: 'bg-sky-50 text-sky-600 border-sky-200',
  primary: 'bg-primary/10 text-primary border-primary/20',
  neutral: 'bg-muted text-text-muted border-border',
};

export default function StatusBadge({ status, variant = 'neutral', children }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variantStyles[variant]
    )}>
      {children || status}
    </span>
  );
}

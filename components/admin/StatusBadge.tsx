'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  danger: 'bg-rose-50 text-rose-600 border-rose-200',
  info: 'bg-sky-50 text-sky-600 border-sky-200',
  primary: 'bg-violet-50 text-violet-600 border-violet-200',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
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

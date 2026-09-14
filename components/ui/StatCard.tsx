'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: { value: number; isUp: boolean };
  gradient: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const gradients = {
  primary: 'from-primary to-primary-light',
  accent: 'from-primary-light to-secondary',
  success: 'from-secondary to-green-600',
  warning: 'from-warning to-orange-500',
  danger: 'from-error to-red-600',
};

const iconBg = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-primary-light/10 text-primary-light',
  success: 'bg-secondary/10 text-secondary',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-error/10 text-error',
};

export default function StatCard({ icon, label, value, suffix, trend, gradient, delay = 0 }: StatCardProps) {
  const numValue = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isNumeric) return;
    const start = performance.now();
    const duration = 800;
    const animate = (now: number) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numValue * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [numValue, delay, isNumeric]);

  return (
    <div
      className="bg-surface border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg[gradient])}>
          {icon}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.isUp ? 'text-secondary' : 'text-error')}>
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary animate-count-up">
        {isNumeric ? displayValue.toLocaleString('en-US') : value}{suffix}
      </div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}

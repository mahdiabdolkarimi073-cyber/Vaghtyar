'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

const gradients = {
  primary: 'admin-gradient-primary',
  accent: 'admin-gradient-sky',
  success: 'admin-gradient-emerald',
  warning: 'admin-gradient-amber',
  danger: 'admin-gradient-rose',
};

export default function StatsCard({ title, value, subtitle, icon, gradient, trend, isLoading }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  const numValue = typeof value === 'number' ? value : 0;

  useEffect(() => {
    if (isLoading) return;
    const start = performance.now();
    const duration = 800;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numValue * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [numValue, isLoading]);

  if (isLoading) {
    return <div className="admin-card p-5 h-32 admin-skeleton rounded-2xl" />;
  }

  return (
    <div className="admin-card p-5 admin-animate">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white', gradients[gradient])}>
          {icon}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.isPositive ? 'text-secondary' : 'text-error')}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary">
        {typeof value === 'number' ? displayValue.toLocaleString('en-US') : value}
      </div>
      <div className="text-sm text-text-secondary mt-1">{title}</div>
      {subtitle && <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>}
    </div>
  );
}

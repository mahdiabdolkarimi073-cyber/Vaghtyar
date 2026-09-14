'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; isUp: boolean };
  gradient: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const gradients = {
  primary: 'from-indigo-500 to-purple-500',
  accent: 'from-cyan-500 to-blue-500',
  success: 'from-emerald-500 to-green-600',
  warning: 'from-amber-500 to-orange-500',
  danger: 'from-red-500 to-red-600',
};

export default function StatCard({ icon, label, value, suffix, trend, gradient, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
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
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, delay]);

  return (
    <div className="glass glass-hover p-5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br', gradients[gradient])}>
          {icon}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.isUp ? 'text-emerald-400' : 'text-red-400')}>
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-primary-custom animate-count-up">
        {displayValue.toLocaleString('en-US')}{suffix}
      </div>
      <div className="text-sm text-secondary-custom mt-1">{label}</div>
    </div>
  );
}

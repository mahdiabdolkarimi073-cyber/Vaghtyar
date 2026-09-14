'use client';

import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function ChartCard({ title, children, className, isLoading }: ChartCardProps) {
  if (isLoading) {
    return <div className={cn('admin-card p-5 h-80 admin-skeleton rounded-2xl', className)} />;
  }
  return (
    <div className={cn('admin-card p-5 admin-animate', className)}>
      <h3 className="text-sm font-bold text-text-secondary mb-4">{title}</h3>
      {children}
    </div>
  );
}

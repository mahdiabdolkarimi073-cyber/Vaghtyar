'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
  strong?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, gradient = false, strong = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? 'glass-strong' : 'glass',
          hover && 'glass-hover cursor-pointer',
          gradient && 'relative overflow-hidden',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))' }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;

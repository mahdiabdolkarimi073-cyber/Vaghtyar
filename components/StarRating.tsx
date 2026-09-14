'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/constants';

export function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(sizeClass, star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')}
        />
      ))}
      <span className="text-sm text-text-secondary mr-1">{toPersianDigits(rating.toFixed(1))}</span>
    </div>
  );
}

export function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={cn('w-8 h-8 transition-colors', (hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')}
          />
        </button>
      ))}
    </div>
  );
}

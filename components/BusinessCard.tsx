'use client';

import Link from 'next/link';
import { Star, MapPin, Clock, BadgeCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits, formatPrice } from '@/lib/constants';
import type { Business } from '@/lib/types';

export default function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group">
      <div className="relative h-48 overflow-hidden">
        {business.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverImage} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-primary/40" />
          </div>
        )}
        {business.isFeatured && (
          <span className="absolute top-3 right-3 bg-warning text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> ویژه
          </span>
        )}
        {business.isOpenNow && (
          <span className="absolute top-3 left-3 bg-secondary text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3" /> باز الان
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link href={`/salon/${business.slug}`}>
              <h3 className="font-bold text-text-primary hover:text-primary transition-colors text-lg">{business.name}</h3>
            </Link>
            {business.neighborhood && (
              <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {business.neighborhood}
              </p>
            )}
          </div>
          {business.isVerified && (
            <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-text-primary">
              {business.avgRating ? toPersianDigits(business.avgRating.toFixed(1)) : '—'}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            ({toPersianDigits(business.reviewCount || 0)} نظر)
          </span>
          {business.minPrice ? (
            <span className="text-xs text-text-secondary mr-auto">از {formatPrice(business.minPrice)}</span>
          ) : null}
        </div>

        <Link href={`/salon/${business.slug}`}>
          <Button className="w-full">
            رزرو نوبت
          </Button>
        </Link>
      </div>
    </div>
  );
}

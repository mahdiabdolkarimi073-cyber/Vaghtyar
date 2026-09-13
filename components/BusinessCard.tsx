'use client';

import Link from 'next/link';
import { Star, MapPin, Clock, BadgeCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits, formatPrice } from '@/lib/constants';
import type { Business } from '@/lib/types';

export default function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative h-48 overflow-hidden">
        {business.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverImage} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-teal-400" />
          </div>
        )}
        {business.isFeatured && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> ویژه
          </span>
        )}
        {business.isOpenNow && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3" /> باز الان
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link href={`/salon/${business.slug}`}>
              <h3 className="font-bold text-gray-800 hover:text-teal-600 transition-colors text-lg">{business.name}</h3>
            </Link>
            {business.neighborhood && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {business.neighborhood}
              </p>
            )}
          </div>
          {business.isVerified && (
            <BadgeCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-700">
              {business.avgRating ? toPersianDigits(business.avgRating.toFixed(1)) : '—'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            ({toPersianDigits(business.reviewCount || 0)} نظر)
          </span>
          {business.minPrice ? (
            <span className="text-xs text-gray-500 mr-auto">از {formatPrice(business.minPrice)}</span>
          ) : null}
        </div>

        <Link href={`/salon/${business.slug}`}>
          <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
            رزرو نوبت
          </Button>
        </Link>
      </div>
    </div>
  );
}

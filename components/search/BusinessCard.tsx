'use client';

import Link from 'next/link';
import { Star, MapPin, Tag, Heart, Clock } from 'lucide-react';
import { useState } from 'react';

export interface BusinessResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  priceLevel: number;
  address: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  category: { id: number; name: string; slug: string };
  neighborhood: { id: number; name: string; slug: string } | null;
  city: { id: number; name: string; slug: string };
  services: { id: number; name: string; price: number; durationMin: number }[];
  workingHours: { id: number; dayOfWeek: number; openTime: string; closeTime: string }[];
  isOpenNow?: boolean;
}

function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export function BusinessCard({ business }: { business: BusinessResult }) {
  const [fav, setFav] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg" dir="rtl">
      {/* Cover image */}
      <div
        className="relative h-40 w-full bg-cover bg-center"
        style={
          business.coverImage
            ? { backgroundImage: `url(${business.coverImage})` }
            : { background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute right-3 top-3 flex gap-2">
          {business.isFeatured && (
            <span className="rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow">
              ویژه
            </span>
          )}
          {business.isOpenNow && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
              <Clock className="h-3 w-3" />
              باز الان
            </span>
          )}
        </div>
        <button
          onClick={() => setFav(!fav)}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-white"
          aria-label="افزودن به علاقه‌مندی"
        >
          <Heart className={`h-4 w-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight text-slate-900">{business.name}</h3>
          <div className="flex shrink-0 items-center gap-1" dir="ltr">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-slate-900">{business.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Category + neighborhood */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {business.category.name}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {business.neighborhood?.name || business.city.name}
          </span>
        </div>

        {/* Services */}
        {business.services.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3">
            {business.services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{svc.name}</span>
                <span className="font-bold text-indigo-500">{formatPrice(svc.price)} تومان</span>
              </div>
            ))}
          </div>
        )}

        {/* Review count + CTA */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-400">
            {business.reviewCount.toLocaleString('fa-IR')} نظر
          </span>
          <Link
            href={`/business/${business.slug}`}
            className="rounded-lg bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-600"
          >
            رزرو نوبت
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BusinessCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" dir="rtl">
      <div className="h-40 w-full animate-pulse bg-slate-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-20 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

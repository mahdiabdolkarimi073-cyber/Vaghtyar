'use client';

import Link from 'next/link';
import { Star, MapPin, Sparkles, BadgeCheck } from 'lucide-react';
import { toPersianDigits } from '@/lib/constants';
import type { Advertisement } from '@/lib/types';

interface FeaturedAdWithRating extends Advertisement {
  business?: {
    id: string;
    name: string;
    slug?: string;
    profileImage?: string | null;
    coverImage?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    avgRating?: number;
    reviewCount?: number;
  } | null;
}

export default function AdFeatured({ ads }: { ads: FeaturedAdWithRating[] }) {
  if (ads.length === 0) return null;

  return (
    <section className="container mx-auto px-4 max-w-7xl py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
            <Star className="w-7 h-7 text-warning fill-warning" />
            تبلیغات ویژه
          </h2>
          <p className="text-text-secondary">کسب‌وکارهای تبلیغاتی ویژه</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => {
          const biz = ad.business;
          const slug = biz?.slug || '';
          return (
            <Link key={ad.id} href={slug ? `/salon/${slug}` : '/search'} className="group">
              <div className="bg-surface rounded-xl overflow-hidden border-2 border-warning/30 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  {ad.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.image}
                      alt={biz?.name || 'تبلیغ ویژه'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : biz?.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={biz.coverImage}
                      alt={biz.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-warning/10 to-primary/10 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-warning/40" />
                    </div>
                  )}
                  {/* Featured badge */}
                  <span className="absolute top-3 right-3 bg-warning text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" /> ویژه
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors text-lg">
                      {biz?.name || 'کسب‌وکار'}
                    </h3>
                    <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  </div>

                  {biz?.neighborhood && (
                    <p className="text-sm text-text-secondary flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {biz.neighborhood}
                      {biz.city ? `، ${biz.city}` : ''}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-text-primary">
                        {biz?.avgRating ? toPersianDigits(biz.avgRating.toFixed(1)) : '—'}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      ({toPersianDigits(biz?.reviewCount || 0)} نظر)
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-primary font-medium text-sm group-hover:text-primary-dark transition-colors">
                      مشاهده و رزرو نوبت ←
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { toPersianDigits } from '@/lib/constants';
import type { Advertisement } from '@/lib/types';

export default function AdBanner({ banners }: { banners: Advertisement[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (banners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 max-w-7xl py-6">
      <div className="relative rounded-2xl overflow-hidden shadow-card-hover group">
        {/* Slides */}
        <div className="relative h-56 md:h-72 lg:h-80">
          {banners.map((ad, i) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Link href={ad.business?.slug ? `/salon/${ad.business.slug}` : '/search'}>
                <div className="relative w-full h-full">
                  {ad.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.image}
                      alt={ad.business?.name || 'تبلیغ'}
                      className="w-full h-full object-cover"
                    />
                  ) : ad.business?.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.business.coverImage}
                      alt={ad.business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-white/30" />
                    </div>
                  )}

                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8 z-10">
                    {ad.business && (
                      <>
                        <h3 className="text-white text-xl md:text-2xl font-bold mb-1 drop-shadow-lg">
                          {ad.business.name}
                        </h3>
                        {ad.business.neighborhood && (
                          <p className="text-white/80 text-sm flex items-center gap-1 mb-2">
                            <MapPin className="w-3.5 h-3.5" />
                            {ad.business.neighborhood}
                            {ad.business.city ? `، ${ad.business.city}` : ''}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full font-medium border border-white/20">
                          مشاهده و رزرو نوبت
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`اسلاید ${toPersianDigits(i + 1)}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

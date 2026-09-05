'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Star, Tag, ChevronLeft } from 'lucide-react';

interface NewBusiness {
  id: number;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
  coverImage: string;
  category: { name: string };
  neighborhood: { name: string } | null;
  city: { name: string };
}

interface NewBusinessesProps {
  businesses: NewBusiness[];
}

export function NewBusinesses({ businesses }: NewBusinessesProps) {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((cur) =>
      cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]
    );
  };

  return (
    <section className="flex w-full flex-col gap-8 self-stretch px-5 py-12 sm:px-8 md:px-12 lg:px-20 lg:py-16">
      <header className="flex w-full items-center justify-between">
        <Link
          href="/search?sort=newest"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-600"
        >
          <ChevronLeft className="h-4 w-4" />
          <span dir="rtl">مشاهده همه</span>
        </Link>
        <div className="flex flex-col items-end gap-1.5 text-right" dir="rtl">
          <h2 className="text-2xl font-bold leading-tight text-slate-900">
            کسب‌وکارهای جدید
          </h2>
          <p className="text-sm font-normal leading-tight text-slate-600">
            جدیدترین کسب‌وکارهای ملحق‌شده به نوبت‌یار
          </p>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {businesses.map((biz) => {
          const isFavorite = favorites.includes(biz.id);
          return (
            <Link
              key={biz.id}
              href={`/business/${biz.slug}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
            >
              <div
                className="h-[180px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${biz.coverImage})` }}
              >
                <div className="flex w-full items-start justify-between p-3">
                  <button
                    type="button"
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite
                        ? `حذف ${biz.name} از علاقه‌مندی‌ها`
                        : `افزودن ${biz.name} به علاقه‌مندی‌ها`
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(biz.id);
                    }}
                    className="flex h-auto w-auto items-center justify-center rounded-full p-0 hover:bg-transparent"
                  >
                    <Heart
                      className={`h-8 w-8 ${
                        isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  <span className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">
                    جدید
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 p-4" dir="rtl">
                <h3 className="text-right text-base font-bold leading-tight text-slate-900">
                  {biz.name}
                </h3>
                <div className="flex items-center justify-between gap-3 text-[13px] text-slate-600">
                  <div className="flex shrink-0 items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    <span className="font-normal leading-tight">{biz.category.name}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-normal leading-tight">
                      {biz.neighborhood?.name || biz.city.name}
                    </span>
                  </div>
                </div>
                <div className="h-px w-full bg-slate-200" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" dir="ltr">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-[13px] font-bold leading-tight text-slate-900">
                      {biz.rating.toFixed(1)}
                    </span>
                    <span className="text-xs font-normal leading-tight text-slate-400">
                      ({biz.reviewCount.toLocaleString('fa-IR')})
                    </span>
                  </div>
                  <span className="rounded-lg bg-[#eef2f6] px-3 py-1.5 text-xs font-bold text-indigo-500 transition-colors hover:bg-[#e3e9f0]">
                    رزرو نوبت
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

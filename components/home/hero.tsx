'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

const popularSearches = [
  'مشاوره آنلاین',
  'میکاپ و زیبایی',
  'کارواش نانو',
  'دندان‌پزشکی',
];

interface HeroProps {
  categories: { id: number; name: string; slug: string }[];
  cities: { id: number; name: string; slug: string }[];
}

export function Hero({ categories, cities }: HeroProps) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section
      className="relative flex min-h-[520px] w-full flex-col items-center justify-center px-5 py-12 sm:px-20 sm:py-20"
      aria-labelledby="appointment-booking-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(49,46,129,0.85) 0%, rgba(49,46,129,0.85) 100%), url(https://images.pexels.com/photos/31468386/pexels-photo-31468386.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750)`,
        }}
      />

      <div className="relative flex w-full max-w-[800px] flex-col items-center gap-6">
        <header className="flex flex-col items-center gap-6">
          <h1
            id="appointment-booking-heading"
            className="text-center text-[40px] font-black leading-tight text-white"
          >
            نوبت آنلاین، بدون انتظار
          </h1>
          <p className="text-center text-lg font-normal text-white/90 max-w-2xl">
            ساده‌ترین و سریع‌ترین راه رزرو آنلاین نوبت از پزشکان، سالن‌های زیبایی، مراکز آموزشی و خدماتی اطراف شما
          </p>
        </header>

        {/* Search card */}
        <form
          onSubmit={handleSearch}
          className="w-full rounded-2xl bg-white p-2 shadow-lg"
        >
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search button */}
            <button
              type="submit"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-indigo-600"
            >
              <Search className="h-5 w-5" />
              جستجو کنید
            </button>

            {/* City selector */}
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="انتخاب شهر"
                className="h-auto flex-1 border-0 bg-transparent text-sm font-normal text-slate-900 outline-none"
              >
                <option value="">همه شهرها (تهران...)</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <MapPin className="h-5 w-5 shrink-0 text-slate-900" />
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />

            {/* Search input */}
            <label className="flex min-w-0 flex-1 items-center gap-2 pl-3">
              <input
                type="search"
                dir="rtl"
                aria-label="جستجوی خدمات"
                placeholder="به دنبال چه خدمتی هستید؟ (پزشکی، آرایشگاه...)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-auto min-w-0 border-0 bg-transparent text-sm font-normal text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <Search className="h-5 w-5 shrink-0 text-slate-900" />
            </label>
          </div>
        </form>

        {/* Popular searches */}
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="جستجوهای محبوب"
          dir="rtl"
        >
          <span className="text-[13px] font-normal text-white/80">
            جستجوهای محبوب:
          </span>
          {popularSearches.map((search) => (
            <button
              key={search}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-normal text-white transition-colors hover:bg-white/25"
            >
              {search}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

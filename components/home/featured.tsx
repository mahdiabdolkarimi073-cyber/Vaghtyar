import Link from 'next/link';
import { Heart, MapPin, Star, Tag, ChevronLeft } from 'lucide-react';

interface FeaturedBusiness {
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

interface FeaturedProps {
  businesses: FeaturedBusiness[];
}

export function Featured({ businesses }: FeaturedProps) {
  return (
    <section className="flex w-full flex-col gap-8 bg-white px-5 py-12 sm:px-8 lg:px-20 lg:py-16">
      <header className="flex items-center justify-between gap-6">
        <Link
          href="/search?featured=true"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-600"
        >
          <ChevronLeft className="h-4 w-4" />
          <span dir="rtl">مشاهده همه</span>
        </Link>
        <div className="flex flex-col items-end gap-1.5 text-right" dir="rtl">
          <h2 className="text-2xl font-bold leading-tight text-slate-900">
            کسب‌وکارهای ویژه
          </h2>
          <p className="text-sm font-normal leading-tight text-slate-600">
            بهترین‌ها را از بین کسب‌وکارهای برتر انتخاب کنید
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {businesses.map((biz) => (
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700">
                  <Heart className="h-4 w-4" />
                </div>
                <span
                  className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900"
                  dir="rtl"
                >
                  ویژه
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4" dir="rtl">
              <h3 className="text-right text-base font-bold leading-tight text-slate-900">
                {biz.name}
              </h3>
              <div className="flex items-center justify-between gap-3 text-[13px] text-slate-600">
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-normal leading-tight">
                    {biz.neighborhood?.name || biz.city.name}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="font-normal leading-tight">{biz.category.name}</span>
                </span>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-[#eef2f6] px-3 py-1.5 text-xs font-bold text-indigo-500 transition-colors hover:bg-[#e2e8f0]">
                  رزرو نوبت
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-[13px] font-bold leading-tight text-slate-900">
                    {biz.rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-normal leading-tight text-slate-400">
                    ({biz.reviewCount.toLocaleString('fa-IR')})
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

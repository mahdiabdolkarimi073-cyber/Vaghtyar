import Link from 'next/link';
import {
  Stethoscope, Scissors, Car, Home as HomeIcon,
  GraduationCap, MoreHorizontal, ChevronLeft,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors,
  Stethoscope,
  Car,
  HomeIcon,
  GraduationCap,
  MoreHorizontal,
};

interface CategoriesProps {
  categories: { id: number; name: string; slug: string; icon: string; description: string | null }[];
}

export function Categories({ categories }: CategoriesProps) {
  const counts: Record<string, string> = {
    beauty: '۸۹ سالن',
    doctor: '۱۲۸ مطب',
    car: '۶۲ تعمیرگاه',
    home: '۳۱ تخصص',
    education: '۴۵ مرکز',
    other: '۱۲ تخصص',
  };

  return (
    <section
      className="flex w-full flex-col items-start gap-8 px-5 py-10 sm:px-10 sm:py-14 lg:px-20 lg:py-16"
      aria-labelledby="service-categories-title"
      id="categories"
    >
      <header className="flex w-full items-center justify-between">
        <Link
          href="/search"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-600"
          dir="rtl"
        >
          مشاهده همه
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-col items-end gap-1.5" dir="rtl">
          <h2
            id="service-categories-title"
            className="text-2xl font-bold leading-tight text-slate-900"
          >
            دسته‌بندی‌های محبوب
          </h2>
          <p className="text-sm font-normal leading-tight text-slate-600">
            خدمات مورد نیاز خود را بر اساس دسته‌بندی انتخاب کنید
          </p>
        </div>
      </header>

      <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || MoreHorizontal;
          return (
            <li key={cat.id} className="min-w-0">
              <Link
                href={`/search?category=${cat.slug}`}
                className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-14 w-14 items-center justify-center">
                  <Icon className="h-8 w-8 text-indigo-500" />
                </div>
                <span className="flex flex-col items-center gap-1" dir="rtl">
                  <span className="text-center text-base font-bold leading-tight text-slate-900">
                    {cat.name}
                  </span>
                  <span className="text-center text-xs font-normal leading-tight text-slate-400">
                    {counts[cat.slug] || '—'}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

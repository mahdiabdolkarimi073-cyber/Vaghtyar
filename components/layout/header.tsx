import Link from 'next/link';
import { Calendar } from 'lucide-react';

const navigationItems = [
  { label: 'خانه', href: '/', active: true },
  { label: 'جستجوی نوبت', href: '/search', active: false },
  { label: 'دسته‌بندی‌ها', href: '/#categories', active: false },
  { label: 'درباره نوبت‌یار', href: '/#about', active: false },
  { label: 'تماس با ما', href: '/#contact', active: false },
];

export function Header() {
  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-10 lg:px-20">
      {/* Logo - right side in RTL */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-2xl font-extrabold text-indigo-500">نوبت‌یار</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <Calendar className="h-5 w-5" />
        </div>
      </Link>

      {/* Nav - center */}
      <nav aria-label="ناوبری اصلی" className="hidden lg:block">
        <ul className="flex items-center gap-8">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`text-sm transition-colors ${
                  item.active
                    ? 'font-bold text-indigo-500'
                    : 'font-normal text-slate-600 hover:text-indigo-500'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Actions - left side in RTL */}
      <div className="flex items-center gap-3">
        <Link
          href="/business-register"
          className="rounded-[10px] bg-[#eef2f6] px-5 py-2.5 text-sm font-bold text-indigo-500 transition-colors hover:bg-slate-200"
        >
          ورود کسب‌وکارها
        </Link>
        <Link
          href="/login"
          className="rounded-[10px] bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
        >
          ثبت‌نام / ورود
        </Link>
      </div>
    </header>
  );
}

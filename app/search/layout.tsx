import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  title: 'جستجوی کسب‌وکار',
  description:
    'جستجوی سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در شهر شما. فیلتر بر اساس دسته‌بندی، شهر، محله، امتیاز و قیمت.',
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: 'جستجوی کسب‌وکار | نوبت‌یار',
    description: 'سالن‌های زیبایی و کلینیک‌های شهر خود را پیدا کنید و آنلاین نوبت رزرو کنید.',
    url: `${SITE_URL}/search`,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

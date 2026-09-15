import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

async function getSiteName() {
  try {
    const s = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    return s?.value || 'نوبت‌یار';
  } catch { return 'نوبت‌یار'; }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: 'جستجوی کسب‌وکار',
    description:
      'جستجوی سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در شهر شما. فیلتر بر اساس دسته‌بندی، شهر، محله، امتیاز و قیمت.',
    alternates: { canonical: `${SITE_URL}/search` },
    openGraph: {
      title: `جستجوی کسب‌وکار | ${siteName}`,
      description: 'سالن‌های زیبایی و کلینیک‌های شهر خود را پیدا کنید و آنلاین نوبت رزرو کنید.',
      url: `${SITE_URL}/search`,
    },
  };
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

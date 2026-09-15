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
    title: 'تماس با ما',
    description: `با ${siteName} تماس بگیرید. سوال، پیشنهاد یا انتقاد دارید؟ خوشحال می‌شویم بشنویم.`,
    alternates: { canonical: `${SITE_URL}/contact` },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

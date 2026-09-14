import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: 'با نوبت‌یار تماس بگیرید. سوال، پیشنهاد یا انتقاد دارید؟ خوشحال می‌شویم بشنویم.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import './globals.css';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'نوبت‌یار | رزرو آنلاین نوبت',
  description: 'ساده‌ترین و سریع‌ترین راه رزرو آنلاین نوبت از پزشکان، سالن‌های زیبایی، مراکز آموزشی و خدماتی اطراف شما',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

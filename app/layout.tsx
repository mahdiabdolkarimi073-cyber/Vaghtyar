import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'نوبت‌یار | رزرو آنلاین نوبت',
  description: 'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در سراسر ایران',
  openGraph: {
    title: 'نوبت‌یار | رزرو آنلاین نوبت',
    description: 'بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-vazir bg-gray-50 text-gray-800 antialiased">
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

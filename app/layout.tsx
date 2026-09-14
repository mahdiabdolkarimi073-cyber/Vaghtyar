import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'نوبت‌یار | رزرو آنلاین نوبت',
    template: '%s | نوبت‌یار',
  },
  description:
    'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در سراسر ایران. بدون انتظار، بدون معطلی.',
  keywords: [
    'رزرو نوبت', 'نوبت آنلاین', 'سالن زیبایی', 'کلینیک', 'آرایشگاه',
    'رزرو نوبت سالن زیبایی', 'رزرو نوبت کلینیک', 'نوبت‌یار',
  ],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'نوبت‌یار',
    title: 'نوبت‌یار | رزرو آنلاین نوبت',
    description: 'بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نوبت‌یار | رزرو آنلاین نوبت',
    description: 'بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'نوبت‌یار',
  url: SITE_URL,
  description: 'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها',
  inLanguage: 'fa-IR',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Header />
            <main className="animate-fade-in">{children}</main>
            <Footer />
          </AuthProvider>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Vazirmatn, sans-serif',
                direction: 'rtl',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

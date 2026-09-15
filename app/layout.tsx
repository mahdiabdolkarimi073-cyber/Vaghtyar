import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/site-settings-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} | رزرو آنلاین نوبت`,
      template: `%s | ${siteName}`,
    },
    description:
      'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در سراسر ایران. بدون انتظار، بدون معطلی.',
    keywords: [
      'رزرو نوبت', 'نوبت آنلاین', 'سالن زیبایی', 'کلینیک', 'آرایشگاه',
      'رزرو نوبت سالن زیبایی', 'رزرو نوبت کلینیک',
    ],
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName,
      title: `${siteName} | رزرو آنلاین نوبت`,
      description: 'بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید.',
      url: SITE_URL,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} | رزرو آنلاین نوبت`,
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
}

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const siteName = settings.site_name;

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: SITE_URL,
    description: 'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها',
    inLanguage: 'fa-IR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

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
            <Header siteSettings={settings} />
            <main className="animate-fade-in">{children}</main>
            <Footer siteSettings={settings} />
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

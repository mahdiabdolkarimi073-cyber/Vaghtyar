import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'نوبت‌یار | رزرو آنلاین نوبت',
  description: 'پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در سراسر ایران',
  openGraph: {
    title: 'نوبت‌یار | رزرو آنلاین نوبت',
    description: 'بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
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

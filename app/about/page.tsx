import type { Metadata } from 'next';
import Link from 'next/link';
import { Target, Users, ShieldCheck, Zap, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  title: 'درباره ما',
  description:
    'نوبت‌یار پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در ایران است. هدف ما راحت‌تر کردن رزرو نوبت برای همه است.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'درباره نوبت‌یار',
    description: 'پلتفرم رزرو آنلاین نوبت برای کسب‌وکارهای زیبایی و سلامت در ایران.',
    url: `${SITE_URL}/about`,
  },
};

const VALUES = [
  {
    icon: Target,
    title: 'مأموریت ما',
    desc: 'حذف انتظار و معطلی از فرآیند رزرو نوبت. ما می‌خواهیم هر کس بتواند در کمتر از یک دقیقه نوبت خود را رزرو کند.',
  },
  {
    icon: Users,
    title: 'برای همه',
    desc: 'نوبت‌یار برای مشتریان رایگان است و برای کسب‌وکارها پلن‌های متناسب با هر بودجه دارد.',
  },
  {
    icon: ShieldCheck,
    title: 'اعتماد و امنیت',
    desc: 'کسب‌وکارهای تأییدشده، پرداخت امن و محافظت از اطلاعات کاربران اولویت ماست.',
  },
  {
    icon: Zap,
    title: 'سرعت و سادگی',
    desc: 'رابط کاربری ساده و سریع که هر کسی در هر سنی بتواند از آن استفاده کند.',
  },
  {
    icon: Heart,
    title: 'رضایت مشتری',
    desc: 'بیش از ۱۰٬۰۰۰ نوبت رزرو شده و رضایت ۹۸٪ کاربران، انگیزه ما برای بهتر شدن است.',
  },
  {
    icon: Award,
    title: 'کیفیت',
    desc: 'ما فقط کسب‌وکارهای معتبر و تأییدشده را در پلتفرم خود می‌پذیریم.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">درباره نوبت‌یار</h1>
        <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
          نوبت‌یار یک پلتفرم رزرو آنلاین نوبت است که ارتباط بین مشتریان و کسب‌وکارهای زیبایی و سلامت را
          ساده می‌کند. ما معتقدیم هیچ‌کس نباید برای یک نوبت ساده ساعت‌ها منتظر بماند یا ده‌ها بار تماس بگیرد.
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white mb-12">
        <h2 className="text-2xl font-bold mb-4">داستان ما</h2>
        <p className="text-primary-foreground/90 leading-relaxed">
          نوبت‌یار با یک ایده ساده شروع شد: چرا باید برای رزرو یک نوبت ساده تماس گرفت و منتظر ماند؟
          ما پلتفرمی ساختیم که در آن مشتریان به‌راحتی و در هر ساعت از شبانه‌روز نوبت رزرو کنند و
          کسب‌وکارها نوبت‌های خود را به‌صورت متمرکز مدیریت کنند. امروز هزاران کسب‌وکار و ده‌ها هزار مشتری
          از نوبت‌یار استفاده می‌کنند و ما هر روز بهتر می‌شویم.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {VALUES.map((v, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <v.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-text-primary mb-2">{v.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { value: '۵۰۰+', label: 'کسب‌وکار فعال' },
          { value: '۱۰٬۰۰۰+', label: 'نوبت رزرو شده' },
          { value: '۱۲', label: 'شهر' },
          { value: '۹۸٪', label: 'رضایت مشتری' },
        ].map((s, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
            <div className="text-sm text-text-secondary">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="text-center bg-surface rounded-2xl border border-border p-8">
        <h2 className="text-xl font-bold text-text-primary mb-3">به نوبت‌یار بپیوندید</h2>
        <p className="text-text-secondary mb-6 max-w-lg mx-auto">
          چه مشتری باشید چه صاحب کسب‌وکار، نوبت‌یار تجربه‌ای بهتر برای شما دارد.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/search">
            <Button className="bg-primary hover:bg-primary-dark text-white">جستجوی کسب‌وکار</Button>
          </Link>
          <Link href="/register-business">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">ثبت کسب‌وکار</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

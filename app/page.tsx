import Link from 'next/link';
import {
  Clock, Bell, CalendarCheck, TrendingUp, Users, MapPin,
  Star, Award, Zap, ShieldCheck
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import AdBanner from '@/components/AdBanner';
import AdFeatured from '@/components/AdFeatured';
import { StarRating } from '@/components/StarRating';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toPersianDigits } from '@/lib/constants';
import { getHomeData, type HomeBusiness } from '@/lib/home-data';
import { getSiteSettings } from '@/lib/site-settings-server';
import type { Category, Business } from '@/lib/types';

export const revalidate = 60;

const CATEGORY_ICONS: Record<string, string> = {
  'mens-barber': '✂️',
  'beauty-salon': '💇‍♀️',
  'beauty-clinic': '💉',
  'bridal-salon': '👰',
  'nail-salon': '💅',
};

function CategoryVisual({ cat }: { cat: Category }) {
  if (cat.image) {
    return (
      <img
        src={cat.image}
        alt={cat.name}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <span className="text-3xl">{cat.icon || CATEGORY_ICONS[cat.slug] || '✨'}</span>
  );
}

const FAQS = [
  { q: 'چگونه می‌توانم نوبت رزرو کنم؟', a: 'کافیست در صفحه جستجو، کسب‌وکار مورد نظر خود را پیدا کنید، خدمت و زمان مناسب را انتخاب کرده و اطلاعات خود را وارد کنید. در کمتر از یک دقیقه نوبت شما ثبت می‌شود.' },
  { q: 'آیا برای رزرو نوبت نیاز به ثبت‌نام دارم؟', a: 'خیر، می‌توانید به صورت مهمان نیز نوبت رزرو کنید. اما با ثبت‌نام می‌توانید نوبت‌های خود را مدیریت کنید و از یادآوری‌های پیامکی بهره‌مند شوید.' },
  { q: 'چگونه می‌توانم نوبت خود را لغو کنم؟', a: 'با استفاده از کد پیگیری که پس از رزرو دریافت می‌کنید، می‌توانید نوبت خود را پیدا کرده و لغو کنید.' },
  { q: 'آیا رزرو نوبت هزینه‌ای دارد؟', a: 'خیر، استفاده از پلتفرم نوبت‌یار برای مشتریان کاملاً رایگان است. شما تنها هزینه خدمت دریافت‌شده را به کسب‌وکار پرداخت می‌کنید.' },
  { q: 'چگونه می‌توانم کسب‌وکار خود را ثبت کنم؟', a: 'کافیست روی دکمه «ثبت‌نام کسب‌وکار» کلیک کنید، حساب کاربری ایجاد کنید و اطلاعات کسب‌وکار خود را وارد کنید. پس از تأیید، کسب‌وکار شما در پلتفرم نمایش داده می‌شود.' },
];

const TESTIMONIALS = [
  { name: 'مریم رضایی', text: 'دیگه نیازی نیست تماس بگیرم و منتظر بمونم. خیلی راحت آنلاین نوبت می‌گیرم.', rating: 5, city: 'کرمان' },
  { name: 'علی محمدی', text: 'پلتفرم عالی، کاربرپسند و سریع. حتماً به دوستانم پیشنهاد می‌کنم.', rating: 5, city: 'تهران' },
  { name: 'سارا کریمی', text: 'یادآوری پیامکی فوق‌العاده است. هیچ‌وقت نوبتم رو فراموش نمی‌کنم.', rating: 4, city: 'اصفهان' },
];

export default async function Home() {
  const [data, settings] = await Promise.all([
    getHomeData(),
    getSiteSettings(),
  ]);

  const siteName = settings.site_name;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container mx-auto px-4 max-w-7xl relative z-10 py-20 md:py-28">
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {siteName}، رزرو آنلاین نوبت
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید و در زمان مقرر به سالن یا کلینیک مراجعه کنید.
            </p>
          </div>
          <div className="max-w-5xl mx-auto animate-fade-in">
            <SearchBar categories={data.categories} cities={data.cities} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'کسب‌وکار', value: '۵۰۰+' },
            { icon: CalendarCheck, label: 'نوبت رزرو شده', value: '۱۰٬۰۰۰+' },
            { icon: MapPin, label: 'شهر', value: '۱۲' },
            { icon: Star, label: 'رضایت مشتری', value: '۹۸٪' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 shadow-card-hover border border-border text-center hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Advertisements */}
      <AdBanner banners={data.banners} />

      {/* Categories Section */}
      {data.categories.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">دسته‌بندی کسب‌وکارها</h2>
            <p className="text-text-secondary">نوع خدمت مورد نظر خود را انتخاب کنید</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.categories.map((cat: Category) => (
              <Link key={cat.id} href={`/search?category=${cat.slug}`} className="group">
                <div className="bg-surface rounded-xl border border-border p-6 text-center hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 hover:-translate-y-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden transition-colors ${cat.image ? '' : 'bg-gradient-to-br from-primary/10 to-primary-light/10 group-hover:from-primary/15 group-hover:to-primary-light/15'}`}>
                    <CategoryVisual cat={cat} />
                  </div>
                  <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {data.featured.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <Award className="w-7 h-7 text-warning" />
                کسب‌وکارهای ویژه
              </h2>
              <p className="text-text-secondary">برترین کسب‌وکارهای تأییدشده</p>
            </div>
            <Link href="/search?sort=rating" className="text-primary hover:text-primary-dark font-medium text-sm hidden md:block transition-colors">مشاهده همه ←</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.featured.map((b: HomeBusiness) => <BusinessCard key={b.id} business={b as unknown as Business} />)}
          </div>
        </section>
      )}

      {/* Featured Advertisements */}
      <AdFeatured ads={data.featuredAds} />

      {/* New Businesses */}
      {data.recent.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" />
                تازه‌های {siteName}
              </h2>
              <p className="text-text-secondary">جدیدترین کسب‌وکارهای عضو شده</p>
            </div>
            <Link href="/search?sort=newest" className="text-primary hover:text-primary-dark font-medium text-sm hidden md:block transition-colors">مشاهده همه ←</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.recent.slice(0, 4).map((b: HomeBusiness) => <BusinessCard key={b.id} business={b as unknown as Business} />)}
          </div>
        </section>
      )}

      {/* Why Nobetyar - Customers */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">چرا {siteName}؟</h2>
            <p className="text-text-secondary">مزایای رزرو نوبت آنلاین برای مشتریان</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'بدون انتظار', desc: 'دیگر نیازی به تماس و انتظار در صف نیست. نوبت خود را آنلاین رزرو کنید.' },
              { icon: Bell, title: 'یادآوری پیامکی', desc: 'قبل از زمان نوبت، پیام یادآوری دریافت می‌کنید تا فراموش نکنید.' },
              { icon: CalendarCheck, title: 'رزرو ۲۴/۷', desc: 'در هر ساعت از شبانه‌روز می‌توانید نوبت رزرو کنید.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-text-primary text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Businesses Choose Nobetyar */}
      <section className="container mx-auto px-4 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">چرا کسب‌وکارها {siteName} را انتخاب می‌کنند؟</h2>
          <p className="text-text-secondary">مزایای عضویت در پلتفرم {siteName} برای صاحبان کسب‌وکار</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: 'مشتریان بیشتر', desc: 'با حضور در پلتفرم، مشتریان جدیدی از سراسر شهر پیدا کنید.' },
            { icon: Zap, title: 'مدیریت آسان', desc: 'نوبت‌ها را به صورت متمرکز مدیریت کنید و از تداخل جلوگیری کنید.' },
            { icon: ShieldCheck, title: 'تأیید هویت', desc: 'با نشان تأیید هویت، اعتماد مشتریان را جلب کنید.' },
          ].map((item, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-8 hover:shadow-card-hover transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">نظر کاربران ما</h2>
            <p className="text-text-secondary">تجربه مشتریان {siteName}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border p-6 shadow-card">
                <StarRating rating={t.rating} />
                <p className="text-text-secondary my-4 leading-relaxed">«{t.text}»</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{t.name}</div>
                    <div className="text-sm text-text-muted">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 max-w-3xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">سوالات متداول</h2>
          <p className="text-text-secondary">پاسخ به پرسش‌های پرتکرار</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-surface rounded-xl border border-border px-5 shadow-card">
              <AccordionTrigger className="text-right font-medium text-text-primary hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-text-secondary leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-10 md:p-16 text-center overflow-hidden relative shadow-primary">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">کسب‌وکار خود را ثبت کنید</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">همین حالا عضو {siteName} شوید و نوبت‌گیری آنلاین را برای مشتریان خود فراهم کنید.</p>
            <Link href="/register-business">
              <button className="bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-primary-foreground/10 hover:text-white transition-all shadow-lg active:scale-95">
                شروع ثبت‌نام
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

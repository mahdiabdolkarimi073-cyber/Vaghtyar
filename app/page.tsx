'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Clock, Bell, CalendarCheck, TrendingUp, Users, MapPin,
  CheckCircle2, Star, ChevronDown, Phone, Mail, ShieldCheck, Award, Zap
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { StarRating } from '@/components/StarRating';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { apiFetch } from '@/lib/api';
import { toPersianDigits } from '@/lib/constants';
import type { Business, Category } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  'mens-barber': '✂️',
  'beauty-salon': '💇‍♀️',
  'beauty-clinic': '💉',
  'bridal-salon': '👰',
  'nail-salon': '💅',
};

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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Business[]>([]);
  const [recent, setRecent] = useState<Business[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch<{ categories: Category[] }>('/api/categories').catch(() => ({ categories: [] })),
      apiFetch<{ businesses: Business[] }>('/api/businesses/featured').catch(() => ({ businesses: [] })),
      apiFetch<{ businesses: Business[] }>('/api/businesses/recent').catch(() => ({ businesses: [] })),
    ]).then(([catRes, featRes, recRes]) => {
      setCategories(catRes.categories);
      setFeatured(featRes.businesses);
      setRecent(recRes.businesses);
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container mx-auto px-4 max-w-7xl relative z-10 py-20 md:py-28">
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              نوبت‌یار، رزرو آنلاین نوبت
            </h1>
            <p className="text-teal-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              بدون انتظار، بدون معطلی. نوبت خود را آنلاین رزرو کنید و در زمان مقرر به سالن یا کلینیک مراجعه کنید.
            </p>
          </div>
          <div className="max-w-5xl mx-auto animate-fade-in">
            <SearchBar />
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
            <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-50 text-center">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">دسته‌بندی کسب‌وکارها</h2>
            <p className="text-gray-500">نوع خدمت مورد نظر خود را انتخاب کنید</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/search?category=${cat.slug}`} className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center mx-auto mb-3 text-3xl group-hover:from-teal-100 group-hover:to-cyan-100 transition-colors">
                    {CATEGORY_ICONS[cat.slug] || '✨'}
                  </div>
                  <h3 className="font-medium text-gray-700 group-hover:text-teal-600 transition-colors">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" />
                کسب‌وکارهای ویژه
              </h2>
              <p className="text-gray-500">برترین کسب‌وکارهای تأییدشده</p>
            </div>
            <Link href="/search?sort=rating" className="text-teal-600 hover:text-teal-700 font-medium text-sm hidden md:block">مشاهده همه ←</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>
      )}

      {/* New Businesses */}
      {recent.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-teal-500" />
                تازه‌های نوبت‌یار
              </h2>
              <p className="text-gray-500">جدیدترین کسب‌وکارهای عضو شده</p>
            </div>
            <Link href="/search?sort=newest" className="text-teal-600 hover:text-teal-700 font-medium text-sm hidden md:block">مشاهده همه ←</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.slice(0, 4).map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>
      )}

      {/* Why Nobetyar - Customers */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">چرا نوبت‌یار؟</h2>
            <p className="text-gray-500">مزایای رزرو نوبت آنلاین برای مشتریان</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'بدون انتظار', desc: 'دیگر نیازی به تماس و انتظار در صف نیست. نوبت خود را آنلاین رزرو کنید.' },
              { icon: Bell, title: 'یادآوری پیامکی', desc: 'قبل از زمان نوبت، پیام یادآوری دریافت می‌کنید تا فراموش نکنید.' },
              { icon: CalendarCheck, title: 'رزرو ۲۴/۷', desc: 'در هر ساعت از شبانه‌روز می‌توانید نوبت رزرو کنید.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Businesses Choose Nobetyar */}
      <section className="container mx-auto px-4 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">چرا کسب‌وکارها نوبت‌یار را انتخاب می‌کنند؟</h2>
          <p className="text-gray-500">مزایای عضویت در پلتفرم نوبت‌یار برای صاحبان کسب‌وکار</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: 'مشتریان بیشتر', desc: 'با حضور در پلتفرم، مشتریان جدیدی از سراسر شهر پیدا کنید.' },
            { icon: Zap, title: 'مدیریت آسان', desc: 'نوبت‌ها را به صورت متمرکز مدیریت کنید و از تداخل جلوگیری کنید.' },
            { icon: ShieldCheck, title: 'تأیید هویت', desc: 'با نشان تأیید هویت، اعتماد مشتریان را جلب کنید.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">نظر کاربران ما</h2>
            <p className="text-gray-500">تجربه مشتریان نوبت‌یار</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <StarRating rating={t.rating} />
                <p className="text-gray-600 my-4 leading-relaxed">«{t.text}»</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.city}</div>
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">سوالات متداول</h2>
          <p className="text-gray-500">پاسخ به پرسش‌های پرتکرار</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-xl border border-gray-100 px-5">
              <AccordionTrigger className="text-right font-medium text-gray-800 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-10 md:p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">کسب‌وکار خود را ثبت کنید</h2>
            <p className="text-teal-50 mb-8 max-w-xl mx-auto">همین حالا عضو نوبت‌یار شوید و نوبت‌گیری آنلاین را برای مشتریان خود فراهم کنید.</p>
            <Link href="/register-business">
              <button className="bg-white text-teal-700 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
                شروع ثبت‌نام
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

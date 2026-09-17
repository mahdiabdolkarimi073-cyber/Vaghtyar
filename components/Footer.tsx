'use client';

import Link from 'next/link';
import { Calendar, Phone, Mail, MapPin, Instagram, Facebook, Twitter, ShieldCheck, BadgeCheck, Headphones } from 'lucide-react';
import type { SiteSettings } from '@/lib/site-settings-server';

export default function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  const renderLogo = () =>
    siteSettings.site_logo ? (
      <img src={siteSettings.site_logo} alt={siteSettings.site_name} className="w-9 h-9 rounded-xl object-cover" />
    ) : (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
        <Calendar className="w-5 h-5 text-white" />
      </div>
    );

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {renderLogo()}
              <span className="text-xl font-bold text-white">{siteSettings.site_name}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              پلتفرم رزرو نوبت آنلاین برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها. بدون انتظار، بدون معطلی.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary-light transition-colors">خانه</Link></li>
              <li><Link href="/search" className="hover:text-primary-light transition-colors">جستجوی کسب‌وکار</Link></li>
              <li><Link href="/plans" className="hover:text-primary-light transition-colors">پلن‌ها و قیمت‌ها</Link></li>
              <li><Link href="/register-business" className="hover:text-primary-light transition-colors">ثبت کسب‌وکار</Link></li>
              <li><Link href="/about" className="hover:text-primary-light transition-colors">درباره ما</Link></li>
              <li><Link href="/contact" className="hover:text-primary-light transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">شهرها</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/city/kerman" className="hover:text-primary-light transition-colors">کرمان</Link></li>
              <li><Link href="/city/tehran" className="hover:text-primary-light transition-colors">تهران</Link></li>
              <li><Link href="/city/isfahan" className="hover:text-primary-light transition-colors">اصفهان</Link></li>
            </ul>
            <h3 className="text-white font-semibold mb-4 mt-6">راهنما</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-primary-light transition-colors">سوالات متداول</Link></li>
              <li><Link href="/terms" className="hover:text-primary-light transition-colors">قوانین و مقررات</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-light transition-colors">حریم خصوصی</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-primary-light transition-colors">سیاست لغو نوبت</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">تماس با ما</h3>
            <ul className="space-y-3 text-sm">
              {siteSettings.contact_phone && (
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-light" /> {siteSettings.contact_phone}</li>
              )}
              {siteSettings.contact_email && (
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-light" /> {siteSettings.contact_email}</li>
              )}
              {siteSettings.contact_address && (
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-light" /> {siteSettings.contact_address}</li>
              )}
              {!siteSettings.contact_phone && !siteSettings.contact_email && !siteSettings.contact_address && (
                <li className="text-slate-500">اطلاعات تماس در بخش تنظیمات قابل ویرایش است</li>
              )}
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary-light" /> پرداخت امن</span>
            <span className="flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-primary-light" /> کسب‌وکارهای تأییدشده</span>
            <span className="flex items-center gap-1"><Headphones className="w-4 h-4 text-primary-light" /> پشتیبانی ۲۴/۷</span>
          </div>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-primary-light transition-colors">قوانین</Link>
            <Link href="/privacy" className="hover:text-primary-light transition-colors">حریم خصوصی</Link>
            <Link href="/faq" className="hover:text-primary-light transition-colors">سوالات متداول</Link>
            <Link href="/cancellation-policy" className="hover:text-primary-light transition-colors">لغو نوبت</Link>
          </div>
          <p className="text-xs text-slate-500">© ۱۴۰۴ {siteSettings.site_name}. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}

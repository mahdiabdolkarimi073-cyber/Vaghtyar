import Link from 'next/link';
import { Calendar, Instagram, Linkedin, Twitter, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white">
      <div className="px-6 py-12 sm:px-10 lg:px-20 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-white">نوبت‌یار</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400" dir="rtl">
              پلتفرم رزرو آنلاین نوبت برای کسب‌وکارهای مختلف. بدون انتظار، بدون صف.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} />
              <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} />
              <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white" dir="rtl">دسترسی سریع</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/search">جستجوی کسب‌وکار</FooterLink>
              <FooterLink href="/#categories">دسته‌بندی‌ها</FooterLink>
              <FooterLink href="/business-register">ثبت‌نام کسب‌وکار</FooterLink>
              <FooterLink href="/#about">درباره ما</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white" dir="rtl">پشتیبانی</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/#faq">سوالات متداول</FooterLink>
              <FooterLink href="/#contact">تماس با ما</FooterLink>
              <FooterLink href="/privacy">حریم خصوصی</FooterLink>
              <FooterLink href="/terms">قوانین و مقررات</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-4 text-sm font-semibold text-white" dir="rtl">اطلاعات تماس</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2" dir="rtl">
                <Phone className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-2" dir="rtl">
                <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>info@nobatyar.ir</span>
              </li>
              <li className="flex items-center gap-2" dir="rtl">
                <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>تهران، خیابان ولیعصر</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-[10px] font-medium text-slate-400">
            نماد اعتماد
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-[10px] font-medium text-slate-400">
            ساماندهی
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-[10px] font-medium text-slate-400">
            اینماد
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>© ۲۰۲۶ نوبت‌یار. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-indigo-500 hover:text-white"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-slate-400 transition-colors hover:text-indigo-400" dir="rtl">
        {children}
      </Link>
    </li>
  );
}

import Link from 'next/link';
import { Calendar, Phone, Mail, MapPin, Instagram, Facebook, Twitter, ShieldCheck, BadgeCheck, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">نوبت‌یار</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              پلتفرم رزرو نوبت آنلاین برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها. بدون انتظار، بدون معطلی.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-teal-400 transition-colors">خانه</Link></li>
              <li><Link href="/search" className="hover:text-teal-400 transition-colors">جستجوی کسب‌وکار</Link></li>
              <li><Link href="/register-business" className="hover:text-teal-400 transition-colors">ثبت کسب‌وکار</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">شهرها</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/city/kerman" className="hover:text-teal-400 transition-colors">کرمان</Link></li>
              <li><Link href="/city/tehran" className="hover:text-teal-400 transition-colors">تهران</Link></li>
              <li><Link href="/city/isfahan" className="hover:text-teal-400 transition-colors">اصفهان</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">تماس با ما</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400" /> ۰۳۴-۳۲۱۰۰۰۰۰</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-teal-400" /> info@nobetyar.ir</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400" /> کرمان، بلوار جمهوری</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-teal-500" /> پرداخت امن</span>
            <span className="flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-teal-500" /> کسب‌وکارهای تأییدشده</span>
            <span className="flex items-center gap-1"><Headphones className="w-4 h-4 text-teal-500" /> پشتیبانی ۲۴/۷</span>
          </div>
          <p className="text-xs text-gray-500">© ۱۴۰۴ نوبت‌یار. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}

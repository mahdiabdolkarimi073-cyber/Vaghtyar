'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Calendar, Phone, Store, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">نوبت‌یار</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">خانه</Link>
            <Link href="/search" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">جستجو</Link>
            <Link href="/register-business" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">ورود کسب‌وکار</Link>
            <Link href="/contact" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">تماس</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>خروج</Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                  <Store className="w-4 h-4" />
                  ثبت‌نام کسب‌وکار
                </Button>
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/" className="block text-gray-600 hover:text-teal-600 font-medium" onClick={() => setMobileOpen(false)}>خانه</Link>
            <Link href="/search" className="block text-gray-600 hover:text-teal-600 font-medium" onClick={() => setMobileOpen(false)}>جستجو</Link>
            <Link href="/register-business" className="block text-gray-600 hover:text-teal-600 font-medium" onClick={() => setMobileOpen(false)}>ورود کسب‌وکار</Link>
            <Link href="/contact" className="block text-gray-600 hover:text-teal-600 font-medium" onClick={() => setMobileOpen(false)}>تماس</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-gray-600 hover:text-teal-600 font-medium" onClick={() => setMobileOpen(false)}>پنل کاربری</Link>
                <Button variant="outline" size="sm" onClick={() => { logout(); setMobileOpen(false); }} className="w-full">خروج</Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white">ثبت‌نام / ورود</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

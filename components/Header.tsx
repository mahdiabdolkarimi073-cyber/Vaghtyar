'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Calendar, Store, User, LogOut, Search, Phone } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/search', label: 'جستجو' },
  { href: '/register-business', label: 'ورود کسب‌وکار' },
  { href: '/contact', label: 'تماس' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-soft">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">نوبت‌یار</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
                <Button variant="secondary" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 ml-1" />
                  خروج
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <Store className="w-4 h-4" />
                  ثبت‌نام کسب‌وکار
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="منو"
          >
            {mobileOpen ? <X className="w-6 h-6 text-text-primary" /> : <Menu className="w-6 h-6 text-text-primary" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 font-medium transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" className="block px-4 py-3 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 font-medium transition-all" onClick={() => setMobileOpen(false)}>
                  پنل کاربری
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full mt-2"
                >
                  <LogOut className="w-4 h-4 ml-1" />
                  خروج
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block mt-2">
                <Button size="sm" className="w-full">ثبت‌نام / ورود</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

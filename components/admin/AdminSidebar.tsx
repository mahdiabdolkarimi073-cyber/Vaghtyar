'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, Tag, MapPin,
  Star, CreditCard, Megaphone, MessageSquare, BarChart3,
  Settings, LogOut, Menu, X, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/businesses', label: 'کسب‌وکارها', icon: Building2 },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: Tag },
  { href: '/admin/locations', label: 'شهرها و محله‌ها', icon: MapPin },
  { href: '/admin/subscriptions', label: 'اشتراک‌ها', icon: Star },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: CreditCard },
  { href: '/admin/advertisements', label: 'تبلیغات', icon: Megaphone },
  { href: '/admin/sms', label: 'پیامک‌ها', icon: MessageSquare },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-slate-100">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl admin-gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold admin-gradient-text">نوبت‌یار</div>
            <div className="text-xs text-slate-500">پنل مدیریت</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'admin-gradient-primary text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          خروج
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar fixed top-0 right-0 h-screen w-64 z-40 hidden lg:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="admin-sidebar absolute top-0 right-0 h-screen w-64 flex flex-col admin-animate">
            <div className="p-4 flex justify-start">
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile menu button - rendered by parent */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-30 p-2 rounded-lg bg-white shadow-md"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>
    </>
  );
}

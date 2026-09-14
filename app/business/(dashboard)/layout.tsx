'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Scissors, Users, Clock, Calendar, UserCheck,
  BarChart3, Settings, CreditCard, LogOut, Menu, X, Bell, ChevronLeft
} from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

const NAV_ITEMS = [
  { href: '/business/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/business/services', label: 'خدمات', icon: Scissors },
  { href: '/business/staff', label: 'کارکنان', icon: Users },
  { href: '/business/working-hours', label: 'ساعات کاری', icon: Clock },
  { href: '/business/calendar', label: 'تقویم نوبت‌ها', icon: Calendar },
  { href: '/business/customers', label: 'مشتریان', icon: UserCheck },
  { href: '/business/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/business/settings', label: 'تنظیمات', icon: Settings },
  { href: '/business/subscription', label: 'اشتراک', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    fetch('/api/business/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.business) {
          setBusinessName(data.business.name);
          if (data.business.status !== 'APPROVED') {
            router.push('/business/register?status=pending');
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/business/auth/logout', { method: 'POST' });
    router.push('/business/login');
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />

      {/* Desktop Sidebar */}
      <aside className="glass-sidebar fixed top-0 right-0 h-screen w-64 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/business/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">ن</span>
            </div>
            <div>
              <div className="text-sm font-bold text-primary-custom">نوبت‌یار</div>
              <div className="text-xs text-secondary-custom">پنل کسب‌وکار</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30'
                    : 'text-secondary-custom hover:bg-white/5 hover:text-primary-custom'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            خروج
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="glass-sidebar absolute top-0 right-0 h-screen w-64 flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ن</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-primary-custom">نوبت‌یار</div>
                  <div className="text-xs text-secondary-custom">پنل کسب‌وکار</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-secondary-custom">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30'
                        : 'text-secondary-custom hover:bg-white/5 hover:text-primary-custom'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/5">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full">
                <LogOut className="w-5 h-5" />
                خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Top Header */}
        <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-secondary-custom">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-primary-custom hidden sm:block">
              {NAV_ITEMS.find(n => n.href === pathname)?.label || 'داشبورد'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-secondary-custom" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {businessName ? businessName.charAt(0) : 'ن'}
              </div>
              <span className="text-sm text-primary-custom hidden sm:block max-w-[120px] truncate">{businessName || 'کسب‌وکار'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

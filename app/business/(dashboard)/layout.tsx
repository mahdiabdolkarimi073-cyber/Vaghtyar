'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Scissors, Users, Clock, Calendar, UserCheck,
  BarChart3, Settings, CreditCard, LogOut, Menu, X, Bell, MessageSquare, Receipt
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/business/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/business/services', label: 'خدمات', icon: Scissors },
  { href: '/business/staff', label: 'کارکنان', icon: Users },
  { href: '/business/working-hours', label: 'ساعات کاری', icon: Clock },
  { href: '/business/calendar', label: 'تقویم نوبت‌ها', icon: Calendar },
  { href: '/business/customers', label: 'مشتریان', icon: UserCheck },
  { href: '/business/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/business/sms', label: 'پیامک', icon: MessageSquare },
  { href: '/business/payments', label: 'پرداخت‌ها', icon: Receipt },
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

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-soft'
        : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
    }`;

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-border">
        <Link href="/business/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">ن</span>
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">نوبت‌یار</div>
            <div className="text-xs text-text-secondary">پنل کسب‌وکار</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all w-full">
          <LogOut className="w-5 h-5" />
          خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 right-0 h-screen w-64 z-40 hidden lg:flex flex-col bg-surface border-l border-border">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 right-0 h-screen w-64 flex flex-col bg-surface border-l border-border animate-slide-in-right">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ن</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary">نوبت‌یار</div>
                  <div className="text-xs text-text-secondary">پنل کسب‌وکار</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={navLinkClass(isActive)}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all w-full">
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
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-6 h-6 text-text-primary" />
            </button>
            <h1 className="text-lg font-bold text-text-primary hidden sm:block">
              {NAV_ITEMS.find(n => n.href === pathname)?.label || 'داشبورد'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {businessName ? businessName.charAt(0) : 'ن'}
              </div>
              <span className="text-sm text-text-primary hidden sm:block max-w-[120px] truncate">{businessName || 'کسب‌وکار'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

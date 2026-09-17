'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Scissors, Users, Clock, Calendar, UserCheck,
  BarChart3, Settings, CreditCard, LogOut, Menu, X, Bell, MessageSquare, Receipt,
  ChevronLeft, Sparkles
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

const NAV_SECTIONS: { title: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: 'نمای کلی',
    items: [
      { href: '/business/dashboard', label: 'داشبورد', icon: LayoutDashboard },
    ],
  },
  {
    title: 'مدیریت',
    items: [
      { href: '/business/services', label: 'خدمات', icon: Scissors },
      { href: '/business/staff', label: 'کارکنان', icon: Users },
      { href: '/business/working-hours', label: 'ساعات کاری', icon: Clock },
      { href: '/business/calendar', label: 'تقویم نوبت‌ها', icon: Calendar },
      { href: '/business/customers', label: 'مشتریان', icon: UserCheck },
    ],
  },
  {
    title: 'بازار و ارتباط',
    items: [
      { href: '/business/reports', label: 'گزارش‌ها', icon: BarChart3 },
      { href: '/business/sms', label: 'پیامک', icon: MessageSquare },
    ],
  },
  {
    title: 'حساب',
    items: [
      { href: '/business/payments', label: 'پرداخت‌ها', icon: Receipt },
      { href: '/business/subscription', label: 'اشتراک', icon: CreditCard },
      { href: '/business/settings', label: 'تنظیمات', icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const { settings } = useSiteSettings();

  const renderSidebarLogo = () =>
    settings.site_logo ? (
      <img src={settings.site_logo} alt={settings.site_name} className="w-10 h-10 rounded-xl object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
        <span className="text-white font-bold text-lg">{settings.site_name.charAt(0)}</span>
      </div>
    );

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

  const currentLabel = NAV_SECTIONS
    .flatMap(s => s.items)
    .find(n => n.href === pathname)?.label || 'داشبورد';

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'nav-item-active text-white'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  const sidebarInner = (
    <>
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/business/dashboard" className="flex items-center gap-3">
          {renderSidebarLogo()}
          <div>
            <div className="text-sm font-bold text-white">{settings.site_name}</div>
            <div className="text-[11px] text-slate-400">پنل مدیریت کسب‌وکار</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 sidebar-nav-scroll">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.title}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
          <LogOut className="w-[18px] h-[18px]" />
          خروج از حساب
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 right-0 h-screen w-64 z-40 hidden lg:flex flex-col glass-sidebar">
        {sidebarInner}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 right-0 h-screen w-64 flex flex-col glass-sidebar animate-slide-in-right">
            <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderSidebarLogo()}
                <div>
                  <div className="text-sm font-bold text-white">{settings.site_name}</div>
                  <div className="text-[11px] text-slate-400">پنل کسب‌وکار</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.title}</div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={navLinkClass(isActive)}>
                          <item.icon className="w-[18px] h-[18px] shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-3 pb-4 border-t border-white/5 pt-3">
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
                <LogOut className="w-[18px] h-[18px]" />
                خروج از حساب
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-lg border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-6 h-6 text-text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold text-text-primary">{currentLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link href="/business/subscription" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/8 text-primary text-xs font-medium hover:bg-primary/12 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              ارتقا پلن
            </Link>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-primary">
                {businessName ? businessName.charAt(0) : 'ن'}
              </div>
              <span className="text-sm text-text-primary hidden md:block max-w-[120px] truncate font-medium">{businessName || 'کسب‌وکار'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto section-fade">
          {children}
        </div>
      </div>
    </div>
  );
}

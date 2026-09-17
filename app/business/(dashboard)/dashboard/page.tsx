'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, XCircle, DollarSign, TrendingUp, TrendingDown, Bell, ArrowLeft, CheckCircle2, Users, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import { useBusinessSSE } from '@/hooks/useBusinessSSE';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits } from '@/lib/constants';

interface Stats {
  todayAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayRevenueTrend: number;
  weekRevenueTrend: number;
  monthRevenueTrend: number;
}

interface UpcomingApp {
  id: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerMobile: string;
  serviceName: string;
  staffName: string;
  status: string;
  source: string;
}

interface ChartData {
  revenue: { date: string; jalaliDate: string; revenue: number }[];
  appointments: { date: string; jalaliDate: string; confirmed: number; pending: number; completed: number; cancelled: number }[];
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'default'> = {
  CONFIRMED: 'primary',
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'default',
};

const statusLabel: Record<string, string> = {
  CONFIRMED: 'تایید شده',
  PENDING: 'در انتظار',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'حاضر نشده',
};

const statusDot: Record<string, string> = {
  CONFIRMED: 'bg-primary',
  PENDING: 'bg-warning',
  COMPLETED: 'bg-secondary',
  CANCELLED: 'bg-error',
  NO_SHOW: 'bg-muted',
};

function MiniStatCard({ icon, label, value, suffix, gradient, trend, delay }: {
  icon: React.ReactNode; label: string; value: number; suffix?: string;
  gradient: string; trend?: { value: number; isUp: boolean }; delay: number;
}) {
  const gradients: Record<string, string> = {
    primary: 'from-primary to-primary-light',
    accent: 'from-primary-light to-secondary',
    success: 'from-secondary to-green-600',
    warning: 'from-warning to-orange-500',
    danger: 'from-error to-red-600',
  };
  const iconBg: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-primary-light/10 text-primary-light',
    success: 'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-error/10 text-error',
  };

  return (
    <div
      className="bg-surface border border-border rounded-2xl p-4 lg:p-5 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[gradient]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${trend.isUp ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {toPersianDigits(Math.abs(trend.value))}٪
          </div>
        )}
      </div>
      <div className="text-xl lg:text-2xl font-bold text-text-primary">
        {toPersianDigits(value.toLocaleString('en-US'))}{suffix}
      </div>
      <div className="text-[13px] text-text-secondary mt-0.5">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingApp[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [chartsLocked, setChartsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([
        businessFetch<Stats>('/api/business/dashboard/stats'),
        businessFetch<UpcomingApp[]>('/api/business/dashboard/upcoming'),
      ]);
      setStats(s);
      setUpcoming(u);
      try {
        const c = await businessFetch<ChartData>('/api/business/dashboard/charts');
        setCharts(c);
        setChartsLocked(false);
      } catch {
        setChartsLocked(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useBusinessSSE((event) => {
    if (event.type === 'appointment_created' || event.type === 'appointment_updated') {
      fetchData();
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-border rounded-2xl h-28 glass-shimmer" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-border rounded-2xl h-28 glass-shimmer" />)}
        </div>
        <div className="bg-surface border border-border rounded-2xl h-80 glass-shimmer" />
      </div>
    );
  }

  const pendingCount = stats?.pendingAppointments ?? 0;

  return (
    <div className="space-y-6">
      {/* Pending Alert */}
      {pendingCount > 0 && (
        <Link href="/business/calendar" className="block">
          <div className="bg-gradient-to-l from-warning/10 to-warning/5 border border-warning/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-card-hover transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary">{toPersianDigits(pendingCount)} نوبت در انتظار تایید</div>
                <div className="text-xs text-text-secondary">برای مدیریت نوبت‌ها کلیک کنید</div>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-warning group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <MiniStatCard icon={<Calendar className="w-5 h-5 text-white" />} label="نوبت‌های امروز" value={stats?.todayAppointments ?? 0} gradient="primary" delay={0} />
        <MiniStatCard icon={<Clock className="w-5 h-5 text-white" />} label="در انتظار تایید" value={stats?.pendingAppointments ?? 0} gradient="warning" delay={100} />
        <MiniStatCard icon={<XCircle className="w-5 h-5 text-white" />} label="لغو شده امروز" value={stats?.cancelledAppointments ?? 0} gradient="danger" delay={200} />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <MiniStatCard icon={<DollarSign className="w-5 h-5 text-white" />} label="درآمد امروز" value={stats?.todayRevenue ?? 0} suffix=" ت" gradient="success" delay={0} />
        <MiniStatCard icon={<TrendingUp className="w-5 h-5 text-white" />} label="درآمد هفته" value={stats?.weekRevenue ?? 0} suffix=" ت" gradient="accent" delay={100} trend={stats ? { value: Math.abs(stats.weekRevenueTrend), isUp: stats.weekRevenueTrend >= 0 } : undefined} />
        <MiniStatCard icon={<TrendingUp className="w-5 h-5 text-white" />} label="درآمد ماه" value={stats?.monthRevenue ?? 0} suffix=" ت" gradient="primary" delay={200} trend={stats ? { value: Math.abs(stats.monthRevenueTrend), isUp: stats.monthRevenueTrend >= 0 } : undefined} />
      </div>

      {/* Charts */}
      {chartsLocked ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-card">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">گزارش درآمد در پلن شما فعال نیست</h3>
          <p className="text-sm text-text-secondary mb-4">برای مشاهده نمودار درآمد، پلن خود را ارتقا دهید.</p>
          <Link href="/business/subscription" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-soft hover:shadow-card-hover transition-all">
            <Sparkles className="w-4 h-4" /> ارتقای پلن
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-text-primary mb-1">درآمد ۷ روز اخیر</h3>
          <p className="text-xs text-text-secondary mb-4">روند درآمد روزانه شما</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts?.revenue || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D7377" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0D7377" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="jalaliDate" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid #E2E8F0', borderRadius: 12, color: '#1E293B', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0D7377" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-text-primary mb-1">نوبت‌های ۷ روز اخیر</h3>
          <p className="text-xs text-text-secondary mb-4">تعداد نوبت‌ها بر اساس وضعیت</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.appointments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="jalaliDate" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid #E2E8F0', borderRadius: 12, color: '#1E293B', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="confirmed" stackId="a" fill="#0D7377" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completed" stackId="a" fill="#4CAF82" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
      )}

      {/* Today's Appointments */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">نوبت‌های امروز</h3>
            <GlassBadge variant="primary">{toPersianDigits(upcoming.length)} نوبت</GlassBadge>
          </div>
          <Link href="/business/calendar" className="text-xs text-primary hover:text-primary-light font-medium flex items-center gap-1 transition-colors">
            مشاهده همه
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
              <Calendar className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">نوبتی برای امروز باقی نمانده است</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((app) => {
              const time = new Date(app.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex flex-col items-center justify-center text-white shrink-0 shadow-soft">
                      <span className="text-[10px] font-medium opacity-80">{time.split(':')[0]}</span>
                      <span className="text-sm font-bold">:{time.split(':')[1]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{app.customerName}</div>
                      <div className="text-xs text-text-secondary truncate">{app.serviceName} - {app.staffName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${statusDot[app.status] || 'bg-muted'}`} />
                    <span className="text-xs text-text-secondary">{statusLabel[app.status] || app.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

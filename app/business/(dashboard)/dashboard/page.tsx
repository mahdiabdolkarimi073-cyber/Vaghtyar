'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, XCircle, DollarSign, TrendingUp, Bell } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/ui/StatCard';
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingApp[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [s, u, c] = await Promise.all([
        businessFetch<Stats>('/api/business/dashboard/stats'),
        businessFetch<UpcomingApp[]>('/api/business/dashboard/upcoming'),
        businessFetch<ChartData>('/api/business/dashboard/charts'),
      ]);
      setStats(s);
      setUpcoming(u);
      setCharts(c);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-border rounded-xl shadow-card h-28 glass-shimmer" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-border rounded-xl shadow-card h-28 glass-shimmer" />)}
        </div>
        <div className="bg-surface border border-border rounded-xl shadow-card h-80 glass-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Calendar className="w-5 h-5 text-white" />} label="نوبت‌های امروز" value={stats?.todayAppointments ?? 0} gradient="primary" delay={0} />
        <StatCard icon={<Clock className="w-5 h-5 text-white" />} label="در انتظار تایید" value={stats?.pendingAppointments ?? 0} gradient="warning" delay={100} />
        <StatCard icon={<XCircle className="w-5 h-5 text-white" />} label="لغو شده امروز" value={stats?.cancelledAppointments ?? 0} gradient="danger" delay={200} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<DollarSign className="w-5 h-5 text-white" />} label="درآمد امروز" value={stats?.todayRevenue ?? 0} suffix=" ت" gradient="success" delay={0} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-white" />} label="درآمد هفته" value={stats?.weekRevenue ?? 0} suffix=" ت" gradient="accent" delay={100} trend={stats ? { value: Math.abs(stats.weekRevenueTrend), isUp: stats.weekRevenueTrend >= 0 } : undefined} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-white" />} label="درآمد ماه" value={stats?.monthRevenue ?? 0} suffix=" ت" gradient="primary" delay={200} trend={stats ? { value: Math.abs(stats.monthRevenueTrend), isUp: stats.monthRevenueTrend >= 0 } : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">درآمد ۷ روز اخیر</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.revenue || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D7377" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0D7377" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="jalaliDate" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: 12, color: '#1E293B' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0D7377" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">نوبت‌های ۷ روز اخیر</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.appointments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="jalaliDate" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: 12, color: '#1E293B' }} />
              <Bar dataKey="confirmed" stackId="a" fill="#0D7377" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completed" stackId="a" fill="#4CAF82" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-primary">نوبت‌های امروز</h3>
          <GlassBadge variant="primary">{toPersianDigits(upcoming.length)} نوبت</GlassBadge>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">نوبتی برای امروز باقی نمانده است</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((app) => {
              const time = new Date(app.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {time}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{app.customerName}</div>
                      <div className="text-xs text-text-secondary">{app.serviceName} - {app.staffName}</div>
                    </div>
                  </div>
                  <GlassBadge variant={statusVariant[app.status] || 'default'}>{statusLabel[app.status] || app.status}</GlassBadge>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {(stats?.pendingAppointments ?? 0) > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-text-primary">یادآوری‌ها</h3>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10 border border-warning/20">
            <span className="text-sm text-warning">{toPersianDigits(stats?.pendingAppointments ?? 0)} نوبت در انتظار تایید</span>
            <GlassBadge variant="warning">نیاز به اقدام</GlassBadge>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

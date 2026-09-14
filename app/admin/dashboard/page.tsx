'use client';

import { useEffect, useState } from 'react';
import { Building2, Calendar, DollarSign, Star } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import ChartCard from '@/components/admin/ChartCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA, formatPrice } from '@/lib/constants';

interface DashboardData {
  businesses: { total: number; active: number; pending: number; inactive: number; monthlyGrowth: { month: string; count: number }[] };
  appointments: { today: number; thisMonth: number; dailyGrowth: { date: string; count: number }[] };
  revenue: { thisMonth: number; total: number };
  activeSubscriptions: number;
  recentBusinesses: any[];
  recentPayments: any[];
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  APPROVED: 'success', PENDING: 'warning', SUSPENDED: 'danger', REJECTED: 'danger',
};
const statusLabelMap: Record<string, string> = {
  APPROVED: 'تایید شده', PENDING: 'در انتظار', SUSPENDED: 'معلق', REJECTED: 'رد شده',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="داشبورد" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="کسب‌وکارها" value={data?.businesses.total ?? 0} subtitle={`فعال: ${toPersianDigits(data?.businesses.active ?? 0)} / در انتظار: ${toPersianDigits(data?.businesses.pending ?? 0)}`} icon={<Building2 className="w-5 h-5" />} gradient="violet" isLoading={loading} />
            <StatsCard title="نوبت‌های امروز" value={data?.appointments.today ?? 0} subtitle={`این ماه: ${toPersianDigits(data?.appointments.thisMonth ?? 0)}`} icon={<Calendar className="w-5 h-5" />} gradient="sky" isLoading={loading} />
            <StatsCard title="درآمد این ماه" value={formatPrice(data?.revenue.thisMonth ?? 0)} icon={<DollarSign className="w-5 h-5" />} gradient="emerald" isLoading={loading} />
            <StatsCard title="اشتراک‌های فعال" value={data?.activeSubscriptions ?? 0} icon={<Star className="w-5 h-5" />} gradient="amber" isLoading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="رشد کسب‌وکارها (۱۲ ماه)" isLoading={loading}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data?.businesses.monthlyGrowth || []}>
                  <defs><linearGradient id="bizGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#bizGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="نوبت‌های اخیر (۳۰ روز)" isLoading={loading}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.appointments.dailyGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-secondary mb-3">کسب‌وکارهای اخیر</h3>
              <DataTable
                columns={[
                  { key: 'name', header: 'نام' },
                  { key: 'category', header: 'دسته' },
                  { key: 'status', header: 'وضعیت', render: (r) => <StatusBadge status={r.status} variant={statusVariantMap[r.status] || 'neutral'}>{statusLabelMap[r.status] || r.status}</StatusBadge> },
                  { key: 'createdAt', header: 'تاریخ', render: (r) => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.createdAt))}</span> },
                ]}
                data={data?.recentBusinesses || []}
                isLoading={loading}
                emptyMessage="کسب‌وکاری ثبت نشده است"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-secondary mb-3">پرداخت‌های اخیر</h3>
              <DataTable
                columns={[
                  { key: 'business', header: 'کسب‌وکار', render: (r) => r.business?.name || '-' },
                  { key: 'amount', header: 'مبلغ', render: (r) => formatPrice(r.amount) },
                  { key: 'plan', header: 'طرح', render: (r) => r.plan?.name || '-' },
                  { key: 'status', header: 'وضعیت', render: (r) => <StatusBadge status={r.status} variant={r.status === 'SUCCESS' ? 'success' : r.status === 'PENDING' ? 'warning' : 'danger'}>{r.status === 'SUCCESS' ? 'موفق' : r.status === 'PENDING' ? 'در انتظار' : 'ناموفق'}</StatusBadge> },
                ]}
                data={data?.recentPayments || []}
                isLoading={loading}
                emptyMessage="پرداختی ثبت نشده است"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import StatCard from '@/components/ui/StatCard';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice } from '@/lib/constants';

interface ReportData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  cancellationRate: number;
  avgRevenuePerAppointment: number;
  revenueByService: { name: string; revenue: number; count: number }[];
  revenueByStaff: { name: string; revenue: number; count: number }[];
  dailyRevenue: { date: string; jalaliDate: string; revenue: number }[];
  dailyAppointments: { date: string; jalaliDate: string; confirmed: number; pending: number; completed: number; cancelled: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
}

type FilterType = 'today' | 'week' | 'month' | 'custom';

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getDates = (f: FilterType) => {
    const now = new Date();
    if (f === 'today') return { startDate: now.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
    if (f === 'week') { const d = new Date(); d.setDate(d.getDate() - 6); return { startDate: d.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }; }
    if (f === 'month') { const d = new Date(); d.setDate(d.getDate() - 29); return { startDate: d.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }; }
    return { startDate: customStart, endDate: customEnd };
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDates(filter);
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const data = await businessFetch<ReportData>(`/api/business/reports?${params}`);
      setReport(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filter, customStart, customEnd]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = () => {
    const { startDate, endDate } = getDates(filter);
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`/api/business/reports/export?${params}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-primary-custom">گزارش‌ها و درآمد</h2>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-primary-custom hover:bg-white/8 transition-all">
          <Download className="w-4 h-4" /> خروجی CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([['today', 'امروز'], ['week', 'این هفته'], ['month', 'این ماه'], ['custom', 'بازه دلخواه']] as const).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'gradient-primary text-white' : 'glass text-secondary-custom hover:text-primary-custom'}`}>{label}</button>
        ))}
      </div>

      {filter === 'custom' && (
        <div className="flex gap-2 items-center">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="glass-input px-3 py-2 text-sm" />
          <span className="text-secondary-custom text-xs">تا</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="glass-input px-3 py-2 text-sm" />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="glass h-24 rounded-2xl glass-shimmer" />)}</div>
          <div className="glass h-80 rounded-2xl glass-shimmer" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard icon={<DollarSign className="w-5 h-5 text-white" />} label="کل درآمد" value={report?.totalRevenue ?? 0} suffix=" ت" gradient="success" delay={0} />
            <StatCard icon={<Calendar className="w-5 h-5 text-white" />} label="کل نوبت‌ها" value={report?.totalAppointments ?? 0} gradient="primary" delay={100} />
            <StatCard icon={<CheckCircle className="w-5 h-5 text-white" />} label="تکمیل شده" value={report?.completedAppointments ?? 0} gradient="accent" delay={200} />
            <StatCard icon={<XCircle className="w-5 h-5 text-white" />} label="نرخ لغو" value={report?.cancellationRate ?? 0} suffix="٪" gradient="danger" delay={300} />
            <StatCard icon={<DollarSign className="w-5 h-5 text-white" />} label="میانگین درآمد/نوبت" value={report?.avgRevenuePerAppointment ?? 0} suffix=" ت" gradient="warning" delay={400} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-primary-custom mb-4">درآمد روزانه</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={report?.dailyRevenue || []}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="jalaliDate" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-primary-custom mb-4">نوبت‌ها بر اساس وضعیت</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={report?.statusBreakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} label={(e: { name: string; value: number }) => `${e.name}: ${toPersianDigits(e.value)}`}>
                    {(report?.statusBreakdown || []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-primary-custom mb-4">درآمد بر اساس خدمت</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report?.revenueByService || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc' }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-primary-custom mb-4">درآمد بر اساس کارکن</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report?.revenueByStaff || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc' }} />
                  <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

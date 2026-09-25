'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, DollarSign, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice } from '@/lib/constants';
import { toast } from 'sonner';

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

function MiniStat({ icon, label, value, suffix, color }: { icon: React.ReactNode; label: string; value: number; suffix?: string; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <div className="text-xl font-bold text-text-primary">{toPersianDigits(value.toLocaleString('en-US'))}{suffix}</div>
      <div className="text-[13px] text-text-secondary mt-0.5">{label}</div>
    </div>
  );
}

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
    } catch {
      toast.error('خطا در بارگذاری گزارش');
    } finally { setLoading(false); }
  }, [filter, customStart, customEnd]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = () => {
    const { startDate, endDate } = getDates(filter);
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`/api/business/reports/export?${params}`, '_blank');
  };

  const tooltipStyle = { background: 'rgba(255,255,255,0.98)', border: '1px solid #E2E8F0', borderRadius: 12, color: '#1E293B', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">گزارش‌ها و درآمد</h2>
          <p className="text-sm text-text-secondary mt-0.5">تحلیل عملکرد کسب‌وکار شما</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm text-text-primary hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> خروجی CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([['today', 'امروز'], ['week', 'این هفته'], ['month', 'این ماه'], ['custom', 'بازه دلخواه']] as const).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'gradient-primary text-white shadow-soft' : 'bg-surface border border-border text-text-secondary hover:bg-muted'}`}>{label}</button>
        ))}
      </div>

      {filter === 'custom' && (
        <div className="flex gap-2 items-center flex-wrap">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="premium-input px-4 py-2.5 text-sm" />
          <span className="text-text-secondary text-xs">تا</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="premium-input px-4 py-2.5 text-sm" />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="bg-surface border border-border rounded-2xl h-28 glass-shimmer" />)}</div>
          <div className="bg-surface border border-border rounded-2xl h-80 glass-shimmer" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <MiniStat icon={<DollarSign className="w-5 h-5 text-white" />} label="کل درآمد" value={report?.totalRevenue ?? 0} suffix=" ت" color="bg-gradient-to-br from-secondary to-green-600" />
            <MiniStat icon={<Calendar className="w-5 h-5 text-white" />} label="کل نوبت‌ها" value={report?.totalAppointments ?? 0} color="bg-gradient-to-br from-primary to-primary-light" />
            <MiniStat icon={<CheckCircle className="w-5 h-5 text-white" />} label="تکمیل شده" value={report?.completedAppointments ?? 0} color="bg-gradient-to-br from-primary-light to-secondary" />
            <MiniStat icon={<XCircle className="w-5 h-5 text-white" />} label="نرخ لغو" value={report?.cancellationRate ?? 0} suffix="٪" color="bg-gradient-to-br from-error to-red-600" />
            <MiniStat icon={<TrendingUp className="w-5 h-5 text-white" />} label="میانگین/نوبت" value={report?.avgRevenuePerAppointment ?? 0} suffix=" ت" color="bg-gradient-to-br from-warning to-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-text-primary mb-1">درآمد روزانه</h3>
              <p className="text-xs text-text-secondary mb-4">روند درآمد در بازه انتخابی</p>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={report?.dailyRevenue || []}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4CAF82" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4CAF82" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="jalaliDate" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#4CAF82" strokeWidth={2.5} fill="url(#rGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-text-primary mb-1">نوبت‌ها بر اساس وضعیت</h3>
              <p className="text-xs text-text-secondary mb-4">توزیع نوبت‌ها</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={report?.statusBreakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} label={(e: { name: string; value: number }) => `${e.name}: ${toPersianDigits(e.value)}`}>
                    {(report?.statusBreakdown || []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-text-primary mb-4">درآمد بر اساس خدمت</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report?.revenueByService || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#0D7377" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-text-primary mb-4">درآمد بر اساس کارکن</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report?.revenueByStaff || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#14A8AD" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

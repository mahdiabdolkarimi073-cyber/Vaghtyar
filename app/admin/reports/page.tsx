'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ChartCard from '@/components/admin/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toPersianDigits } from '@/lib/constants';
import { toast } from 'sonner';

const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

export default function AdminReportsPage() {
  const [tab, setTab] = useState('revenue');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=${tab}&period=${period}`);
      const d = await res.json();
      setData(d.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [tab, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportCsv = () => {
    if (data.length === 0) { toast.error('داده‌ای برای خروجی وجود ندارد'); return; }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(r => headers.map(h => r[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report-${tab}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('خروجی CSV دانلود شد');
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="گزارش‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setPeriod('daily')} className={`admin-input px-3 py-1.5 text-sm rounded-lg ${period === 'daily' ? 'admin-gradient-primary text-white' : ''}`}>روزانه</button>
              <button onClick={() => setPeriod('monthly')} className={`admin-input px-3 py-1.5 text-sm rounded-lg ${period === 'monthly' ? 'admin-gradient-primary text-white' : ''}`}>ماهانه</button>
            </div>
            <button onClick={exportCsv} className="admin-gradient-emerald text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" /> خروجی CSV
            </button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-surface border border-border rounded-xl p-1">
              <TabsTrigger value="revenue" className="rounded-lg">درآمد</TabsTrigger>
              <TabsTrigger value="businesses" className="rounded-lg">کسب‌وکارها</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-lg">نوبت‌ها</TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-lg">اشتراک‌ها</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <ChartCard title="گزارش درآمد" isLoading={loading}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                    <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            <TabsContent value="businesses">
              <ChartCard title="فعالیت کسب‌وکارها بر اساس دسته" isLoading={loading}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            <TabsContent value="appointments">
              <ChartCard title="گزارش نوبت‌ها" isLoading={loading}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data}>
                    <defs><linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#appGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            <TabsContent value="subscriptions">
              <ChartCard title="توزیع طرح‌های اشتراک" isLoading={loading}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={(e: any) => `${e.name}: ${toPersianDigits(e.value)}`}>
                      {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

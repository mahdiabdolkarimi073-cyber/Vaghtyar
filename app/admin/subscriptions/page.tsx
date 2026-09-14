'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const planVariantMap: Record<string, 'neutral' | 'info' | 'primary' | 'warning'> = {
  'رایگان': 'neutral', 'پایه': 'info', 'حرفه‌ای': 'primary', 'سازمانی': 'warning',
};

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [extendId, setExtendId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions?status=${tab}`);
      const d = await res.json();
      setData(d.data || d || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const extendSub = async () => {
    if (!extendId) return;
    try {
      await fetch(`/api/admin/subscriptions/${extendId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ extendDays: extendDays }) });
      toast.success('اشتراک تمدید شد');
      setExtendId(null); setExtendDays(30); fetchData();
    } catch { toast.error('خطا'); }
  };

  const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت اشتراک‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-surface border border-border rounded-xl p-1">
              <TabsTrigger value="active" className="rounded-lg">فعال</TabsTrigger>
              <TabsTrigger value="expiring" className="rounded-lg">در حال انقضا</TabsTrigger>
              <TabsTrigger value="expired" className="rounded-lg">منقضی شده</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {tab === 'expiring' && (
                <div className="admin-card p-4 mb-4 bg-warning/10 border-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="text-sm text-amber-700">{toPersianDigits(data.length)} اشتراک در ۷ روز آینده منقضی می‌شود</span>
                </div>
              )}

              <DataTable
                columns={[
                  { key: 'business', header: 'کسب‌وکار', render: r => r.business?.name || '-' },
                  { key: 'plan', header: 'طرح', render: r => <StatusBadge variant={planVariantMap[r.plan?.name] || 'neutral'}>{r.plan?.name || '-'}</StatusBadge> },
                  { key: 'startDate', header: 'شروع', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.startDate))}</span> },
                  { key: 'endDate', header: 'پایان', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.endDate))}</span> },
                  { key: 'daysLeft', header: 'روز باقی‌مانده', render: r => {
                    const d = daysRemaining(r.endDate);
                    return <StatusBadge variant={d > 30 ? 'success' : d > 7 ? 'warning' : 'danger'}>{toPersianDigits(d)} روز</StatusBadge>;
                  }},
                  { key: 'actions', header: 'عملیات', render: r => (
                    <button onClick={() => setExtendId(r.id)} className="admin-gradient-sky text-white px-3 py-1.5 rounded-lg text-xs font-medium">تمدید</button>
                  )},
                ]}
                data={data}
                isLoading={loading}
                emptyMessage="اشتراکی وجود ندارد"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!extendId} onOpenChange={() => setExtendId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تمدید اشتراک</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-text-secondary block">تعداد روزهای تمدید</label>
            <input type="number" value={extendDays} onChange={e => setExtendDays(Number(e.target.value))} className="admin-input w-full h-10 px-4 text-sm" min={1} />
          </div>
          <DialogFooter>
            <button onClick={() => setExtendId(null)} className="admin-input px-4 py-2 rounded-xl text-sm">انصراف</button>
            <button onClick={extendSub} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium">تمدید</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

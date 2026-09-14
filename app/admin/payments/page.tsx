'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatPrice, formatDateShortFA } from '@/lib/constants';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'neutral',
};
const statusLabelMap: Record<string, string> = {
  SUCCESS: 'موفق', PENDING: 'در انتظار', FAILED: 'ناموفق', REFUNDED: 'بازگشت‌داده شده',
};

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, successful: 0, failed: 0, refunded: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));
    try {
      const res = await fetch(`/api/admin/payments?${params}`);
      const d = await res.json();
      setData(d.data || []);
      setTotalPages(d.totalPages || 1);
      const all = d.data || [];
      setSummary({
        total: all.reduce((s: number, p: any) => s + (p.status === 'SUCCESS' ? p.amount : 0), 0),
        successful: all.filter((p: any) => p.status === 'SUCCESS').length,
        failed: all.filter((p: any) => p.status === 'FAILED').length,
        refunded: all.filter((p: any) => p.status === 'REFUNDED').length,
      });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refund = async () => {
    if (!refundId) return;
    try {
      await fetch(`/api/admin/payments/${refundId}`, { method: 'POST' });
      toast.success('بازگشت وجه ثبت شد');
      setRefundId(null); fetchData();
    } catch { toast.error('خطا'); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت پرداخت‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="درآمد کل" value={formatPrice(summary.total)} icon={<DollarSign className="w-5 h-5" />} gradient="emerald" isLoading={loading} />
            <StatsCard title="پرداخت‌های موفق" value={summary.successful} icon={<CheckCircle className="w-5 h-5" />} gradient="sky" isLoading={loading} />
            <StatsCard title="پرداخت‌های ناموفق" value={summary.failed} icon={<XCircle className="w-5 h-5" />} gradient="rose" isLoading={loading} />
            <StatsCard title="بازگشت‌ها" value={summary.refunded} icon={<RotateCcw className="w-5 h-5" />} gradient="amber" isLoading={loading} />
          </div>

          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="admin-input h-10 px-4 text-sm min-w-[150px]">
              <option value="">همه وضعیت‌ها</option>
              <option value="SUCCESS">موفق</option>
              <option value="PENDING">در انتظار</option>
              <option value="FAILED">ناموفق</option>
              <option value="REFUNDED">بازگشت‌داده شده</option>
            </select>
          </div>

          <DataTable
            columns={[
              { key: 'business', header: 'کسب‌وکار', render: r => r.business?.name || '-' },
              { key: 'amount', header: 'مبلغ', render: r => formatPrice(r.amount) },
              { key: 'plan', header: 'طرح', render: r => r.plan?.name || '-' },
              { key: 'status', header: 'وضعیت', render: r => <StatusBadge variant={statusVariantMap[r.status] || 'neutral'}>{statusLabelMap[r.status] || r.status}</StatusBadge> },
              { key: 'createdAt', header: 'تاریخ', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.createdAt))}</span> },
              { key: 'actions', header: 'عملیات', render: r => r.status === 'SUCCESS' ? (
                <button onClick={() => setRefundId(r.id)} className="text-error hover:bg-error/10 p-1.5 rounded-lg text-xs font-medium">بازگشت وجه</button>
              ) : '-' },
            ]}
            data={data}
            isLoading={loading}
            emptyMessage="پرداختی وجود ندارد"
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-input px-3 py-1.5 text-sm rounded-lg disabled:opacity-50">قبلی</button>
              <span className="text-sm text-text-muted">{toPersianDigits(page)} از {toPersianDigits(totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-input px-3 py-1.5 text-sm rounded-lg disabled:opacity-50">بعدی</button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!refundId} onOpenChange={() => setRefundId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>بازگشت وجه</AlertDialogTitle><AlertDialogDescription>آیا از بازگشت وجه این پرداخت اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={refund} className="bg-error hover:bg-red-600">تایید بازگشت</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

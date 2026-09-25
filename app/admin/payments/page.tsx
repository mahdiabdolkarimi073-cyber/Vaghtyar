'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatPrice, formatDateShortFA } from '@/lib/constants';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  COMPLETED: 'success', CONFIRMED: 'warning', CANCELLED: 'danger', PENDING: 'neutral', NO_SHOW: 'danger',
};
const statusLabelMap: Record<string, string> = {
  COMPLETED: 'تکمیل شده', CONFIRMED: 'تأیید شده', CANCELLED: 'لغو شده', PENDING: 'در انتظار', NO_SHOW: 'حاضر نشده',
};

interface AppointmentRow {
  id: string;
  status: string;
  startTime: string;
  totalPrice: number;
  business: { id: string; name: string };
  service: { id: string; name: string; price: number };
  customer: { id: string; name: string; mobile: string };
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalRevenue: 0, completed: 0, cancelled: 0, pending: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));
    try {
      const res = await fetch(`/api/admin/payments?${params}`);
      const d = await res.json();
      const rows: AppointmentRow[] = d.data || [];
      setData(rows);
      setTotalPages(d.totalPages || 1);
      setSummary({
        totalRevenue: rows.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + (r.totalPrice || r.service?.price || 0), 0),
        completed: rows.filter(r => r.status === 'COMPLETED').length,
        cancelled: rows.filter(r => r.status === 'CANCELLED').length,
        pending: rows.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED').length,
      });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت نوبت‌ها و درآمد" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="درآمد این صفحه" value={formatPrice(summary.totalRevenue)} icon={<DollarSign className="w-5 h-5" />} gradient="success" isLoading={loading} />
            <StatsCard title="تکمیل شده" value={summary.completed} icon={<CheckCircle className="w-5 h-5" />} gradient="accent" isLoading={loading} />
            <StatsCard title="لغو شده" value={summary.cancelled} icon={<XCircle className="w-5 h-5" />} gradient="danger" isLoading={loading} />
            <StatsCard title="در انتظار/تأیید" value={summary.pending} icon={<Calendar className="w-5 h-5" />} gradient="warning" isLoading={loading} />
          </div>

          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="admin-input h-10 px-4 text-sm min-w-[150px]">
              <option value="">همه وضعیت‌ها</option>
              <option value="COMPLETED">تکمیل شده</option>
              <option value="CONFIRMED">تأیید شده</option>
              <option value="PENDING">در انتظار</option>
              <option value="CANCELLED">لغو شده</option>
            </select>
          </div>

          <DataTable
            columns={[
              { key: 'business', header: 'کسب‌وکار', render: r => r.business?.name || '-' },
              { key: 'service', header: 'خدمت', render: r => r.service?.name || '-' },
              { key: 'customer', header: 'مشتری', render: r => r.customer?.name || '-' },
              { key: 'totalPrice', header: 'مبلغ', render: r => formatPrice(r.totalPrice || r.service?.price || 0) },
              { key: 'status', header: 'وضعیت', render: r => <StatusBadge variant={statusVariantMap[r.status] || 'neutral'}>{statusLabelMap[r.status] || r.status}</StatusBadge> },
              { key: 'startTime', header: 'تاریخ', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.startTime))}</span> },
            ]}
            data={data}
            isLoading={loading}
            emptyMessage="نوبتی وجود ندارد"
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
    </>
  );
}

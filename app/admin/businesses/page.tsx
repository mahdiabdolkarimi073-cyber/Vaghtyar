'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, Eye, Edit, Ban, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  APPROVED: 'success', PENDING: 'warning', SUSPENDED: 'danger', REJECTED: 'danger',
};
const statusLabelMap: Record<string, string> = {
  APPROVED: 'تایید شده', PENDING: 'در انتظار', SUSPENDED: 'معلق', REJECTED: 'رد شده',
};

export default function AdminBusinessesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));
    try {
      const res = await fetch(`/api/admin/businesses?${params}`);
      const d = await res.json();
      setData(d.data || []);
      setTotalPages(d.totalPages || 1);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('وضعیت به‌روزرسانی شد');
      fetchData();
    } catch { toast.error('خطا در به‌روزرسانی'); }
  };

  const deleteBusiness = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/businesses/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('کسب‌وکار حذف شد');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('خطا در حذف'); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت کسب‌وکارها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="جستجوی کسب‌وکار..."
                className="admin-input w-full h-10 pr-10 px-4 text-sm"
              />
            </div>
            <select
              value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-input h-10 px-4 text-sm min-w-[150px]"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="APPROVED">تایید شده</option>
              <option value="PENDING">در انتظار</option>
              <option value="SUSPENDED">معلق</option>
            </select>
          </div>

          <DataTable
            columns={[
              { key: 'name', header: 'نام' },
              { key: 'category', header: 'دسته' },
              { key: 'neighborhood', header: 'محله', render: r => r.neighborhood || '-' },
              { key: 'status', header: 'وضعیت', render: r => <StatusBadge status={r.status} variant={statusVariantMap[r.status] || 'neutral'}>{statusLabelMap[r.status] || r.status}</StatusBadge> },
              { key: 'createdAt', header: 'تاریخ ثبت', render: r => <span className="text-xs text-slate-400">{formatDateShortFA(new Date(r.createdAt))}</span> },
              { key: 'actions', header: 'عملیات', render: r => (
                <div className="flex items-center gap-1">
                  {r.status === 'PENDING' && (
                    <button onClick={() => updateStatus(r.id, 'APPROVED')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50" title="تایید">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50" title="مشاهده">
                    <Eye className="w-4 h-4" />
                  </button>
                  {r.status === 'APPROVED' && (
                    <button onClick={() => updateStatus(r.id, 'SUSPENDED')} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50" title="تعلیق">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )},
            ]}
            data={data}
            isLoading={loading}
            emptyMessage="کسب‌وکاری یافت نشد"
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-input px-3 py-1.5 text-sm rounded-lg disabled:opacity-50">قبلی</button>
              <span className="text-sm text-slate-500">{toPersianDigits(page)} از {toPersianDigits(totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-input px-3 py-1.5 text-sm rounded-lg disabled:opacity-50">بعدی</button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>جزئیات کسب‌وکار</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">نام:</span> <span className="text-slate-700 font-medium">{selected.name}</span></div>
                <div><span className="text-slate-400">دسته:</span> <span className="text-slate-700">{selected.category}</span></div>
                <div><span className="text-slate-400">شهر:</span> <span className="text-slate-700">{selected.city}</span></div>
                <div><span className="text-slate-400">محله:</span> <span className="text-slate-700">{selected.neighborhood || '-'}</span></div>
                <div><span className="text-slate-400">تلفن:</span> <span className="text-slate-700">{selected.phone || '-'}</span></div>
                <div><span className="text-slate-400">ایمیل:</span> <span className="text-slate-700">{selected.email || '-'}</span></div>
                <div><span className="text-slate-400">وضعیت:</span> <StatusBadge status={selected.status} variant={statusVariantMap[selected.status] || 'neutral'}>{statusLabelMap[selected.status] || selected.status}</StatusBadge></div>
                <div><span className="text-slate-400">تاریخ ثبت:</span> <span className="text-slate-700">{formatDateShortFA(new Date(selected.createdAt))}</span></div>
              </div>
              {selected.description && <p className="text-sm text-slate-600 border-t pt-3">{selected.description}</p>}
              <div className="flex gap-2 pt-3 border-t">
                {selected.status === 'PENDING' && (
                  <button onClick={() => { updateStatus(selected.id, 'APPROVED'); setSelected(null); }} className="admin-gradient-emerald text-white px-4 py-2 rounded-xl text-sm font-medium">تایید</button>
                )}
                {selected.status === 'APPROVED' && (
                  <button onClick={() => { updateStatus(selected.id, 'SUSPENDED'); setSelected(null); }} className="admin-gradient-amber text-white px-4 py-2 rounded-xl text-sm font-medium">تعلیق</button>
                )}
                {selected.status === 'SUSPENDED' && (
                  <button onClick={() => { updateStatus(selected.id, 'APPROVED'); setSelected(null); }} className="admin-gradient-emerald text-white px-4 py-2 rounded-xl text-sm font-medium">رفع تعلیق</button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کسب‌وکار</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این کسب‌وکار اطمینان دارید؟ این عملیات قابل بازگشت نیست.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBusiness} className="bg-rose-500 hover:bg-rose-600">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

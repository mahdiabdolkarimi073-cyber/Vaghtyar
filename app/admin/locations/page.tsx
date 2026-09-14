'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminLocationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', cityId: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations');
      const d = await res.json();
      setData(d.cities || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addNeighborhood = async () => {
    try {
      await fetch('/api/admin/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      toast.success('محله اضافه شد');
      setShowAdd(false); setForm({ name: '', cityId: '' }); fetchData();
    } catch { toast.error('خطا'); }
  };

  const deleteLocation = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/locations/${deleteId}`, { method: 'DELETE' });
      toast.success('محله حذف شد');
      setDeleteId(null); fetchData();
    } catch { toast.error('خطا'); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="شهرها و محله‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAdd(true)} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-primary/25">
              <Plus className="w-4 h-4" /> افزودن محله
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="admin-card p-5 h-28 admin-skeleton rounded-2xl" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="admin-card rounded-2xl p-12 text-center text-text-muted">شهری ثبت نشده است</div>
          ) : (
            data.map((city: any) => (
              <div key={city.id} className="admin-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-text-primary">{city.name}</h3>
                  <StatusBadge variant="primary">{toPersianDigits(city.businessCount || 0)} کسب‌وکار</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {<span className="text-sm text-text-muted">محله‌ها در صفحه کسب‌وکارها قابل مدیریت هستند</span>
                </div>
              </div>
            ))
          )}

          <div className="admin-card p-5 border-dashed border-2 border-border text-center">
            <p className="text-sm text-text-muted">بزودی: امکان افزودن شهر جدید</p>
          </div>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>افزودن محله</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm text-text-secondary mb-1 block">نام محله</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" /></div>
            <div><label className="text-sm text-text-secondary mb-1 block">شهر</label>
              <select value={form.cityId} onChange={e => setForm({...form, cityId: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                <option value="">انتخاب شهر</option>
                {data.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="admin-input px-4 py-2 rounded-xl text-sm">انصراف</button>
            <button onClick={addNeighborhood} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium">افزودن</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>حذف محله</AlertDialogTitle><AlertDialogDescription>آیا از حذف این محله اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={deleteLocation} className="bg-error hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

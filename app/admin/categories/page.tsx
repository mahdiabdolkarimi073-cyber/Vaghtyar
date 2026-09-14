'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

const accentColors = ['violet', 'sky', 'emerald', 'amber', 'rose'];
const accentBorder: Record<string, string> = {
  violet: 'border-r-violet-400', sky: 'border-r-sky-400', emerald: 'border-r-emerald-400', amber: 'border-r-amber-400', rose: 'border-r-rose-400',
};

export default function AdminCategoriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '', description: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const d = await res.json();
      setData(d.data || d || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    try {
      if (editing) {
        await fetch(`/api/admin/categories/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('دسته‌بندی ویرایش شد');
      } else {
        await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('دسته‌بندی ایجاد شد');
      }
      setShowAdd(false); setEditing(null); setForm({ name: '', icon: '', description: '' });
      fetchData();
    } catch { toast.error('خطا'); }
  };

  const deleteCategory = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('دسته‌بندی حذف شد');
      setDeleteId(null); fetchData();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت دسته‌بندی‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditing(null); setForm({ name: '', icon: '', description: '' }); setShowAdd(true); }} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-violet-500/25">
              <Plus className="w-4 h-4" /> افزودن دسته
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="admin-card p-5 h-32 admin-skeleton rounded-2xl" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="admin-card rounded-2xl p-12 text-center text-slate-400">دسته‌بندی وجود ندارد</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((cat, i) => (
                <div key={cat.id} className={`admin-card p-5 border-r-4 ${accentBorder[accentColors[i % accentColors.length]]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl">
                      {cat.icon || '✨'}
                    </div>
                    <StatusBadge variant="neutral">{toPersianDigits(cat._count?.businesses || 0)} کسب‌وکار</StatusBadge>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
                  {cat.description && <p className="text-sm text-slate-400">{cat.description}</p>}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => { setEditing(cat); setForm({ name: cat.name, icon: cat.icon || '', description: '' }); setShowAdd(true); }} className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'ویرایش دسته' : 'افزودن دسته جدید'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm text-slate-600 mb-1 block">نام</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" /></div>
            <div><label className="text-sm text-slate-600 mb-1 block">آیکون (اموجی)</label><input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" placeholder="✂️" /></div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="admin-input px-4 py-2 rounded-xl text-sm">انصراف</button>
            <button onClick={save} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium">ذخیره</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle><AlertDialogDescription>آیا از حذف این دسته‌بندی اطمینان دارید؟ در صورت وجود کسب‌وکار در این دسته، حذف ممکن نخواهد بود.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={deleteCategory} className="bg-rose-500 hover:bg-rose-600">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

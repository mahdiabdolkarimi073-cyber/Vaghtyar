'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
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
  const [form, setForm] = useState({ name: '', icon: '', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('نام دسته‌بندی الزامی است'); return; }
    try {
      if (editing) {
        await fetch(`/api/admin/categories/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('دسته‌بندی ویرایش شد');
      } else {
        await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('دسته‌بندی ایجاد شد');
      }
      setShowAdd(false); setEditing(null); setForm({ name: '', icon: '', image: '' });
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

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon || '', image: cat.image || '' });
    setShowAdd(true);
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت دسته‌بندی‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditing(null); setForm({ name: '', icon: '', image: '' }); setShowAdd(true); }} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-primary/25">
              <Plus className="w-4 h-4" /> افزودن دسته
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="admin-card p-5 h-32 admin-skeleton rounded-2xl" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="admin-card rounded-2xl p-12 text-center text-text-muted">دسته‌بندی وجود ندارد</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((cat, i) => (
                <div key={cat.id} className={`admin-card p-5 border-r-4 ${accentBorder[accentColors[i % accentColors.length]]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{cat.icon || '✨'}</span>
                      )}
                    </div>
                    <StatusBadge variant="neutral">{toPersianDigits(cat._count?.businesses || 0)} کسب‌وکار</StatusBadge>
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">{cat.name}</h3>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
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
            <div><label className="text-sm text-text-secondary mb-1 block">نام</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" /></div>
            <div><label className="text-sm text-text-secondary mb-1 block">آیکون (اموجی)</label><input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" placeholder="✂️" /></div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">تصویر (اختیاری)</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {form.image ? (
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{form.icon || '✨'}</span>
                  )}
                </div>
                {form.image ? (
                  <button onClick={() => setForm({...form, image: ''})} className="text-error hover:bg-error/10 p-2 rounded-lg flex items-center gap-1 text-sm">
                    <X className="w-4 h-4" /> حذف تصویر
                  </button>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="admin-input px-3 py-2 rounded-xl text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" /> آپلود تصویر
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">اگر تصویر آپلود شود، به جای اموجی نمایش داده می‌شود</p>
            </div>
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
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={deleteCategory} className="bg-error hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

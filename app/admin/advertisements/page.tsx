'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Star, Image as ImageIcon, Trash2, Calendar, Upload, X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA, formatPrice } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminAdvertisementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ businessId: '', type: 'FEATURED', image: '', startDate: '', endDate: '', price: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adRes, bizRes] = await Promise.all([
        fetch('/api/admin/advertisements'), fetch('/api/admin/businesses?limit=100'),
      ]);
      const adData = await adRes.json();
      const bizData = await bizRes.json();
      setData(Array.isArray(adData) ? adData : (Array.isArray(adData?.data) ? adData.data : []));
      setBusinesses(Array.isArray(bizData) ? bizData : (Array.isArray(bizData?.data) ? bizData.data : []));
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

  const addAd = async () => {
    if (!form.businessId || !form.startDate || !form.endDate) { toast.error('کسب‌وکار و تاریخ‌ها الزامی است'); return; }
    try {
      await fetch('/api/admin/advertisements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      toast.success('تبلیغ ایجاد شد');
      setShowAdd(false); setForm({ businessId: '', type: 'FEATURED', image: '', startDate: '', endDate: '', price: 0 }); fetchData();
    } catch { toast.error('خطا'); }
  };

  const deleteAd = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/advertisements/${deleteId}`, { method: 'DELETE' });
      toast.success('تبلیغ حذف شد');
      setDeleteId(null); fetchData();
    } catch { toast.error('خطا'); }
  };

  const daysLeft = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت تبلیغات" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAdd(true)} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-md shadow-primary/25">
              <Plus className="w-4 h-4" /> افزودن تبلیغ
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="admin-card p-5 h-40 admin-skeleton rounded-2xl" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="admin-card rounded-2xl p-12 text-center text-text-muted">تبلیغی وجود ندارد</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((ad) => {
                const d = daysLeft(ad.endDate);
                return (
                  <div key={ad.id} className="admin-card p-5">
                    {ad.image && (
                      <div className="mb-3 rounded-xl overflow-hidden h-32 -mx-5 -mt-5">
                        <img src={ad.image} alt={ad.business?.name || 'تبلیغ'} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <StatusBadge variant={ad.type === 'FEATURED' ? 'warning' : 'primary'}>
                        {ad.type === 'FEATURED' ? <><Star className="w-3 h-3" /> ویژه</> : <><ImageIcon className="w-3 h-3" /> بنر</>}
                      </StatusBadge>
                      <StatusBadge variant={d > 7 ? 'success' : d > 0 ? 'warning' : 'danger'}>
                        {d > 0 ? `${toPersianDigits(d)} روز` : 'منقضی'}
                      </StatusBadge>
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">{ad.business?.name || '-'}</h3>
                    <div className="text-xs text-text-muted mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateShortFA(new Date(ad.startDate))} تا {formatDateShortFA(new Date(ad.endDate))}
                    </div>
                    <div className="text-sm text-text-secondary mb-3">{formatPrice(ad.price)}</div>
                    <button onClick={() => setDeleteId(ad.id)} className="text-error hover:bg-error/10 p-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> حذف
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>افزودن تبلیغ</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm text-text-secondary mb-1 block">کسب‌وکار</label>
              <select value={form.businessId} onChange={e => setForm({...form, businessId: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                <option value="">انتخاب کنید</option>
                {businesses.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div><label className="text-sm text-text-secondary mb-1 block">نوع</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                <option value="FEATURED">ویژه</option>
                <option value="BANNER">بنر</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">تصویر تبلیغ (اختیاری)</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {form.image ? (
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-text-muted" />
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-sm text-text-secondary mb-1 block">شروع</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
              <div><label className="text-sm text-text-secondary mb-1 block">پایان</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
            </div>
            <div><label className="text-sm text-text-secondary mb-1 block">قیمت (تومان)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="admin-input px-4 py-2 rounded-xl text-sm">انصراف</button>
            <button onClick={addAd} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium">افزودن</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>حذف تبلیغ</AlertDialogTitle><AlertDialogDescription>آیا از حذف این تبلیغ اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={deleteAd} className="bg-error hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

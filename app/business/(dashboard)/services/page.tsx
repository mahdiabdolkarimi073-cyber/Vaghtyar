'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Scissors, Clock, DollarSign, X, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice, formatDuration } from '@/lib/constants';

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = { name: '', durationMinutes: 30, price: 0, description: '' };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bookingFee, setBookingFee] = useState(0);

  const fetchServices = useCallback(async () => {
    try {
      const [data, settingsRes] = await Promise.all([
        businessFetch<Service[]>('/api/business/services'),
        fetch('/api/settings').then(r => r.ok ? r.json() : {}) as Promise<Record<string, string>>,
      ]);
      setServices(data);
      setBookingFee(Number(settingsRes.booking_fee) || 0);
    } catch { toast.error('خطا در بارگذاری خدمات'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => {
    setEditingId(null); setForm(emptyForm); setModalOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({ name: s.name, durationMinutes: s.durationMinutes, price: s.price, description: s.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('نام خدمت الزامی است'); return; }
    if (form.durationMinutes < 5) { toast.error('حداقل مدت ۵ دقیقه است'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await businessFetch(`/api/business/services/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('خدمت به‌روزرسانی شد');
      } else {
        await businessFetch('/api/business/services', { method: 'POST', body: JSON.stringify(form) });
        toast.success('خدمت اضافه شد');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'خطا'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (s: Service) => {
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
    try {
      await businessFetch(`/api/business/services/${s.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !s.isActive }) });
    } catch {
      setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: s.isActive } : x));
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await businessFetch(`/api/business/services/${deleteId}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== deleteId));
      toast.success('خدمت حذف شد');
    } catch { toast.error('خطا در حذف'); }
    finally { setDeleteId(null); }
  };

  if (loading) {
    return <div className="bg-surface border border-border rounded-2xl h-96 glass-shimmer" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">خدمات</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {toPersianDigits(services.length)} خدمت
          </p>
        </div>
        <GradientButton onClick={openAdd} size="sm">
          <Plus className="w-4 h-4" />
          افزودن خدمت
        </GradientButton>
      </div>

      {bookingFee > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <Receipt className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-text-secondary">
            هزینه رزرو نوبت برای هر خدمت: <span className="font-bold text-primary">{formatPrice(bookingFee)}</span>
            <span className="text-text-muted mr-1">— این مبلغ به قیمت هر خدمت اضافه می‌شود</span>
          </p>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">هنوز خدمتی اضافه نکرده‌اید</h3>
          <p className="text-sm text-text-secondary mb-4">برای شروع، اولین خدمت خود را اضافه کنید</p>
          <GradientButton onClick={openAdd} size="md"><Plus className="w-4 h-4" /> افزودن اولین خدمت</GradientButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted text-text-secondary hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">{s.name}</h3>
              {s.description && <p className="text-xs text-text-secondary mb-3 line-clamp-2">{s.description}</p>}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-secondary">{formatDuration(s.durationMinutes)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs font-medium text-text-primary">{formatPrice(s.price)}</span>
                </div>
              </div>
              {bookingFee > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Receipt className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-xs text-text-secondary">
                    هزینه رزرو: <span className="font-medium text-primary">{formatPrice(bookingFee)}</span>
                  </span>
                  <span className="text-xs text-text-muted mr-1">| مجموع: {formatPrice(s.price + bookingFee)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-secondary">{s.isActive ? 'فعال' : 'غیرفعال'}</span>
                <button onClick={() => toggleActive(s)} className={`premium-toggle ${s.isActive ? 'bg-secondary' : 'bg-muted'}`}>
                  <span className={`premium-toggle-knob ${s.isActive ? 'left-0.5' : 'right-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">{editingId ? 'ویرایش خدمت' : 'افزودن خدمت جدید'}</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">نام خدمت</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm" placeholder="مثال: کوتاهی مو" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">مدت (دقیقه)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setForm({ ...form, durationMinutes: Math.max(5, form.durationMinutes - 5) })} className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-text-primary hover:bg-muted/70 transition-colors shrink-0">-</button>
                    <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })} className="premium-input w-full px-3 py-2 text-sm text-center" />
                    <button onClick={() => setForm({ ...form, durationMinutes: form.durationMinutes + 5 })} className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-text-primary hover:bg-muted/70 transition-colors shrink-0">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">قیمت (تومان)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="premium-input w-full px-4 py-2.5 text-sm" />
                </div>
              </div>
              {bookingFee > 0 && (
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    <span>هزینه رزرو نوبت: <span className="font-bold text-primary">{formatPrice(bookingFee)}</span></span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-primary/10">
                    مبلغ نهایی که مشتری پرداخت می‌کند: <span className="font-bold text-text-primary">{formatPrice(form.price + bookingFee)}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">توضیحات (اختیاری)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm resize-none" rows={2} placeholder="توضیح کوتاه درباره خدمت..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm transition-colors">انصراف</button>
                <GradientButton onClick={handleSave} loading={saving} className="flex-1" size="md">{editingId ? 'به‌روزرسانی' : 'افزودن'}</GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm text-center animate-scale-in">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-error/10 items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-error" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">حذف خدمت</h3>
            <p className="text-sm text-text-secondary mb-4">آیا از حذف این خدمت مطمئن هستید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm">انصراف</button>
              <GradientButton variant="danger" onClick={handleDelete} className="flex-1" size="md">حذف</GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

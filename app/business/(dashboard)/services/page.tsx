'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Scissors, Lock } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import GlassBadge from '@/components/ui/GlassBadge';
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

interface PlanLimit {
  allowed: boolean;
  limit: number | null;
  current: number;
  planName: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [serviceLimit, setServiceLimit] = useState<PlanLimit | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const [data, limits] = await Promise.all([
        businessFetch<Service[]>('/api/business/services'),
        businessFetch<{ maxServices: PlanLimit }>('/api/business/plan-limits'),
      ]);
      setServices(data);
      setServiceLimit(limits.maxServices);
    } catch { toast.error('خطا در بارگذاری خدمات'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => {
    if (serviceLimit && !serviceLimit.allowed) {
      setLimitModalOpen(true);
      return;
    }
    setEditingId(null); setForm(emptyForm); setModalOpen(true);
  };
  const openEdit = (s: Service) => { setEditingId(s.id); setForm({ name: s.name, durationMinutes: s.durationMinutes, price: s.price, description: s.description || '' }); setModalOpen(true); };

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
    return <div className="bg-surface border border-border rounded-xl shadow-card h-96 glass-shimmer" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">مدیریت خدمات</h2>
        <GradientButton onClick={openAdd} size="sm" disabled={serviceLimit !== null && !serviceLimit.allowed}>
          {serviceLimit !== null && !serviceLimit.allowed ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          افزودن خدمت
        </GradientButton>
      </div>

      {services.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">هنوز خدمتی اضافه نکرده‌اید</h3>
          <p className="text-sm text-text-secondary mb-4">برای شروع، اولین خدمت خود را اضافه کنید</p>
          <GradientButton onClick={openAdd} size="md"><Plus className="w-4 h-4" /> افزودن اولین خدمت</GradientButton>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary text-xs">
                <th className="p-3 text-right"></th>
                <th className="p-3 text-right">نام خدمت</th>
                <th className="p-3 text-right">مدت</th>
                <th className="p-3 text-right">قیمت</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="p-3"><GripVertical className="w-4 h-4 text-text-muted cursor-grab" /></td>
                  <td className="p-3 text-text-primary font-medium">{s.name}</td>
                  <td className="p-3 text-text-secondary">{formatDuration(s.durationMinutes)}</td>
                  <td className="p-3 text-text-secondary">{formatPrice(s.price)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(s)} className={`relative w-10 h-6 rounded-full transition-colors ${s.isActive ? 'bg-secondary' : 'bg-muted'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface transition-all ${s.isActive ? 'left-0.5' : 'right-0.5'}`} />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted text-text-secondary hover:text-text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <GlassCard strong className="relative p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">{editingId ? 'ویرایش خدمت' : 'افزودن خدمت'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">نام خدمت</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" placeholder="مثال: کوتاهی مو" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">مدت (دقیقه)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setForm({ ...form, durationMinutes: Math.max(5, form.durationMinutes - 5) })} className="w-8 h-8 rounded-lg bg-surface border border-border shadow-card flex items-center justify-center text-text-primary">-</button>
                    <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })} className="glass-input w-full px-3 py-2 text-sm text-center" />
                    <button onClick={() => setForm({ ...form, durationMinutes: form.durationMinutes + 5 })} className="w-8 h-8 rounded-lg bg-surface border border-border shadow-card flex items-center justify-center text-text-primary">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">قیمت (تومان)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="glass-input w-full px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">توضیحات</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={2} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm">انصراف</button>
                <GradientButton onClick={handleSave} loading={saving} className="flex-1" size="md">{editingId ? 'به‌روزرسانی' : 'افزودن'}</GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {limitModalOpen && serviceLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLimitModalOpen(false)} />
          <GlassCard strong className="relative p-6 w-full max-w-sm text-center animate-scale-in">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-warning/10 items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-warning" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">محدودیت پلن</h3>
            <p className="text-sm text-text-secondary mb-4">
              شما به حداکثر تعداد خدمات در پلن {serviceLimit.planName} رسیده‌اید. برای افزایش محدودیت، پلن خود را ارتقا دهید.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setLimitModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm">بستن</button>
              <GradientButton onClick={() => { setLimitModalOpen(false); window.location.href = '/business/subscription'; }} className="flex-1" size="md">ارتقا پلن</GradientButton>
            </div>
          </GlassCard>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <GlassCard strong className="relative p-6 w-full max-w-sm text-center animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary mb-2">حذف خدمت</h3>
            <p className="text-sm text-text-secondary mb-4">آیا از حذف این خدمت مطمئن هستید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm">انصراف</button>
              <GradientButton variant="danger" onClick={handleDelete} className="flex-1" size="md">حذف</GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

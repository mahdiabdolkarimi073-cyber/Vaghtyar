'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import GlassBadge from '@/components/ui/GlassBadge';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits } from '@/lib/constants';

interface StaffMember {
  id: string;
  name: string;
  photo: string | null;
  specialty: string | null;
  bio: string | null;
  isActive: boolean;
  todayAppointmentCount: number;
  services: { id: string; name: string }[];
}

interface Service { id: string; name: string; }

const emptyForm = { name: '', specialty: '', bio: '' };

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const [staffData, svcData] = await Promise.all([
        businessFetch<StaffMember[]>('/api/business/staff'),
        businessFetch<Service[]>('/api/business/services'),
      ]);
      setStaff(staffData);
      setServices(svcData);
    } catch { toast.error('خطا در بارگذاری'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setSelectedServices([]); setModalOpen(true); };
  const openEdit = async (s: StaffMember) => {
    setEditingId(s.id);
    setForm({ name: s.name, specialty: s.specialty || '', bio: s.bio || '' });
    setSelectedServices(s.services.map(sv => sv.id));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('نام الزامی است'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await businessFetch(`/api/business/staff/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
        await businessFetch(`/api/business/staff/${editingId}/services`, { method: 'PUT', body: JSON.stringify({ serviceIds: selectedServices }) });
        toast.success('کارکن به‌روزرسانی شد');
      } else {
        const created = await businessFetch<{ id: string }>('/api/business/staff', { method: 'POST', body: JSON.stringify(form) });
        if (selectedServices.length > 0) {
          await businessFetch(`/api/business/staff/${created.id}/services`, { method: 'PUT', body: JSON.stringify({ serviceIds: selectedServices }) });
        }
        toast.success('کارکن اضافه شد');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'خطا'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await businessFetch(`/api/business/staff/${deleteId}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== deleteId));
      toast.success('کارکن حذف شد');
    } catch { toast.error('خطا در حذف'); }
    finally { setDeleteId(null); }
  };

  if (loading) return <div className="glass h-96 rounded-2xl glass-shimmer" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary-custom">مدیریت کارکنان</h2>
        <GradientButton onClick={openAdd} size="sm"><Plus className="w-4 h-4" /> افزودن کارکن</GradientButton>
      </div>

      {staff.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-500/15 items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-primary-custom mb-2">هنوز کارکنی اضافه نکرده‌اید</h3>
          <p className="text-sm text-secondary-custom mb-4">برای شروع، اولین کارکن خود را اضافه کنید</p>
          <GradientButton onClick={openAdd} size="md"><Plus className="w-4 h-4" /> افزودن اولین کارکن</GradientButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <GlassCard key={s.id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-custom">{s.name}</h3>
                    <p className="text-xs text-secondary-custom">{s.specialty || 'بدون تخصص'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-secondary-custom hover:text-primary-custom"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary-custom hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {s.bio && <p className="text-xs text-secondary-custom mb-3 line-clamp-2">{s.bio}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                {s.services.map(sv => <GlassBadge key={sv.id} variant="primary">{sv.name}</GlassBadge>)}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-secondary-custom">نوبت‌های امروز</span>
                <span className="text-sm font-bold text-primary-custom">{toPersianDigits(s.todayAppointmentCount)}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <GlassCard strong className="relative p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary-custom">{editingId ? 'ویرایش کارکن' : 'افزودن کارکن'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-secondary-custom"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-secondary-custom mb-1.5">نام</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" placeholder="نام و نام خانوادگی" />
              </div>
              <div>
                <label className="block text-sm text-secondary-custom mb-1.5">تخصص</label>
                <input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" placeholder="مثال: آرایشگر" />
              </div>
              <div>
                <label className="block text-sm text-secondary-custom mb-1.5">بیوگرافی</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-sm text-secondary-custom mb-1.5">خدمات قابل انجام</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {services.map(sv => (
                    <label key={sv.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input type="checkbox" checked={selectedServices.includes(sv.id)} onChange={e => {
                        if (e.target.checked) setSelectedServices([...selectedServices, sv.id]);
                        else setSelectedServices(selectedServices.filter(id => id !== sv.id));
                      }} className="rounded border-white/20 bg-white/5" />
                      <span className="text-sm text-primary-custom">{sv.name}</span>
                    </label>
                  ))}
                  {services.length === 0 && <p className="text-xs text-secondary-custom">ابتدا خدمتی اضافه کنید</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-secondary-custom hover:bg-white/5 text-sm">انصراف</button>
                <GradientButton onClick={handleSave} loading={saving} className="flex-1" size="md">{editingId ? 'به‌روزرسانی' : 'افزودن'}</GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <GlassCard strong className="relative p-6 w-full max-w-sm text-center animate-scale-in">
            <h3 className="text-lg font-bold text-primary-custom mb-2">حذف کارکن</h3>
            <p className="text-sm text-secondary-custom mb-4">آیا از حذف این کارکن مطمئن هستید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-secondary-custom hover:bg-white/5 text-sm">انصراف</button>
              <GradientButton variant="danger" onClick={handleDelete} className="flex-1" size="md">حذف</GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

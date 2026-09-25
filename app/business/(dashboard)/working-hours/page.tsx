'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CalendarPlus, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits } from '@/lib/constants';
import { toJalali } from '@/lib/jalali';

interface WorkingHour {
  id: string;
  dayOfWeek: number;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface Holiday {
  id: string;
  date: string;
  reason: string | null;
}

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

export default function WorkingHoursPage() {
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [addingHoliday, setAddingHoliday] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [h, hol] = await Promise.all([
        businessFetch<WorkingHour[]>('/api/business/working-hours'),
        businessFetch<Holiday[]>('/api/business/holidays'),
      ]);
      setHours(h);
      setHolidays(hol);
    } catch { toast.error('خطا در بارگذاری'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateHour = (dayOfWeek: number, field: string, value: unknown) => {
    setHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await businessFetch('/api/business/working-hours', { method: 'PUT', body: JSON.stringify(hours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        isClosed: h.isClosed,
        startTime: h.startTime,
        endTime: h.endTime,
      }))) });
      toast.success('ساعات کاری ذخیره شد');
    } catch { toast.error('خطا در ذخیره'); }
    finally { setSaving(false); }
  };

  const addHoliday = async () => {
    if (!holidayDate) { toast.error('تاریخ را انتخاب کنید'); return; }
    setAddingHoliday(true);
    try {
      const h = await businessFetch<Holiday>('/api/business/holidays', { method: 'POST', body: JSON.stringify({ date: holidayDate, reason: holidayReason }) });
      setHolidays(prev => [h, ...prev]);
      setHolidayModalOpen(false);
      setHolidayDate('');
      setHolidayReason('');
      toast.success('تعطیلی اضافه شد');
    } catch { toast.error('خطا در افزودن'); }
    finally { setAddingHoliday(false); }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await businessFetch(`/api/business/holidays/${id}`, { method: 'DELETE' });
      setHolidays(prev => prev.filter(h => h.id !== id));
      toast.success('تعطیلی حذف شد');
    } catch { toast.error('خطا در حذف'); }
  };

  if (loading) return <div className="bg-surface border border-border rounded-2xl h-96 glass-shimmer" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">ساعات کاری</h2>
          <p className="text-sm text-text-secondary mt-0.5">برنامه هفتگی و تعطیلی‌های خاص</p>
        </div>
        <GradientButton onClick={() => setHolidayModalOpen(true)} size="sm" variant="accent"><CalendarPlus className="w-4 h-4" /> افزودن تعطیلی</GradientButton>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">برنامه هفتگی</h3>
        </div>
        <div className="space-y-2">
          {DAYS.map((dayName, idx) => {
            const hour = hours.find(h => h.dayOfWeek === idx);
            if (!hour) return null;
            return (
              <div key={idx} className="flex flex-wrap items-center gap-3 lg:gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="w-20 lg:w-24 text-sm font-medium text-text-primary shrink-0">{dayName}</div>
                <button onClick={() => updateHour(idx, 'isClosed', !hour.isClosed)} className={`premium-toggle shrink-0 ${!hour.isClosed ? 'bg-secondary' : 'bg-muted'}`}>
                  <span className={`premium-toggle-knob ${!hour.isClosed ? 'left-0.5' : 'right-0.5'}`} />
                </button>
                {hour.isClosed ? (
                  <span className="text-sm text-text-muted">تعطیل</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input type="time" value={hour.startTime || '09:00'} onChange={e => updateHour(idx, 'startTime', e.target.value)} className="premium-input px-3 py-2 text-sm w-full sm:w-auto" />
                    <span className="text-text-secondary text-xs shrink-0">تا</span>
                    <input type="time" value={hour.endTime || '18:00'} onChange={e => updateHour(idx, 'endTime', e.target.value)} className="premium-input px-3 py-2 text-sm w-full sm:w-auto" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <GradientButton onClick={handleSave} loading={saving} size="md">ذخیره تغییرات</GradientButton>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-text-primary mb-4">تعطیلی‌های خاص</h3>
        {holidays.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-muted items-center justify-center mb-3">
              <CalendarPlus className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">تعطیلی خاصی ثبت نشده است</p>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map(h => {
              const d = new Date(h.date);
              const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
              return (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                      <CalendarPlus className="w-5 h-5 text-error" />
                    </div>
                    <div>
                      <div className="text-sm text-text-primary">{toPersianDigits(j.jd)} {MONTHS[j.jm - 1]} {toPersianDigits(j.jy)}</div>
                      {h.reason && <div className="text-xs text-text-secondary mt-0.5">{h.reason}</div>}
                    </div>
                  </div>
                  <button onClick={() => deleteHoliday(h.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {holidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setHolidayModalOpen(false)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">افزودن تعطیلی</h3>
              <button onClick={() => setHolidayModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">تاریخ</label>
                <input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} className="premium-input w-full px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">دلیل (اختیاری)</label>
                <input value={holidayReason} onChange={e => setHolidayReason(e.target.value)} className="premium-input w-full px-4 py-2.5 text-sm" placeholder="مثال: تعطیلی نوروز" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setHolidayModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm transition-colors">انصراف</button>
                <GradientButton onClick={addHoliday} loading={addingHoliday} className="flex-1" size="md">افزودن</GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, List, Clock, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits } from '@/lib/constants';
import { toJalali } from '@/lib/jalali';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  internalNote: string | null;
  cancelReason: string | null;
  customer: { id: string; name: string; mobile: string; isBlocked: boolean };
  service: { id: string; name: string; durationMinutes: number; price: number };
  staff: { id: string; name: string };
}

interface SmartSlot {
  startTime: string;
  endTime: string;
  staffId: string;
  staffName: string;
  availableServices: string[];
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'default'> = {
  CONFIRMED: 'primary', PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'danger', NO_SHOW: 'default',
};
const statusLabel: Record<string, string> = {
  CONFIRMED: 'تایید شده', PENDING: 'در انتظار', COMPLETED: 'تکمیل شده', CANCELLED: 'لغو شده', NO_SHOW: 'حاضر نشده',
};
const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-indigo-500/20 border-indigo-500/30',
  PENDING: 'bg-amber-500/20 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/20 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 border-red-500/30 opacity-50',
  NO_SHOW: 'bg-gray-500/20 border-gray-500/30',
};
const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

export default function CalendarPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'list'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [smartSlots, setSmartSlots] = useState<SmartSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = await businessFetch<Appointment[]>(`/api/business/appointments?date=${dateStr}`);
      setAppointments(data);
    } catch { toast.error('خطا در بارگذاری'); }
    finally { setLoading(false); }
  }, [currentDate]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const fetchSmartSlots = async () => {
    setLoadingSlots(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = await businessFetch<SmartSlot[]>(`/api/business/smart-calendar/suggestions?date=${dateStr}`);
      setSmartSlots(data);
    } catch { toast.error('خطا در دریافت پیشنهادها'); }
    finally { setLoadingSlots(false); }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await businessFetch(`/api/business/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success('وضعیت تغییر کرد');
      setSelectedAppt(null);
      fetchAppointments();
    } catch { toast.error('خطا'); }
  };

  const cancelAppt = async (id: string, reason: string) => {
    try {
      await businessFetch(`/api/business/appointments/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) });
      toast.success('نوبت لغو شد');
      setSelectedAppt(null);
      fetchAppointments();
    } catch { toast.error('خطا'); }
  };

  const getJalaliDate = (d: Date) => {
    const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return { ...j, monthName: MONTHS[j.jm - 1] };
  };

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };
  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const jDate = getJalaliDate(currentDate);

  const getApptForSlot = (hour: number) => {
    return appointments.filter(a => new Date(a.startTime).getHours() === hour);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-primary-custom">تقویم نوبت‌ها</h2>
        <div className="flex items-center gap-2">
          <div className="flex glass rounded-xl p-1">
            {(['daily', 'weekly', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v ? 'gradient-primary text-white' : 'text-secondary-custom hover:text-primary-custom'}`}>
                {v === 'daily' ? 'روزانه' : v === 'weekly' ? 'هفتگی' : 'لیست'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={view === 'weekly' ? prevWeek : prevDay} className="p-2 rounded-xl glass hover:bg-white/8"><ChevronRight className="w-5 h-5 text-secondary-custom" /></button>
        <div className="text-center">
          <div className="text-sm font-bold text-primary-custom">{toPersianDigits(jDate.jd)} {jDate.monthName} {toPersianDigits(jDate.jy)}</div>
          <div className="text-xs text-secondary-custom">{DAYS[(currentDate.getDay() + 1) % 7]}</div>
        </div>
        <button onClick={view === 'weekly' ? nextWeek : nextDay} className="p-2 rounded-xl glass hover:bg-white/8"><ChevronLeft className="w-5 h-5 text-secondary-custom" /></button>
      </div>

      {view === 'daily' && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondary-custom">نمای روزانه</span>
            <GradientButton onClick={fetchSmartSlots} loading={loadingSlots} size="sm" variant="accent"><Sparkles className="w-3 h-3" /> پیشنهاد زمان آزاد</GradientButton>
          </div>
          {smartSlots.length > 0 && (
            <div className="mb-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-xs font-medium text-cyan-300 mb-2">زمان‌های آزاد پیشنهادی:</div>
              <div className="flex flex-wrap gap-2">
                {smartSlots.map((slot, i) => (
                  <div key={i} className="px-3 py-1 rounded-lg bg-cyan-500/10 text-xs text-cyan-300 border border-cyan-500/20">
                    {slot.startTime} - {slot.endTime} ({slot.staffName})
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="space-y-2">{timeSlots.slice(8, 20).map(t => <div key={t} className="h-12 rounded-xl glass-shimmer" />)}</div>
          ) : (
            <div className="space-y-1">
              {timeSlots.slice(8, 20).map((slot, i) => {
                const hour = i + 8;
                const appts = getApptForSlot(hour);
                return (
                  <div key={slot} className="flex items-start gap-3 min-h-[48px]">
                    <div className="w-12 text-xs text-secondary-custom pt-1.5">{toPersianDigits(slot)}</div>
                    <div className="flex-1 space-y-1">
                      {appts.map(a => (
                        <button key={a.id} onClick={() => setSelectedAppt(a)} className={`w-full text-right p-2 rounded-lg border ${statusColor[a.status] || statusColor.PENDING} hover:scale-[1.01] transition-all`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary-custom">{a.customer.name}</span>
                            <GlassBadge variant={statusVariant[a.status]}>{statusLabel[a.status]}</GlassBadge>
                          </div>
                          <div className="text-xs text-secondary-custom mt-0.5">{a.service.name} - {a.staff.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && <p className="text-sm text-secondary-custom text-center py-8">نوبتی برای این روز ثبت نشده است</p>}
            </div>
          )}
        </GlassCard>
      )}

      {view === 'weekly' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - d.getDay() + i);
            const j = getJalaliDate(d);
            const dayAppts = appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString());
            return (
              <GlassCard key={i} className="p-3 min-h-[200px]">
                <div className="text-center mb-2">
                  <div className="text-xs text-secondary-custom">{DAYS[(d.getDay() + 1) % 7]}</div>
                  <div className="text-sm font-bold text-primary-custom">{toPersianDigits(j.jd)}</div>
                </div>
                <div className="space-y-1">
                  {dayAppts.map(a => (
                    <button key={a.id} onClick={() => setSelectedAppt(a)} className={`w-full text-right p-1.5 rounded-lg border ${statusColor[a.status]} text-xs`}>
                      <div className="font-medium text-primary-custom truncate">{a.customer.name}</div>
                      <div className="text-secondary-custom truncate">{new Date(a.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <GlassCard className="overflow-hidden">
          {appointments.length === 0 ? (
            <p className="text-sm text-secondary-custom text-center py-8">نوبتی برای این روز ثبت نشده است</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-secondary-custom text-xs">
                  <th className="p-3 text-right">زمان</th>
                  <th className="p-3 text-right">مشتری</th>
                  <th className="p-3 text-right">خدمت</th>
                  <th className="p-3 text-right">کارکن</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} onClick={() => setSelectedAppt(a)} className="border-b border-white/5 hover:bg-white/3 cursor-pointer">
                    <td className="p-3 text-primary-custom">{new Date(a.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 text-primary-custom">{a.customer.name}</td>
                    <td className="p-3 text-secondary-custom">{a.service.name}</td>
                    <td className="p-3 text-secondary-custom">{a.staff.name}</td>
                    <td className="p-3 text-center"><GlassBadge variant={statusVariant[a.status]}>{statusLabel[a.status]}</GlassBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      )}

      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAppt(null)} />
          <GlassCard strong className="relative p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary-custom">جزئیات نوبت</h3>
              <button onClick={() => setSelectedAppt(null)} className="text-secondary-custom"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-custom">مشتری:</span><span className="text-primary-custom">{selectedAppt.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">موبایل:</span><span className="text-primary-custom">{toPersianDigits(selectedAppt.customer.mobile)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">خدمت:</span><span className="text-primary-custom">{selectedAppt.service.name}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">کارکن:</span><span className="text-primary-custom">{selectedAppt.staff.name}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">زمان:</span><span className="text-primary-custom">{new Date(selectedAppt.startTime).toLocaleString('fa-IR')}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">وضعیت:</span><GlassBadge variant={statusVariant[selectedAppt.status]}>{statusLabel[selectedAppt.status]}</GlassBadge></div>
              {selectedAppt.internalNote && <div className="p-3 rounded-xl bg-white/5"><span className="text-secondary-custom text-xs">یادداشت:</span><p className="text-primary-custom mt-1">{selectedAppt.internalNote}</p></div>}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'COMPLETED', 'NO_SHOW'].map(st => (
                  <button key={st} onClick={() => changeStatus(selectedAppt.id, st)} className="px-3 py-1.5 rounded-lg glass text-xs text-primary-custom hover:bg-white/8">{statusLabel[st]}</button>
                ))}
                <button onClick={() => cancelAppt(selectedAppt.id, 'لغو توسط کسب‌وکار')} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs hover:bg-red-500/25">لغو نوبت</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

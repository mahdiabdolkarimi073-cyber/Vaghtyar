'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, List, Clock, X, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';
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
  CONFIRMED: 'border-l-primary bg-primary/5',
  PENDING: 'border-l-warning bg-warning/5',
  COMPLETED: 'border-l-secondary bg-secondary/5',
  CANCELLED: 'border-l-error bg-error/5 opacity-60',
  NO_SHOW: 'border-l-muted bg-muted/30',
};
const statusDot: Record<string, string> = {
  CONFIRMED: 'bg-primary',
  PENDING: 'bg-warning',
  COMPLETED: 'bg-secondary',
  CANCELLED: 'bg-error',
  NO_SHOW: 'bg-muted',
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
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">تقویم نوبت‌ها</h2>
          <p className="text-sm text-text-secondary mt-0.5">مدیریت نوبت‌های روزانه و هفتگی</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {(['daily', 'weekly', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === v ? 'gradient-primary text-white shadow-soft' : 'text-text-secondary hover:text-text-primary'}`}>
              {v === 'daily' ? 'روزانه' : v === 'weekly' ? 'هفتگی' : 'لیست'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex items-center justify-between">
        <button onClick={view === 'weekly' ? prevWeek : prevDay} className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="text-center">
          <div className="text-base font-bold text-text-primary">{toPersianDigits(jDate.jd)} {jDate.monthName} {toPersianDigits(jDate.jy)}</div>
          <div className="text-xs text-text-secondary">{DAYS[(currentDate.getDay() + 1) % 7]}</div>
        </div>
        <button onClick={view === 'weekly' ? nextWeek : nextDay} className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {view === 'daily' && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-text-primary">نمای روزانه</span>
            <GradientButton onClick={fetchSmartSlots} loading={loadingSlots} size="sm" variant="accent"><Sparkles className="w-3.5 h-3.5" /> پیشنهاد زمان آزاد</GradientButton>
          </div>
          {smartSlots.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="text-xs font-medium text-primary mb-2">زمان‌های آزاد پیشنهادی:</div>
              <div className="flex flex-wrap gap-2">
                {smartSlots.map((slot, i) => (
                  <div key={i} className="px-3 py-1 rounded-lg bg-primary/10 text-xs text-primary border border-primary/15">
                    {slot.startTime} - {slot.endTime} ({slot.staffName})
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="space-y-2">{timeSlots.slice(8, 20).map(t => <div key={t} className="h-14 rounded-xl bg-muted/40 glass-shimmer" />)}</div>
          ) : (
            <div className="space-y-1">
              {timeSlots.slice(8, 20).map((slot, i) => {
                const hour = i + 8;
                const appts = getApptForSlot(hour);
                return (
                  <div key={slot} className="flex items-start gap-3 min-h-[56px]">
                    <div className="w-14 text-xs text-text-muted pt-2.5 font-medium shrink-0">{toPersianDigits(slot)}</div>
                    <div className="flex-1 space-y-1.5">
                      {appts.map(a => (
                        <button key={a.id} onClick={() => setSelectedAppt(a)} className={`w-full text-right p-3 rounded-xl border-l-4 ${statusColor[a.status] || statusColor.PENDING} hover:shadow-card-hover transition-all`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusDot[a.status]}`} />
                              <span className="text-sm font-medium text-text-primary">{a.customer.name}</span>
                            </div>
                            <GlassBadge variant={statusVariant[a.status]}>{statusLabel[a.status]}</GlassBadge>
                          </div>
                          <div className="text-xs text-text-secondary mt-1 pr-4">{a.service.name} - {a.staff.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
                    <CalendarIcon className="w-7 h-7 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-secondary">نوبتی برای این روز ثبت نشده است</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'weekly' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - d.getDay() + i);
            const j = getJalaliDate(d);
            const dayAppts = appointments.filter(a => new Date(a.startTime).toDateString() === d.toDateString());
            return (
              <div key={i} className="bg-surface border border-border rounded-2xl p-3 min-h-[200px] shadow-card">
                <div className="text-center mb-2 pb-2 border-b border-border">
                  <div className="text-xs text-text-secondary">{DAYS[(d.getDay() + 1) % 7]}</div>
                  <div className="text-sm font-bold text-text-primary">{toPersianDigits(j.jd)}</div>
                </div>
                <div className="space-y-1.5">
                  {dayAppts.map(a => (
                    <button key={a.id} onClick={() => setSelectedAppt(a)} className={`w-full text-right p-2 rounded-lg border-l-3 ${statusColor[a.status]} text-xs hover:shadow-soft transition-all`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[a.status]}`} />
                        <span className="font-medium text-text-primary truncate">{a.customer.name}</span>
                      </div>
                      <div className="text-text-secondary truncate mt-0.5">{new Date(a.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
                <List className="w-7 h-7 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">نوبتی برای این روز ثبت نشده است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs bg-muted/30">
                    <th className="p-3 text-right font-medium">زمان</th>
                    <th className="p-3 text-right font-medium">مشتری</th>
                    <th className="p-3 text-right font-medium">خدمت</th>
                    <th className="p-3 text-right font-medium">کارکن</th>
                    <th className="p-3 text-center font-medium">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id} onClick={() => setSelectedAppt(a)} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="p-3 text-text-primary font-medium">{new Date(a.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 text-text-primary">{a.customer.name}</td>
                      <td className="p-3 text-text-secondary">{a.service.name}</td>
                      <td className="p-3 text-text-secondary">{a.staff.name}</td>
                      <td className="p-3 text-center"><GlassBadge variant={statusVariant[a.status]}>{statusLabel[a.status]}</GlassBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAppt(null)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">جزئیات نوبت</h3>
              <button onClick={() => setSelectedAppt(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                  {selectedAppt.customer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-text-primary">{selectedAppt.customer.name}</div>
                  <div className="text-xs text-text-secondary ltr-text">{toPersianDigits(selectedAppt.customer.mobile)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-text-secondary mb-1">خدمت</div>
                  <div className="text-sm font-medium text-text-primary">{selectedAppt.service.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="text-xs text-text-secondary mb-1">کارکن</div>
                  <div className="text-sm font-medium text-text-primary">{selectedAppt.staff.name}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs text-text-secondary">زمان</span>
                <span className="text-sm font-medium text-text-primary">{new Date(selectedAppt.startTime).toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs text-text-secondary">وضعیت</span>
                <GlassBadge variant={statusVariant[selectedAppt.status]}>{statusLabel[selectedAppt.status]}</GlassBadge>
              </div>
              {selectedAppt.internalNote && (
                <div className="p-3 rounded-xl bg-warning/5 border border-warning/15">
                  <span className="text-xs text-text-secondary">یادداشت:</span>
                  <p className="text-sm text-text-primary mt-1">{selectedAppt.internalNote}</p>
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="text-xs text-text-secondary mb-2">تغییر وضعیت:</div>
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'COMPLETED', 'NO_SHOW'].map(st => (
                  <button key={st} onClick={() => changeStatus(selectedAppt.id, st)} className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-xs text-text-primary font-medium transition-colors">{statusLabel[st]}</button>
                ))}
                <button onClick={() => cancelAppt(selectedAppt.id, 'لغو توسط کسب‌وکار')} className="px-4 py-2 rounded-xl bg-error/10 text-error text-xs font-medium hover:bg-error/20 transition-colors">لغو نوبت</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';

interface SmsStats {
  totalSent: number;
  totalSimulated: number;
  totalFailed: number;
  quotaUsed: number;
  quotaLimit: number | null;
  quotaUnlimited: boolean;
  byType: Record<string, number>;
}

interface SmsLog {
  id: string;
  appointmentId: string | null;
  recipientPhone: string;
  recipientType: string;
  smsType: string;
  messageBody: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

interface SmsLogsResponse {
  logs: SmsLog[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const smsTypeLabel: Record<string, string> = {
  APPOINTMENT_CONFIRM: 'تأیید نوبت',
  APPOINTMENT_REMINDER: 'یادآوری نوبت',
  NEW_BOOKING_NOTIFY: 'نوبت جدید',
  APPOINTMENT_CANCEL: 'لغو نوبت',
};

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  SIMULATED: 'warning',
  SENT: 'success',
  FAILED: 'danger',
};
const statusLabel: Record<string, string> = {
  SIMULATED: 'شبیه‌سازی شده',
  SENT: 'ارسال شده',
  FAILED: 'ناموفق',
};

export default function SmsPage() {
  const [stats, setStats] = useState<SmsStats | null>(null);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);
  const [selectedLog, setSelectedLog] = useState<SmsLog | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await businessFetch<SmsStats>('/api/business/sms-stats');
      setStats(data);
    } catch { toast.error('خطا در بارگذاری آمار'); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      const data = await businessFetch<SmsLogsResponse>(`/api/business/sms-logs?${params}`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch { toast.error('خطا در بارگذاری پیامک‌ها'); }
    finally { setLoading(false); }
  }, [page, filterType, filterStatus]);

  const fetchConfigStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sms-config-status');
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.isConfigured);
      }
    } catch { /* default to configured */ }
  }, []);

  useEffect(() => { fetchStats(); fetchConfigStatus(); }, [fetchStats, fetchConfigStatus]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const quotaUsed = stats?.quotaUsed ?? 0;
  const quotaLimit = stats?.quotaLimit;
  const quotaUnlimited = stats?.quotaUnlimited ?? false;
  const quotaPercent = quotaLimit ? (quotaUsed / quotaLimit) * 100 : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primary-custom">پنل پیامک</h2>

      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">
            سیستم پیامک در حالت شبیه‌سازی است. برای فعال‌سازی ارسال واقعی، کلید API سرویس پیامک را در تنظیمات وارد کنید.
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GlassCard className="p-4">
            <div className="text-xs text-secondary-custom mb-1">سهمیه پیامک تأیید</div>
            {quotaUnlimited ? (
              <div className="text-xl font-bold text-emerald-400">نامحدود</div>
            ) : (
              <>
                <div className="text-xl font-bold text-primary-custom">
                  {toPersianDigits(quotaUsed)} / {toPersianDigits(quotaLimit || 0)}
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${quotaPercent >= 100 ? 'bg-red-500' : quotaPercent > 80 ? 'bg-orange-500' : 'gradient-primary'}`} style={{ width: `${Math.min(100, quotaPercent)}%` }} />
                </div>
              </>
            )}
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-secondary-custom mb-1">ارسال شده</div>
            <div className="text-xl font-bold text-emerald-400">{toPersianDigits(stats.totalSent)}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-secondary-custom mb-1">شبیه‌سازی شده</div>
            <div className="text-xl font-bold text-amber-400">{toPersianDigits(stats.totalSimulated)}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-secondary-custom mb-1">ناموفق</div>
            <div className="text-xl font-bold text-red-400">{toPersianDigits(stats.totalFailed)}</div>
          </GlassCard>
        </div>
      )}

      {quotaLimit !== null && quotaLimit !== undefined && !quotaUnlimited && quotaPercent >= 100 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-300">سهمیه پیامک شما تکمیل شده است. برای ادامه، پلن خود را ارتقا دهید.</span>
          </div>
          <a href="/business/subscription" className="text-sm text-red-300 underline">ارتقا پلن</a>
        </div>
      )}
      {quotaLimit !== null && quotaLimit !== undefined && !quotaUnlimited && quotaPercent > 80 && quotaPercent < 100 && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span className="text-sm text-orange-300">بیش از ۸۰٪ سهمیه پیامک استفاده شده است.</span>
        </div>
      )}

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-primary-custom">تاریخچه پیامک‌ها</h3>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">همه انواع</option>
            <option value="APPOINTMENT_CONFIRM">تأیید نوبت</option>
            <option value="APPOINTMENT_REMINDER">یادآوری نوبت</option>
            <option value="NEW_BOOKING_NOTIFY">نوبت جدید</option>
            <option value="APPOINTMENT_CANCEL">لغو نوبت</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">همه وضعیت‌ها</option>
            <option value="SIMULATED">شبیه‌سازی شده</option>
            <option value="SENT">ارسال شده</option>
            <option value="FAILED">ناموفق</option>
          </select>
        </div>

        {loading ? (
          <div className="h-40 glass-shimmer rounded-xl" />
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-secondary-custom mx-auto mb-3 opacity-50" />
            <p className="text-sm text-secondary-custom">پیامکی ثبت نشده است</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-secondary-custom text-xs">
                    <th className="p-3 text-right">نوع پیامک</th>
                    <th className="p-3 text-right">گیرنده</th>
                    <th className="p-3 text-right">شماره</th>
                    <th className="p-3 text-right">متن پیام</th>
                    <th className="p-3 text-center">وضعیت</th>
                    <th className="p-3 text-right">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors" onClick={() => setSelectedLog(log)}>
                      <td className="p-3 text-primary-custom text-xs">{smsTypeLabel[log.smsType] || log.smsType}</td>
                      <td className="p-3 text-secondary-custom text-xs">{log.recipientType === 'CUSTOMER' ? 'مشتری' : 'کسب‌وکار'}</td>
                      <td className="p-3 text-secondary-custom text-xs ltr-text">{toPersianDigits(log.recipientPhone)}</td>
                      <td className="p-3 text-secondary-custom text-xs max-w-xs truncate">{log.messageBody}</td>
                      <td className="p-3 text-center"><GlassBadge variant={statusVariant[log.status] || 'default'}>{statusLabel[log.status] || log.status}</GlassBadge></td>
                      <td className="p-3 text-secondary-custom text-xs">{formatDateShortFA(new Date(log.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-secondary-custom">صفحه {toPersianDigits(page)} از {toPersianDigits(pagination.totalPages)}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg glass disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg glass disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <GlassCard strong className="relative p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary-custom">مشاهده پیامک</h3>
              <button onClick={() => setSelectedLog(null)} className="text-secondary-custom"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-secondary-custom">نوع:</span><span className="text-primary-custom">{smsTypeLabel[selectedLog.smsType] || selectedLog.smsType}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">گیرنده:</span><span className="text-primary-custom">{selectedLog.recipientType === 'CUSTOMER' ? 'مشتری' : 'کسب‌وکار'}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">شماره:</span><span className="text-primary-custom">{toPersianDigits(selectedLog.recipientPhone)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-custom">وضعیت:</span><GlassBadge variant={statusVariant[selectedLog.status] || 'default'}>{statusLabel[selectedLog.status] || selectedLog.status}</GlassBadge></div>
              <div><span className="text-secondary-custom block mb-1">متن پیام:</span><p className="text-primary-custom p-3 rounded-xl bg-white/5">{selectedLog.messageBody}</p></div>
              <div className="text-xs text-secondary-custom">{formatDateShortFA(new Date(selectedLog.createdAt))}</div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

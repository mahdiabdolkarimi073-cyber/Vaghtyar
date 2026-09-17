'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertTriangle, ChevronLeft, ChevronRight, X, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  SIMULATED: 'warning', SENT: 'success', FAILED: 'danger',
};
const statusLabel: Record<string, string> = {
  SIMULATED: 'شبیه‌سازی شده', SENT: 'ارسال شده', FAILED: 'ناموفق',
};
const statusIcon: Record<string, React.ReactNode> = {
  SIMULATED: <AlertTriangle className="w-3.5 h-3.5" />,
  SENT: <CheckCircle className="w-3.5 h-3.5" />,
  FAILED: <XCircle className="w-3.5 h-3.5" />,
};

function StatBox({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <div className="text-xl font-bold text-text-primary">{toPersianDigits(value)}</div>
      <div className="text-[13px] text-text-secondary mt-0.5">{label}</div>
    </div>
  );
}

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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">پنل پیامک</h2>
        <p className="text-sm text-text-secondary mt-0.5">مدیریت پیامک‌ها و سهمیه</p>
      </div>

      {!isConfigured && (
        <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-sm text-warning pt-1">
            سیستم پیامک در حالت شبیه‌سازی است. برای فعال‌سازی ارسال واقعی، کلید API سرویس پیامک را در تنظیمات وارد کنید.
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
            <div className="text-xs text-text-secondary mb-1">سهمیه پیامک تأیید</div>
            {quotaUnlimited ? (
              <div className="text-xl font-bold text-secondary">نامحدود</div>
            ) : (
              <>
                <div className="text-xl font-bold text-text-primary">{toPersianDigits(quotaUsed)} / {toPersianDigits(quotaLimit || 0)}</div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                  <div className={`h-full rounded-full transition-all ${quotaPercent >= 100 ? 'bg-error' : quotaPercent > 80 ? 'bg-warning' : 'gradient-primary'}`} style={{ width: `${Math.min(100, quotaPercent)}%` }} />
                </div>
              </>
            )}
          </div>
          <StatBox label="ارسال شده" value={stats.totalSent} color="bg-secondary/10 text-secondary" icon={<Send className="w-5 h-5 text-white" />} />
          <StatBox label="شبیه‌سازی شده" value={stats.totalSimulated} color="bg-warning/10 text-warning" icon={<AlertTriangle className="w-5 h-5 text-white" />} />
          <StatBox label="ناموفق" value={stats.totalFailed} color="bg-error/10 text-error" icon={<XCircle className="w-5 h-5 text-white" />} />
        </div>
      )}

      {quotaLimit !== null && !quotaUnlimited && quotaPercent >= 100 && (
        <div className="p-4 rounded-2xl bg-error/5 border border-error/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-error" />
            <span className="text-sm text-error">سهمیه پیامک شما تکمیل شده است. برای ادامه، پلن خود را ارتقا دهید.</span>
          </div>
          <a href="/business/subscription" className="text-sm text-error underline shrink-0">ارتقا پلن</a>
        </div>
      )}
      {quotaLimit !== null && !quotaUnlimited && quotaPercent > 80 && quotaPercent < 100 && (
        <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <span className="text-sm text-warning">بیش از ۸۰٪ سهمیه پیامک استفاده شده است.</span>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-text-primary">تاریخچه پیامک‌ها</h3>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="premium-input px-3 py-2 text-sm rounded-lg">
            <option value="">همه انواع</option>
            <option value="APPOINTMENT_CONFIRM">تأیید نوبت</option>
            <option value="APPOINTMENT_REMINDER">یادآوری نوبت</option>
            <option value="NEW_BOOKING_NOTIFY">نوبت جدید</option>
            <option value="APPOINTMENT_CANCEL">لغو نوبت</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="premium-input px-3 py-2 text-sm rounded-lg">
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
            <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">پیامکی ثبت نشده است</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs bg-muted/30">
                    <th className="p-3 text-right font-medium">نوع</th>
                    <th className="p-3 text-right font-medium">گیرنده</th>
                    <th className="p-3 text-right font-medium">شماره</th>
                    <th className="p-3 text-right font-medium">متن</th>
                    <th className="p-3 text-center font-medium">وضعیت</th>
                    <th className="p-3 text-right font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedLog(log)}>
                      <td className="p-3 text-text-primary text-xs font-medium">{smsTypeLabel[log.smsType] || log.smsType}</td>
                      <td className="p-3 text-text-secondary text-xs">{log.recipientType === 'CUSTOMER' ? 'مشتری' : 'کسب‌وکار'}</td>
                      <td className="p-3 text-text-secondary text-xs ltr-text">{toPersianDigits(log.recipientPhone)}</td>
                      <td className="p-3 text-text-secondary text-xs max-w-xs truncate">{log.messageBody}</td>
                      <td className="p-3 text-center"><GlassBadge variant={statusVariant[log.status] || 'default'}>{statusLabel[log.status] || log.status}</GlassBadge></td>
                      <td className="p-3 text-text-secondary text-xs">{formatDateShortFA(new Date(log.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-text-secondary">صفحه {toPersianDigits(page)} از {toPersianDigits(pagination.totalPages)}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-surface border border-border disabled:opacity-30 hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-surface border border-border disabled:opacity-30 hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">مشاهده پیامک</h3>
              <button onClick={() => setSelectedLog(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">نوع:</span><span className="text-text-primary font-medium">{smsTypeLabel[selectedLog.smsType] || selectedLog.smsType}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">گیرنده:</span><span className="text-text-primary">{selectedLog.recipientType === 'CUSTOMER' ? 'مشتری' : 'کسب‌وکار'}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">شماره:</span><span className="text-text-primary ltr-text">{toPersianDigits(selectedLog.recipientPhone)}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-secondary">وضعیت:</span><GlassBadge variant={statusVariant[selectedLog.status] || 'default'}>{statusLabel[selectedLog.status] || selectedLog.status}</GlassBadge></div>
              <div>
                <span className="text-text-secondary block mb-2">متن پیام:</span>
                <p className="text-text-primary p-4 rounded-xl bg-muted/30 leading-relaxed">{selectedLog.messageBody}</p>
              </div>
              <div className="text-xs text-text-muted pt-2">{formatDateShortFA(new Date(selectedLog.createdAt))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

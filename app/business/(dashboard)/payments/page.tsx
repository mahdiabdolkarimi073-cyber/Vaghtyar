'use client';

import { useState, useEffect, useCallback } from 'react';
import { Receipt, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import GlassBadge from '@/components/ui/GlassBadge';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice, formatDateShortFA } from '@/lib/constants';

interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  status: string;
  refId: string | null;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

interface PaymentHistoryResponse {
  payments: PaymentRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusVariant: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  SUCCESS: 'success', FAILED: 'danger', PENDING: 'warning', REFUNDED: 'default',
};
const statusLabel: Record<string, string> = {
  SUCCESS: 'موفق', FAILED: 'ناموفق', PENDING: 'در انتظار', REFUNDED: 'بازگشت‌داده شده',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await businessFetch<PaymentHistoryResponse>(`/api/payment/history?page=${page}&limit=20`);
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch { toast.error('خطا در بارگذاری پرداخت‌ها'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">پرداخت‌ها</h2>
        <p className="text-sm text-text-secondary mt-0.5">تاریخچه پرداخت‌های اشتراک</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
        {loading ? (
          <div className="h-40 glass-shimmer rounded-xl" />
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
              <Receipt className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">پرداختی ثبت نشده است</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs bg-muted/30">
                    <th className="p-3 text-right font-medium">پلن</th>
                    <th className="p-3 text-right font-medium">مبلغ</th>
                    <th className="p-3 text-center font-medium">وضعیت</th>
                    <th className="p-3 text-right font-medium">کد پیگیری</th>
                    <th className="p-3 text-right font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-text-primary font-medium">{p.planName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-text-primary font-medium">{formatPrice(p.amount)}</td>
                      <td className="p-3 text-center"><GlassBadge variant={statusVariant[p.status] || 'default'}>{statusLabel[p.status] || p.status}</GlassBadge></td>
                      <td className="p-3 text-text-secondary text-xs ltr-text">{p.refId ? toPersianDigits(p.refId) : '-'}</td>
                      <td className="p-3 text-text-secondary text-xs">{formatDateShortFA(new Date(p.createdAt))}</td>
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
    </div>
  );
}

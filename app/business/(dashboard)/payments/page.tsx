'use client';

import { useState, useEffect, useCallback } from 'react';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
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
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text-primary">تاریخچه پرداخت‌ها</h2>

      <GlassCard className="p-4">
        {loading ? (
          <div className="h-40 glass-shimmer rounded-xl" />
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-text-secondary">پرداختی ثبت نشده است</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs">
                    <th className="p-3 text-right">پلن</th>
                    <th className="p-3 text-right">مبلغ</th>
                    <th className="p-3 text-center">وضعیت</th>
                    <th className="p-3 text-right">کد پیگیری</th>
                    <th className="p-3 text-right">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-surface/3 transition-colors">
                      <td className="p-3 text-text-primary font-medium">{p.planName}</td>
                      <td className="p-3 text-text-secondary">{formatPrice(p.amount)}</td>
                      <td className="p-3 text-center"><GlassBadge variant={statusVariant[p.status] || 'default'}>{statusLabel[p.status] || p.status}</GlassBadge></td>
                      <td className="p-3 text-text-secondary text-xs">{p.refId ? toPersianDigits(p.refId) : '-'}</td>
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
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg glass disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg glass disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}

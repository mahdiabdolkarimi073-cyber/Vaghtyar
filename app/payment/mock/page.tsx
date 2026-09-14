'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice } from '@/lib/constants';

interface PaymentDetails {
  id: string;
  planName: string;
  amount: number;
  status: string;
  businessName?: string;
}

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!paymentId) { router.push('/business/subscription'); return; }
    businessFetch<PaymentDetails>(`/api/payment/${paymentId}`)
      .then(setPayment)
      .catch(() => router.push('/business/subscription'))
      .finally(() => setLoading(false));
  }, [paymentId, router]);

  const handleSuccess = async () => {
    setProcessing(true);
    try {
      const result = await businessFetch<{ success: boolean; refId?: string }>(
        '/api/payment/verify',
        { method: 'POST', body: JSON.stringify({ paymentId, status: 'OK' }) }
      );
      if (result.success) {
        router.push(`/payment/success?refId=${result.refId || ''}`);
      } else {
        router.push('/payment/failed');
      }
    } catch {
      router.push('/payment/failed');
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    try {
      await businessFetch('/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify({ paymentId, status: 'NOK' }),
      });
    } catch { /* ignore */ }
    router.push('/payment/failed');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <GlassCard strong className="p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-text-primary mb-2">پرداخت شبیه‌سازی</h1>
        <p className="text-sm text-text-secondary mb-6">این یک پرداخت آزمایشی است. هیچ مبلغی واقعاً کسر نمی‌شود.</p>

        <div className="space-y-3 mb-6 text-right">
          <div className="flex justify-between p-3 rounded-xl bg-surface/5">
            <span className="text-sm text-text-secondary">پلن</span>
            <span className="text-sm font-bold text-text-primary">{payment?.planName}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-surface/5">
            <span className="text-sm text-text-secondary">مبلغ</span>
            <span className="text-sm font-bold gradient-text">{payment ? formatPrice(payment.amount) : ''}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleCancel} disabled={processing} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-muted text-sm flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> انصراف
          </button>
          <GradientButton onClick={handleSuccess} loading={processing} className="flex-1" size="md">
            <Check className="w-4 h-4" /> پرداخت موفق (شبیه‌سازی)
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}

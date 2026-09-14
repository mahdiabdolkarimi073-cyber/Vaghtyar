'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { businessFetch } from '@/lib/business-api';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authority = searchParams.get('Authority') || '';
  const status = searchParams.get('Status') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId || !authority) {
      router.push('/payment/failed');
      return;
    }

    businessFetch<{ success: boolean; refId?: string }>('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId, authority, status }),
    })
      .then(result => {
        if (result.success) {
          router.push(`/payment/success?refId=${result.refId || ''}`);
        } else {
          router.push('/payment/failed');
        }
      })
      .catch(() => router.push('/payment/failed'));
  }, [router, authority, status, paymentId]);

  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-text-secondary">در حال تأیید پرداخت...</p>
        {error && <p className="text-sm text-error mt-2">{error}</p>}
      </div>
    </div>
  );
}

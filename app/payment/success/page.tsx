'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';

interface SubscriptionInfo {
  id: string;
  plan: { name: string };
  endDate: string;
  daysRemaining: number;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refId = searchParams.get('refId') || '';
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessFetch<{ subscription: SubscriptionInfo | null }>('/api/business/subscription')
      .then(data => setSubscription(data.subscription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <GlassCard strong className="p-8 w-full max-w-md text-center">
        <div className="inline-flex w-20 h-20 rounded-full bg-secondary/10 items-center justify-center mb-4 animate-scale-in">
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">پرداخت با موفقیت انجام شد</h1>

        <div className="space-y-3 mb-6 text-right mt-4">
          {subscription && (
            <>
              <div className="flex justify-between p-3 rounded-xl bg-surface/5">
                <span className="text-sm text-text-secondary">پلن</span>
                <span className="text-sm font-bold text-text-primary">{subscription.plan.name}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-surface/5">
                <span className="text-sm text-text-secondary">تاریخ انقضا</span>
                <span className="text-sm text-text-primary">{formatDateShortFA(new Date(subscription.endDate))}</span>
              </div>
            </>
          )}
          {refId && (
            <div className="flex justify-between p-3 rounded-xl bg-surface/5">
              <span className="text-sm text-text-secondary">کد پیگیری</span>
              <span className="text-sm text-text-primary">{toPersianDigits(refId)}</span>
            </div>
          )}
        </div>

        <GradientButton onClick={() => router.push('/business/dashboard')} className="w-full" size="md">
          بازگشت به داشبورد
        </GradientButton>
      </GlassCard>
    </div>
  );
}

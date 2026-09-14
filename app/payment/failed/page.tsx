'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <GlassCard strong className="p-8 w-full max-w-md text-center">
        <div className="inline-flex w-20 h-20 rounded-full bg-red-500/15 items-center justify-center mb-4 animate-scale-in">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-primary-custom mb-2">پرداخت ناموفق بود</h1>
        <p className="text-sm text-secondary-custom mb-6">متأسفانه پرداخت شما با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>

        <div className="flex gap-3">
          <button onClick={() => router.push('/business/subscription')} className="flex-1 py-3 rounded-xl border border-white/10 text-secondary-custom hover:bg-white/5 text-sm">
            تلاش مجدد
          </button>
          <GradientButton onClick={() => router.push('/business/dashboard')} className="flex-1" size="md">
            بازگشت به داشبورد
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}

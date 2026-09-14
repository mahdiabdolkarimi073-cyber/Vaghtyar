'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Check, X, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GlassBadge from '@/components/ui/GlassBadge';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { toPersianDigits, formatPrice, formatDateShortFA } from '@/lib/constants';

interface Plan {
  id: string;
  name: string;
  price: number;
  maxStaff: number;
  maxServices: number;
  hasSms: boolean;
  hasReports: boolean;
  hasCustomSms: boolean;
  hasApi: boolean;
  hasPriority: boolean;
}

interface SubscriptionInfo {
  id: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
}

interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
}

const paymentStatusVariant: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  SUCCESS: 'success', FAILED: 'danger', PENDING: 'warning', REFUNDED: 'default',
};
const paymentStatusLabel: Record<string, string> = {
  SUCCESS: 'موفق', FAILED: 'ناموفق', PENDING: 'در انتظار', REFUNDED: 'بازگشت‌داده شده',
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [subRes, plansData, payData] = await Promise.all([
        businessFetch<{ subscription: SubscriptionInfo | null }>('/api/business/subscription'),
        businessFetch<Plan[]>('/api/business/subscription/plans'),
        businessFetch<PaymentRecord[]>('/api/business/subscription/payments'),
      ]);
      setSubscription(subRes.subscription);
      setPlans(plansData);
      setPayments(payData);
    } catch { toast.error('خطا'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="glass h-96 rounded-2xl glass-shimmer" />;

  const features = [
    { key: 'maxStaff', label: 'حداکثر کارکن' },
    { key: 'maxServices', label: 'حداکثر خدمات' },
    { key: 'hasSms', label: 'اعلان پیامکی' },
    { key: 'hasReports', label: 'گزارش‌های پیشرفته' },
    { key: 'hasCustomSms', label: 'قالب پیامک سفارشی' },
    { key: 'hasApi', label: 'دسترسی API' },
    { key: 'hasPriority', label: 'پشتیبانی اولویت‌دار' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primary-custom">اشتراک و پرداخت</h2>

      {subscription && (
        <GlassCard gradient className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-secondary-custom mb-1">طرح فعلی</div>
              <h3 className="text-xl font-bold gradient-text">{subscription.plan.name}</h3>
            </div>
            <GlassBadge variant={subscription.daysRemaining <= 7 ? 'danger' : 'success'}>
              {toPersianDigits(subscription.daysRemaining)} روز باقی‌مانده
            </GlassBadge>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-secondary-custom mb-1">
              <span>تاریخ انقضا: {formatDateShortFA(new Date(subscription.endDate))}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(100, (subscription.daysRemaining / 30) * 100)}%` }} />
            </div>
          </div>
          {subscription.daysRemaining <= 7 && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              اشتراک شما به‌زودی منقضی می‌شود. برای تداوم خدمات، آن را تمدید کنید.
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <GradientButton size="sm">تمدید اشتراک</GradientButton>
            <button className="px-4 py-2 rounded-xl bg-red-500/15 text-red-300 text-sm hover:bg-red-500/25 transition-all">لغو اشتراک</button>
          </div>
        </GlassCard>
      )}

      <div>
        <h3 className="text-sm font-bold text-primary-custom mb-3">مقایسه طرح‌ها</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map(plan => {
            const isCurrent = subscription?.plan.id === plan.id;
            return (
              <GlassCard key={plan.id} className={`p-5 ${isCurrent ? 'border-indigo-500/50' : ''}`}>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-primary-custom">{plan.name}</h4>
                  <div className="text-2xl font-bold gradient-text mt-1">{formatPrice(plan.price)}</div>
                  <div className="text-xs text-secondary-custom">در ماه</div>
                </div>
                <div className="space-y-2 mb-4">
                  {features.map(f => {
                    const value = plan[f.key as keyof Plan];
                    return (
                      <div key={f.key} className="flex items-center gap-2 text-xs">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />
                        ) : (
                          <span className="text-primary-custom font-medium">{toPersianDigits(value)}</span>
                        )}
                        <span className="text-secondary-custom">{f.label}</span>
                      </div>
                    );
                  })}
                </div>
                {isCurrent ? (
                  <div className="text-center py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-medium">طرح فعلی</div>
                ) : (
                  <GradientButton size="sm" className="w-full">ارتقا</GradientButton>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-primary-custom mb-4">تاریخچه پرداخت</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-secondary-custom text-center py-6">پرداختی ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><CreditCard className="w-5 h-5 text-secondary-custom" /></div>
                  <div>
                    <div className="text-sm text-primary-custom">{p.planName}</div>
                    <div className="text-xs text-secondary-custom">{formatDateShortFA(new Date(p.createdAt))}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-primary-custom">{formatPrice(p.amount)}</span>
                  <GlassBadge variant={paymentStatusVariant[p.status] || 'default'}>{paymentStatusLabel[p.status] || p.status}</GlassBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

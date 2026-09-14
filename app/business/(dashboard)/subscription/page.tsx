'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Check, X, Calendar, Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  maxServices: number | null;
  maxStaff: number | null;
  hasManualConfirm: boolean;
  smsConfirmQuota: number | null;
  hasSmsReminder: boolean;
  hasRevenueReport: boolean;
  hasMarketplacePage: boolean;
  hasFeaturedListing: boolean;
  hasCustomerReviews: boolean;
  hasDiscountCodes: boolean;
  hasCustomerNotes: boolean;
  hasPhoneSupport: boolean;
  isActive: boolean;
}

interface SmsQuota {
  used: number;
  limit: number | null;
  unlimited: boolean;
  planName: string;
}

interface SubscriptionInfo {
  id: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
  smsQuota: SmsQuota;
}

interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  status: string;
  refId: string | null;
  createdAt: string;
}

const paymentStatusVariant: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  SUCCESS: 'success', FAILED: 'danger', PENDING: 'warning', REFUNDED: 'default',
};
const paymentStatusLabel: Record<string, string> = {
  SUCCESS: 'موفق', FAILED: 'ناموفق', PENDING: 'در انتظار', REFUNDED: 'بازگشت‌داده شده',
};

const FEATURE_LIST: { key: keyof Plan; label: string; type: 'boolean' | 'quota' | 'count' }[] = [
  { key: 'maxServices', label: 'حداکثر خدمات', type: 'count' },
  { key: 'maxStaff', label: 'حداکثر کارکنان', type: 'count' },
  { key: 'hasManualConfirm', label: 'تأیید دستی نوبت', type: 'boolean' },
  { key: 'smsConfirmQuota', label: 'سهمیه پیامک تأیید', type: 'quota' },
  { key: 'hasSmsReminder', label: 'یادآوری پیامکی', type: 'boolean' },
  { key: 'hasRevenueReport', label: 'گزارش درآمد', type: 'boolean' },
  { key: 'hasMarketplacePage', label: 'صفحه بازارچه', type: 'boolean' },
  { key: 'hasFeaturedListing', label: 'نمایش ویژه', type: 'boolean' },
  { key: 'hasCustomerReviews', label: 'نظرات مشتریان', type: 'boolean' },
  { key: 'hasDiscountCodes', label: 'کد تخفیف', type: 'boolean' },
  { key: 'hasCustomerNotes', label: 'یادداشت مشتری', type: 'boolean' },
  { key: 'hasPhoneSupport', label: 'پشتیبانی تلفنی', type: 'boolean' },
];

function formatLimitValue(value: number | null | boolean, type: 'boolean' | 'quota' | 'count'): string | boolean {
  if (type === 'boolean') return value as boolean;
  if (value === null) return 'نامحدود';
  return toPersianDigits(value as number);
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

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
    } catch { toast.error('خطا در بارگذاری اطلاعات'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const res = await businessFetch<{ paymentId: string; redirectUrl?: string; isMock: boolean }>(
        '/api/payment/initiate',
        { method: 'POST', body: JSON.stringify({ planId }) }
      );
      if (res.isMock) {
        router.push(`/payment/mock?paymentId=${res.paymentId}`);
      } else if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در شروع پرداخت');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="glass h-96 rounded-2xl glass-shimmer" />;

  const smsQuota = subscription?.smsQuota;
  const quotaUsed = smsQuota?.used ?? 0;
  const quotaLimit = smsQuota?.limit;
  const quotaUnlimited = smsQuota?.unlimited ?? false;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text-primary">اشتراک و پرداخت</h2>

      {subscription && (
        <GlassCard gradient className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-text-secondary mb-1">طرح فعلی</div>
              <h3 className="text-xl font-bold gradient-text">{subscription.plan.name}</h3>
            </div>
            <GlassBadge variant={subscription.daysRemaining <= 7 ? 'danger' : 'success'}>
              {toPersianDigits(subscription.daysRemaining)} روز باقی‌مانده
            </GlassBadge>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>تاریخ انقضا: {formatDateShortFA(new Date(subscription.endDate))}</span>
            </div>
            <div className="h-2 rounded-full bg-surface/5 overflow-hidden">
              <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(100, (subscription.daysRemaining / 30) * 100)}%` }} />
            </div>
          </div>
          {subscription.daysRemaining <= 7 && subscription.daysRemaining > 0 && (
            <div className="p-3 rounded-xl bg-error/10 border border-red-500/20 text-sm text-red-300">
              اشتراک شما به‌زودی منقضی می‌شود. برای تداوم خدمات، آن را تمدید کنید.
            </div>
          )}

          {!quotaUnlimited && quotaLimit !== null && quotaLimit !== undefined && (
            <div className="mt-4 p-3 rounded-xl bg-surface/5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">سهمیه پیامک تأیید این ماه</span>
                <span className="text-text-primary font-medium">
                  {toPersianDigits(quotaUsed)} / {toPersianDigits(quotaLimit)} پیامک
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${quotaUsed >= quotaLimit ? 'bg-red-500' : quotaUsed / quotaLimit > 0.8 ? 'bg-orange-500' : 'gradient-primary'}`}
                  style={{ width: `${Math.min(100, (quotaUsed / quotaLimit) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {toPersianDigits(Math.max(0, quotaLimit - quotaUsed))} پیامک باقی‌مانده
              </div>
            </div>
          )}
          {quotaUnlimited && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              سهمیه پیامک نامحدود
            </div>
          )}
        </GlassCard>
      )}

      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3">مقایسه طرح‌ها</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map(plan => {
            const isCurrent = subscription?.plan.id === plan.id;
            const isUpgrade = !isCurrent && (!subscription || plan.price > subscription.plan.price);
            return (
              <GlassCard key={plan.id} className={`p-5 flex flex-col ${isCurrent ? 'border-indigo-500/50' : ''}`}>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-text-primary">{plan.name}</h4>
                  <div className="text-2xl font-bold gradient-text mt-1">{formatPrice(plan.price)}</div>
                  <div className="text-xs text-text-secondary">در ماه</div>
                </div>
                <div className="space-y-2 mb-4 flex-1">
                  {FEATURE_LIST.map(f => {
                    const value = plan[f.key] as number | null | boolean;
                    const display = formatLimitValue(value, f.type);
                    return (
                      <div key={f.key} className="flex items-center gap-2 text-xs">
                        {f.type === 'boolean' ? (
                          display ? <Check className="w-4 h-4 text-secondary shrink-0" /> : <X className="w-4 h-4 text-error shrink-0" />
                        ) : (
                          <span className="text-text-primary font-medium shrink-0">{display}</span>
                        )}
                        <span className="text-text-secondary">{f.label}</span>
                      </div>
                    );
                  })}
                </div>
                {isCurrent ? (
                  <div className="text-center py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">پلن فعلی</div>
                ) : isUpgrade ? (
                  <GradientButton
                    size="sm"
                    className="w-full"
                    loading={upgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    ارتقا
                  </GradientButton>
                ) : (
                  <div className="text-center py-2 rounded-xl bg-surface/5 text-text-secondary text-sm">پلن پایین‌تر</div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-text-primary mb-4">تاریخچه پرداخت</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6">پرداختی ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><CreditCard className="w-5 h-5 text-text-secondary" /></div>
                  <div>
                    <div className="text-sm text-text-primary">{p.planName}</div>
                    <div className="text-xs text-text-secondary">{formatDateShortFA(new Date(p.createdAt))}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-primary">{formatPrice(p.amount)}</span>
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

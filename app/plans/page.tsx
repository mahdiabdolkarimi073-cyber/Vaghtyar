import Link from 'next/link';
import { Check, X, Sparkles, Calendar, Users, Scissors, MessageSquare, Bell, BarChart3, Star, Phone, Tag, StickyNote, Store, Zap } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { toPersianDigits, formatPrice } from '@/lib/constants';
import { getSiteSettings } from '@/lib/site-settings-server';

export const dynamic = 'force-dynamic';

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

const PLAN_DESCRIPTIONS: Record<string, string> = {
  'رایگان': 'مناسب برای شروع کار و آشنایی با پلتفرم',
  'پایه': 'مناسب برای کسب‌وکارهای کوچک و متوسط',
  'حرفه‌ای': 'مناسب برای کسب‌وکارهای متوسط و حرفه‌ای',
  'ویژه': 'مناسب برای سالن‌ها و کسب‌وکارهای بزرگ',
};

const PLAN_ICONS: Record<string, typeof Sparkles> = {
  'رایگان': Zap,
  'پایه': Calendar,
  'حرفه‌ای': Star,
  'ویژه': Sparkles,
};

const PLAN_ACCENTS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'رایگان': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600' },
  'پایه': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  'حرفه‌ای': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  'ویژه': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
};

type FeatureType = 'boolean' | 'quota' | 'count' | 'always-yes';

interface FeatureItem {
  icon: typeof Calendar;
  label: string;
  key: keyof Plan;
  type: FeatureType;
}

const FEATURES: FeatureItem[] = [
  { icon: Scissors, label: 'تعداد خدمات', key: 'maxServices', type: 'count' },
  { icon: Users, label: 'تعداد کارکنان', key: 'maxStaff', type: 'count' },
  { icon: Calendar, label: 'تقویم نوبت‌دهی', key: 'hasMarketplacePage', type: 'always-yes' },
  { icon: Zap, label: 'تأیید خودکار نوبت', key: 'hasMarketplacePage', type: 'always-yes' },
  { icon: Check, label: 'تأیید دستی نوبت', key: 'hasManualConfirm', type: 'boolean' },
  { icon: MessageSquare, label: 'پیامک تأیید نوبت', key: 'smsConfirmQuota', type: 'quota' },
  { icon: Bell, label: 'پیامک یادآوری', key: 'hasSmsReminder', type: 'boolean' },
  { icon: BarChart3, label: 'گزارش درآمد', key: 'hasRevenueReport', type: 'boolean' },
  { icon: Store, label: 'صفحه اختصاصی در بازار', key: 'hasMarketplacePage', type: 'boolean' },
  { icon: Star, label: 'جایگاه ویژه در نتایج', key: 'hasFeaturedListing', type: 'boolean' },
  { icon: MessageSquare, label: 'نظرات مشتریان', key: 'hasCustomerReviews', type: 'boolean' },
  { icon: Tag, label: 'کدهای تخفیف', key: 'hasDiscountCodes', type: 'boolean' },
  { icon: StickyNote, label: 'یادداشت مشتری', key: 'hasCustomerNotes', type: 'boolean' },
  { icon: Phone, label: 'پشتیبانی تلفنی', key: 'hasPhoneSupport', type: 'boolean' },
];

function formatFeatureValue(plan: Plan, feature: FeatureItem): { display: string | boolean; isPositive: boolean } {
  if (feature.type === 'always-yes') return { display: true, isPositive: true };
  const value = plan[feature.key];
  if (feature.type === 'boolean') return { display: value as boolean, isPositive: value as boolean };
  if (feature.type === 'quota') {
    if (value === null) return { display: 'نامحدود', isPositive: true };
    if (value === 0) return { display: false, isPositive: false };
    return { display: toPersianDigits(value as number), isPositive: true };
  }
  if (feature.type === 'count') {
    if (value === null) return { display: 'نامحدود', isPositive: true };
    return { display: toPersianDigits(value as number), isPositive: true };
  }
  return { display: false, isPositive: false };
}

export default async function PlansPage() {
  const [plans, settings] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }) as Promise<Plan[]>,
    getSiteSettings(),
  ]);

  return (
    <div dir="rtl">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container mx-auto px-4 max-w-7xl relative z-10 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">طرح‌های اشتراک</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            پلن مناسب کسب‌وکار خود را انتخاب کنید
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            از پلن رایگان شروع کنید و هر زمان که نیاز داشتید، پلن خود را ارتقا دهید. بدون قرارداد، بدون تعهد طولانی‌مدت.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="container mx-auto px-4 max-w-7xl -mt-12 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => {
            const accent = PLAN_ACCENTS[plan.name] || PLAN_ACCENTS['رایگان'];
            const Icon = PLAN_ICONS[plan.name] || Sparkles;
            const isPremium = plan.name === 'ویژه';
            const description = PLAN_DESCRIPTIONS[plan.name] || '';

            return (
              <div
                key={plan.id}
                className={`bg-surface rounded-2xl border-2 ${isPremium ? 'border-amber-300 shadow-xl' : 'border-border shadow-card'} overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up flex flex-col`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {isPremium && (
                  <div className="bg-gradient-to-l from-amber-400 to-amber-500 text-white text-center py-2 text-sm font-bold">
                    محبوب‌ترین انتخاب
                  </div>
                )}
                <div className={`p-6 ${accent.bg} border-b ${accent.border}`}>
                  <div className={`w-14 h-14 rounded-2xl ${accent.badge} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${accent.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{description}</p>
                  <div className="flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-text-primary">رایگان</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold gradient-text">{formatPrice(plan.price)}</span>
                        <span className="text-sm text-text-secondary">/ ماه</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <ul className="space-y-3">
                    {FEATURES.map((feature) => {
                      const { display, isPositive } = formatFeatureValue(plan, feature);
                      return (
                        <li key={feature.label} className="flex items-center gap-3 text-sm">
                          {isPositive ? (
                            <div className={`w-5 h-5 rounded-full ${accent.badge} flex items-center justify-center shrink-0`}>
                              <Check className={`w-3.5 h-3.5 ${accent.text}`} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <X className="w-3.5 h-3.5 text-text-muted" />
                            </div>
                          )}
                          <span className={`flex-1 ${isPositive ? 'text-text-primary' : 'text-text-muted'}`}>
                            {feature.label}
                          </span>
                          {typeof display === 'string' && (
                            <span className={`text-xs font-medium ${isPositive ? accent.text : 'text-text-muted'}`}>
                              {display}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <Link href="/register-business" className="block">
                    <button
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        isPremium
                          ? 'bg-gradient-to-l from-amber-400 to-amber-500 text-white hover:shadow-lg'
                          : plan.price === 0
                          ? 'bg-muted text-text-primary hover:bg-muted/80'
                          : 'gradient-primary text-white hover:shadow-primary'
                      }`}
                    >
                      {plan.price === 0 ? 'شروع رایگان' : 'انتخاب این پلن'}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 max-w-7xl py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">مقایسه کامل طرح‌ها</h2>
          <p className="text-text-secondary">تمام جزئیات و امکانات هر پلن در یک نگاه</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border shadow-card bg-surface">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 font-semibold text-text-secondary whitespace-nowrap">قابلیت</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center p-4 whitespace-nowrap min-w-[140px]">
                    <div className="font-bold text-text-primary">{plan.name}</div>
                    <div className="text-lg font-bold gradient-text mt-1">
                      {plan.price === 0 ? 'رایگان' : formatPrice(plan.price)}
                    </div>
                    <div className="text-xs text-text-secondary">در ماه</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr key={feature.label} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                  <td className="text-right p-4 text-text-secondary whitespace-nowrap font-medium">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-text-muted" />
                      {feature.label}
                    </div>
                  </td>
                  {plans.map(plan => {
                    const { display, isPositive } = formatFeatureValue(plan, feature);
                    return (
                      <td key={plan.id} className="text-center p-4 whitespace-nowrap">
                        {typeof display === 'boolean' ? (
                          display ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-text-muted mx-auto" />
                          )
                        ) : (
                          <span className={`font-medium ${isPositive ? 'text-text-primary' : 'text-text-muted'}`}>
                            {display}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-border">
                <td className="p-4"></td>
                {plans.map(plan => (
                  <td key={plan.id} className="p-4 text-center">
                    <Link href="/register-business" className="inline-block">
                      <button
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                          plan.name === 'ویژه'
                            ? 'bg-gradient-to-l from-amber-400 to-amber-500 text-white hover:shadow-lg'
                            : plan.price === 0
                            ? 'bg-muted text-text-primary hover:bg-muted/80'
                            : 'gradient-primary text-white hover:shadow-primary'
                        }`}
                      >
                        {plan.price === 0 ? 'شروع' : 'انتخاب'}
                      </button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-10 md:p-16 text-center overflow-hidden relative shadow-primary">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20V10h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-20V10H4v4H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">آماده شروع هستید؟</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              همین حالا در {settings.site_name} ثبت‌نام کنید و نوبت‌گیری آنلاین را برای مشتریان خود فراهم کنید. بدون هزینه اولیه، بدون ریسک.
            </p>
            <Link href="/register-business">
              <button className="bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-primary-foreground/10 hover:text-white transition-all shadow-lg active:scale-95">
                شروع ثبت‌نام کسب‌وکار
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

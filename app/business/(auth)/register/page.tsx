'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Building2, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { GlassInput, GlassTextarea } from '@/components/ui/GlassInput';

const schema = z.object({
  ownerFirstName: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  ownerLastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر'),
  ownerMobile: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'نام کسب‌وکار حداقل ۲ کاراکتر'),
  category: z.string().min(1, 'دسته‌بندی را انتخاب کنید'),
  neighborhood: z.string().min(2, 'محله را وارد کنید'),
  address: z.string().min(5, 'آدرس کامل را وارد کنید'),
  phone: z.string().regex(/^0\d{10}$/, 'تلفن معتبر نیست'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  'سالن زیبایی', 'آرایشگاه', 'کلینیک', 'دندانپزشکی', 'پوست', 'ناخن', 'تاتو', 'سایر',
];

export default function BusinessRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPending = searchParams.get('status') === 'pending';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/business/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerFirstName: data.ownerFirstName,
          ownerLastName: data.ownerLastName,
          ownerMobile: data.ownerMobile,
          email: data.email,
          password: data.password,
          name: data.name,
          category: data.category,
          city: 'کرمان',
          neighborhood: data.neighborhood,
          address: data.address,
          phone: data.phone,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = step === 1 ? ['ownerFirstName', 'ownerLastName', 'ownerMobile', 'email', 'password', 'confirmPassword'] : ['name', 'category', 'neighborhood', 'address', 'phone'];
    const valid = await trigger(fields as (keyof FormData)[]);
    if (valid) setStep(step + 1);
  };

  if (isPending || step === 4) {
    return (
      <>
        <BackgroundOrbs />
        <div className="w-full max-w-md mx-auto">
          <GlassCard className="p-8 text-center animate-scale-in">
            <div className="inline-flex w-20 h-20 rounded-full bg-warning/10 items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-warning animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-3">در انتظار تایید مدیر</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              درخواست شما با موفقیت ثبت شد. پس از تایید توسط مدیر سیستم، می‌توانید به پنل خود وارد شوید.
            </p>
            <div className="mt-6">
              <Link href="/business/login" className="text-sm text-primary hover:text-primary transition-colors">
                بازگشت به ورود
              </Link>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundOrbs />
      <div className="w-full max-w-lg mx-auto">
        <GlassCard className="p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 rounded-2xl gradient-primary items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ثبت‌نام کسب‌وکار</h1>
            <p className="text-sm text-text-secondary mt-2">پنل مدیریت نوبت‌یار برای کسب‌وکار شما</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= s ? 'gradient-primary text-white' : 'bg-surface/5 text-text-secondary border border-border'
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${step > s ? 'bg-indigo-500' : 'bg-surface/10'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm font-medium text-text-secondary mb-4">اطواع صاحب کسب‌وکار</p>
              <div className="grid grid-cols-2 gap-4">
                <GlassInput {...register('ownerFirstName')} placeholder="نام" error={errors.ownerFirstName?.message} />
                <GlassInput {...register('ownerLastName')} placeholder="نام خانوادگی" error={errors.ownerLastName?.message} />
              </div>
              <GlassInput {...register('ownerMobile')} placeholder="موبایل (09xxxxxxxxx)" error={errors.ownerMobile?.message} />
              <GlassInput {...register('email')} type="email" placeholder="ایمیل" error={errors.email?.message} />
              <GlassInput {...register('password')} type="password" placeholder="رمز عبور" error={errors.password?.message} />
              <GlassInput {...register('confirmPassword')} type="password" placeholder="تکرار رمز عبور" error={errors.confirmPassword?.message} />
              <GradientButton onClick={nextStep} className="w-full" size="lg">مرحله بعد</GradientButton>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm font-medium text-text-secondary mb-4">اطلاعات کسب‌وکار</p>
              <GlassInput {...register('name')} placeholder="نام کسب‌وکار" error={errors.name?.message} />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">دسته‌بندی</label>
                <select {...register('category')} className="glass-input w-full px-4 py-2.5 text-sm">
                  <option value="" className="bg-surface">انتخاب کنید</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface">{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-error mt-1">{errors.category.message}</p>}
              </div>
              <GlassInput {...register('neighborhood')} placeholder="محله" error={errors.neighborhood?.message} />
              <GlassTextarea {...register('address')} placeholder="آدرس کامل" rows={2} error={errors.address?.message} />
              <GlassInput {...register('phone')} placeholder="تلفن (0xxxxxxxxxx)" error={errors.phone?.message} />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm">
                  مرحله قبل
                </button>
                <GradientButton onClick={nextStep} className="flex-1" size="lg">مرحله بعد</GradientButton>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
              <p className="text-sm font-medium text-text-secondary mb-4">بررسی و تایید</p>
              <GlassCard className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">نام:</span><span>{watch('ownerFirstName')} {watch('ownerLastName')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">موبایل:</span><span>{watch('ownerMobile')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">ایمیل:</span><span>{watch('email')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">کسب‌وکار:</span><span>{watch('name')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">دسته‌بندی:</span><span>{watch('category')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">محله:</span><span>{watch('neighborhood')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">تلفن:</span><span>{watch('phone')}</span></div>
              </GlassCard>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm">
                  مرحله قبل
                </button>
                <GradientButton type="submit" loading={loading} className="flex-1" size="lg">ثبت نهایی</GradientButton>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-text-secondary">
            حساب دارید؟{' '}
            <Link href="/business/login" className="text-primary hover:text-primary font-medium">
              وارد شوید
            </Link>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { GlassInput } from '@/components/ui/GlassInput';

const schema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BusinessLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/business/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      if (result.business.status === 'PENDING') {
        router.push('/business/register?status=pending');
        return;
      }
      router.push('/business/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundOrbs />
      <div className="w-full max-w-md mx-auto">
        <GlassCard className="p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl gradient-primary items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ورود کسب‌وکار</h1>
            <p className="text-sm text-secondary-custom mt-2">به پنل مدیریت کسب‌وکار خود وارد شوید</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <GlassInput
                {...register('email')}
                type="email"
                placeholder="ایمیل"
                error={errors.email?.message}
                className="pr-11"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-custom pointer-events-none" style={{ marginTop: errors.email ? '0' : '0' }} />
            </div>

            <div className="relative">
              <GlassInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="رمز عبور"
                error={errors.password?.message}
                className="pr-11 pl-11"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-custom pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-custom hover:text-primary-custom transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-secondary-custom">
                <input type="checkbox" {...register('remember')} className="rounded border-white/20 bg-white/5" />
                مرا به خاطر بسپار
              </label>
              <Link href="/business/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                رمز خود را فراموشته‌اید؟
              </Link>
            </div>

            <GradientButton type="submit" loading={loading} className="w-full" size="lg">
              ورود
            </GradientButton>
          </form>

          <div className="mt-6 text-center text-sm text-secondary-custom">
            کسب‌وکار ندارید؟{' '}
            <Link href="/business/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              ثبت‌نام کنید
            </Link>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { GlassInput } from '@/components/ui/GlassInput';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/business/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // ignore — server always returns success
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <BackgroundOrbs />
        <div className="w-full max-w-md mx-auto">
          <GlassCard className="p-8 text-center animate-scale-in">
            <div className="inline-flex w-20 h-20 rounded-full bg-emerald-500/15 items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-primary-custom mb-3">لینک بازیابت ارسال شد</h2>
            <p className="text-sm text-secondary-custom leading-relaxed">
              اگر ایمیلی با این آدرس در سیستم ثبت شده باشد، لینک بازیابی رمز عبور ارسال خواهد شد.
            </p>
            <div className="mt-6">
              <Link href="/business/login" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <ArrowRight className="w-4 h-4" />
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
      <div className="w-full max-w-md mx-auto">
        <GlassCard className="p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl gradient-primary items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">بازیابی رمز عبور</h1>
            <p className="text-sm text-secondary-custom mt-2">ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              type="email"
              placeholder="ایمیل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <GradientButton type="submit" loading={loading} className="w-full" size="lg">
              ارسال لینک بازیابی
            </GradientButton>
          </form>

          <div className="mt-6 text-center">
            <Link href="/business/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              بازگشت به ورود
            </Link>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

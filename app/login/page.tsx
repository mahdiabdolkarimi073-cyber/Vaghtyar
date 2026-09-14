'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Phone, Lock, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api';
import type { User as UserType } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'BUSINESS_OWNER',
  });

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: UserType }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      login(data.token, data.user);
      router.push(data.user.role === 'BUSINESS_OWNER' ? '/dashboard' : '/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: UserType }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });
      login(data.token, data.user);
      setSuccess('ثبت‌نام موفق بود! در حال انتقال...');
      setTimeout(() => {
        router.push(data.user.role === 'BUSINESS_OWNER' ? '/dashboard' : '/');
      }, 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">نوبت‌یار</h1>
          <p className="text-gray-500 mt-1">به پلتفرم رزرو آنلاین نوبت خوش آمدید</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'register'); setError(''); setSuccess(''); }}>
            <TabsList className="bg-gray-50 rounded-xl p-1 w-full mb-6 h-auto">
              <TabsTrigger value="login" className="rounded-lg py-2 flex-1">ورود</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg py-2 flex-1">ثبت‌نام</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">شماره موبایل</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                      placeholder="09XXXXXXXXX"
                      className="w-full h-12 rounded-xl border border-gray-200 pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-right"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-12 rounded-xl border border-gray-200 pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
                <Button
                  onClick={handleLogin}
                  disabled={loading || !loginForm.phone || !loginForm.password}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl"
                >
                  {loading ? 'در حال ورود...' : 'ورود'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">نام و نام خانوادگی</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="نام شما"
                      className="w-full h-12 rounded-xl border border-gray-200 pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">شماره موبایل</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="09XXXXXXXXX"
                      className="w-full h-12 rounded-xl border border-gray-200 pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-right"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="حداقل ۶ کاراکتر"
                      className="w-full h-12 rounded-xl border border-gray-200 pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">نوع حساب</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, role: 'CUSTOMER' })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        registerForm.role === 'CUSTOMER' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                      }`}
                    >
                      <User className="w-6 h-6 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">مشتری</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, role: 'BUSINESS_OWNER' })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        registerForm.role === 'BUSINESS_OWNER' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                      }`}
                    >
                      <Store className="w-6 h-6 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">صاحب کسب‌وکار</span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
                  </div>
                )}
                <Button
                  onClick={handleRegister}
                  disabled={loading || !registerForm.name || !registerForm.phone || !registerForm.password}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl"
                >
                  {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">بازگشت به صفحه اصلی</Link>
        </p>
      </div>
    </div>
  );
}

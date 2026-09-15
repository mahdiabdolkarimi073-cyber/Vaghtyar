'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ورود');
      toast.success('ورود موفقیت‌آمیز بود');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 px-4">
      <div className="admin-card p-8 w-full max-w-md admin-animate">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl admin-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold admin-gradient-text mb-1">پنل مدیریت نوبت‌یار</h1>
          <p className="text-sm text-text-muted">برای ورود اطلاعات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">شماره موبایل</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="admin-input w-full h-11 px-4 text-sm"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              required
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="admin-input w-full h-11 px-4 pl-10 text-sm"
                placeholder="رمز عبور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="admin-gradient-primary text-white w-full h-11 rounded-xl font-medium text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}

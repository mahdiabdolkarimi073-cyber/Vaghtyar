'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api';
import { useSiteSettings } from '@/hooks/use-site-settings';
import type { Category, City } from '@/lib/types';

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { settings } = useSiteSettings();

  const [form, setForm] = useState({
    name: '',
    category: '',
    city: '',
    neighborhood: '',
    address: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    Promise.all([
      apiFetch<{ categories: Category[] }>('/api/categories'),
      apiFetch<{ cities: City[] }>('/api/cities'),
    ]).then(([catData, cityData]) => {
      setCategories(catData.categories);
      setCities(cityData.cities);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.category || !form.city) {
      setError('نام، دسته‌بندی و شهر الزامی است');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/businesses', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">کسب‌وکار شما ثبت شد!</h1>
        <p className="text-text-muted">در حال انتقال به پنل مدیریت...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-10">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> بازگشت
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">ثبت کسب‌وکار</h1>
        <p className="text-text-muted mt-1">کسب‌وکار خود را در {settings.site_name} ثبت کنید</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-text-secondary mb-1 block">نام کسب‌وکار *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثلا: سالن زیبایی رز"
            className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">دسته‌بندی *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-12 rounded-xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-surface"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">شهر *</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full h-12 rounded-xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-surface"
            >
              <option value="">انتخاب کنید</option>
              {cities.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-1 block">محله</label>
          <input
            type="text"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            placeholder="مثلا: مرکز شهر"
            className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-1 block">آدرس کامل</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="خیابان، پلاک، ..."
            className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-1 block">شماره تماس</label>
          <input
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09XXXXXXXXX"
            className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary text-right"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-1 block">توضیحات</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="معرفی کسب‌وکار..."
            className="w-full rounded-xl border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl"
        >
          {submitting ? 'در حال ثبت...' : 'ثبت کسب‌وکار'}
        </Button>
      </div>
    </div>
  );
}

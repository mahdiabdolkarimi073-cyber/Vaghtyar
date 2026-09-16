'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, AlertCircle, CheckCircle2, ArrowLeft, MapPin, Camera, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api';
import { useSiteSettings } from '@/hooks/use-site-settings';
import MapPicker from '@/components/MapPicker';
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
    latitude: null as number | null,
    longitude: null as number | null,
    profileImage: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('فقط فایل تصویری مجاز است');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حداکثر حجم تصویر ۵ مگابایت است');
      return;
    }

    setError('');
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('images', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/business/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در آپلود');
      if (data.urls && data.urls.length > 0) {
        setForm((prev) => ({ ...prev, profileImage: data.urls[0] }));
      }
    } catch (e) {
      setError((e as Error).message);
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setForm((prev) => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

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
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          city: form.city,
          neighborhood: form.neighborhood,
          address: form.address,
          phone: form.phone,
          description: form.description,
          latitude: form.latitude,
          longitude: form.longitude,
          profileImage: form.profileImage,
        }),
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

        {/* Map Picker Section */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            موقعیت روی نقشه
          </label>
          <p className="text-xs text-text-muted mb-3">
            روی نقشه کلیک کنید یا آدرس را جستجو کنید تا موقعیت دقیق کسب‌وکار خود را مشخص کنید
          </p>
          <MapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onLocationSelect={handleLocationSelect}
            businessName={form.name || undefined}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-primary" />
            تصویر کسب‌وکار
          </label>
          <p className="text-xs text-text-muted mb-3">
            یک تصویر از کسب‌وکار خود آپلود کنید (حداکثر ۵ مگابایت)
          </p>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border group">
              <img
                src={imagePreview}
                alt="پیش‌نمایش تصویر"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm">در حال آپلود...</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              type="button"
              className="w-full h-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-10 h-10" />
              <span className="text-sm font-medium">
                {uploadingImage ? 'در حال آپلود...' : 'برای انتخاب تصویر کلیک کنید'}
              </span>
              <span className="text-xs">JPG, PNG, WebP - حداکثر ۵ مگابایت</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
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

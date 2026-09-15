'use client';

import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Building2, MapPin, CheckCircle2,
  Loader2, Upload, X, Image as ImageIcon, Store, Sparkles, ArrowLeft, ArrowRight,
  MapPinned,
} from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { GlassInput, GlassTextarea } from '@/components/ui/GlassInput';
import { useSiteSettings } from '@/hooks/use-site-settings';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

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

const STEP_LABELS = ['اطلاعات صاحب', 'اطلاعات کسب‌وکار', 'تصاویر', 'موقعیت روی نقشه', 'بررسی و تایید'];

export default function BusinessRegisterPage() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get('status') === 'pending';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSiteSettings();

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    if (uploadedImages.length + fileArray.length > 5) {
      toast.error('حداکثر ۵ تصویر مجاز است');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('images', file));
      const res = await fetch('/api/business/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadedImages((prev) => [...prev, ...data.urls]);
      toast.success('تصاویر با موفقیت آپلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadedImages.length]);

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

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
          coverImage: uploadedImages[0] || null,
          profileImage: uploadedImages[0] || null,
          photos: uploadedImages,
          latitude: latitude,
          longitude: longitude,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setStep(6);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = step === 1
      ? ['ownerFirstName', 'ownerLastName', 'ownerMobile', 'email', 'password', 'confirmPassword']
      : ['name', 'category', 'neighborhood', 'address', 'phone'];
    if (step < 5) {
      const valid = await trigger(fields as (keyof FormData)[]);
      if (valid) setStep(step + 1);
    }
  };

  if (isPending || step === 6) {
    return (
      <>
        <BackgroundOrbs />
        <div className="w-full max-w-md mx-auto">
          <GlassCard className="p-8 text-center animate-scale-in">
            <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-3">درخواست شما ثبت شد</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              درخواست شما با موفقیت ثبت شد. پس از تایید توسط مدیر سیستم، می‌توانید به پنل خود وارد شوید.
            </p>
            <div className="mt-6">
              <Link href="/business/login" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
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
      <div className="w-full max-w-xl mx-auto">
        <GlassCard className="p-8 animate-scale-in" strong>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl gradient-primary items-center justify-center mb-4 shadow-primary">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ثبت‌نام کسب‌وکار</h1>
            <p className="text-sm text-text-secondary mt-2">پنل مدیریت {settings.site_name} برای کسب‌وکار شما</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEP_LABELS.map((label, s) => (
              <div key={s} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step > s + 1
                      ? 'bg-secondary text-white shadow-soft'
                      : step === s + 1
                        ? 'gradient-primary text-white shadow-primary'
                        : 'bg-surface/5 text-text-secondary border border-border'
                  }`}>
                    {step > s + 1 ? <CheckCircle2 className="w-4 h-4" /> : s + 1}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${step === s + 1 ? 'text-primary' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </div>
                {s < STEP_LABELS.length - 1 && (
                  <div className={`w-6 h-0.5 rounded-full transition-all duration-300 ${step > s + 1 ? 'bg-secondary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Owner Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-text-primary">اطلاعات صاحب کسب‌وکار</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassInput {...register('ownerFirstName')} placeholder="نام" error={errors.ownerFirstName?.message} />
                <GlassInput {...register('ownerLastName')} placeholder="نام خانوادگی" error={errors.ownerLastName?.message} />
              </div>
              <GlassInput {...register('ownerMobile')} placeholder="موبایل (09xxxxxxxxx)" error={errors.ownerMobile?.message} />
              <GlassInput {...register('email')} type="email" placeholder="ایمیل" error={errors.email?.message} />
              <div className="grid grid-cols-2 gap-4">
                <GlassInput {...register('password')} type="password" placeholder="رمز عبور" error={errors.password?.message} />
                <GlassInput {...register('confirmPassword')} type="password" placeholder="تکرار رمز عبور" error={errors.confirmPassword?.message} />
              </div>
              <GradientButton onClick={nextStep} className="w-full" size="lg">
                مرحله بعد
                <ArrowLeft className="w-4 h-4" />
              </GradientButton>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-text-primary">اطلاعات کسب‌وکار</p>
              </div>
              <GlassInput {...register('name')} placeholder="نام کسب‌وکار" error={errors.name?.message} />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">دسته‌بندی</label>
                <select
                  {...register('category')}
                  className="glass-input w-full px-4 py-3 text-sm"
                >
                  <option value="">انتخاب کنید</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-error mt-1">{errors.category.message}</p>}
              </div>
              <GlassInput {...register('neighborhood')} placeholder="محله" error={errors.neighborhood?.message} />
              <GlassTextarea {...register('address')} placeholder="آدرس کامل" rows={2} error={errors.address?.message} />
              <GlassInput {...register('phone')} placeholder="تلفن (0xxxxxxxxxx)" error={errors.phone?.message} />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  مرحله قبل
                </button>
                <GradientButton onClick={nextStep} className="flex-1" size="lg">
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </GradientButton>
              </div>
            </div>
          )}

          {/* Step 3: Image Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-text-primary">تصاویر کسب‌وکار</p>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                تا ۵ تصویر از کسب‌وکار خود آپلود کنید. تصویر اول به عنوان تصویر اصلی نمایش داده می‌شود.
              </p>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-secondary">در حال آپلود...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">تصاویر را اینجا بکویید یا کلیک کنید</p>
                    <p className="text-xs text-text-muted">حداکثر ۵ تصویر، هر کدام حداکثر ۵ مگابایت</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
              </div>

              {/* Preview uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`تصویر ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                          اصلی
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  مرحله قبل
                </button>
                <GradientButton onClick={nextStep} className="flex-1" size="lg">
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </GradientButton>
              </div>
            </div>
          )}

          {/* Step 4: Map Location */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <MapPinned className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-text-primary">موقعیت روی نقشه</p>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                روی نقشه کلیک کنید تا محل دقیق کسب‌وکار خود را مشخص کنید. یا آدرس را جستجو کنید.
              </p>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                businessName={watch('name')}
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  مرحله قبل
                </button>
                <GradientButton onClick={nextStep} className="flex-1" size="lg">
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </GradientButton>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-text-primary">بررسی و تایید اطلاعات</p>
              </div>

              {/* Image preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {uploadedImages.slice(0, 4).map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`تصویر ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <GlassCard className="p-5 space-y-3 text-sm" hover>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> نام:</span>
                  <span className="font-medium text-text-primary">{watch('ownerFirstName')} {watch('ownerLastName')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> موبایل:</span>
                  <span className="font-medium text-text-primary">{watch('ownerMobile')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> ایمیل:</span>
                  <span className="font-medium text-text-primary">{watch('email')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> کسب‌وکار:</span>
                  <span className="font-medium text-text-primary">{watch('name')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary">دسته‌بندی:</span>
                  <span className="font-medium text-text-primary">{watch('category')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> محله:</span>
                  <span className="font-medium text-text-primary">{watch('neighborhood')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary">تلفن:</span>
                  <span className="font-medium text-text-primary">{watch('phone')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary flex items-center gap-1.5"><MapPinned className="w-3.5 h-3.5" /> موقعیت:</span>
                  <span className="font-medium text-text-primary" dir="ltr">
                    {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'انتخاب نشده'}
                  </span>
                </div>
              </GlassCard>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  مرحله قبل
                </button>
                <GradientButton type="submit" loading={loading} className="flex-1" size="lg">
                  ثبت نهایی
                </GradientButton>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-text-secondary">
            حساب دارید؟{' '}
            <Link href="/business/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              وارد شوید
            </Link>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

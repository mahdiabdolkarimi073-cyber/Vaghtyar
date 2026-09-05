'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Clock, Phone, Smartphone, Calendar,
  ChevronLeft, Map as MapIcon, CheckCircle2, Send,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  type SalonApiResponse, type BusinessDetail, type ReviewItem,
  PERSIAN_DAYS, formatPrice, formatDuration, toPersianDigits,
} from '@/lib/salon-types';

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'نام را کامل وارد کنید'),
  rating: z.number().int().min(1, 'امتیاز را انتخاب کنید').max(5),
  comment: z.string().trim().min(5, 'متن نظر را کامل وارد کنید'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export function SalonProfileClient({ data }: { data: SalonApiResponse }) {
  const { business, similarBusinesses } = data;
  const [activeTab, setActiveTab] = useState('services');

  return (
    <>
      <HeroSection business={business} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} reviewCount={business.reviewCount} />
      <DetailsSection business={business} similarBusinesses={similarBusinesses} activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

function HeroSection({ business }: { business: BusinessDetail }) {
  return (
    <section className="relative w-full" dir="rtl">
      <div className="relative h-64 w-full overflow-hidden bg-slate-200 sm:h-80 lg:h-96">
        {business.coverImage ? (
          <img src={business.coverImage} alt={business.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-l from-indigo-200 to-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto -mt-16 flex max-w-7xl flex-col gap-4 px-5 sm:px-8 lg:flex-row lg:items-end lg:gap-6 lg:px-[120px]">
        <Avatar className="h-32 w-32 shrink-0 border-4 border-white shadow-lg sm:h-36 sm:w-36">
          {business.logoImage ? (
            <AvatarImage src={business.logoImage} alt={business.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-indigo-500 text-3xl font-bold text-white">
            {business.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">{business.name}</h1>
                {business.isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  {business.category.name}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  {business.neighborhood?.name || business.city.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-slate-800">{business.rating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({business.reviewCount.toLocaleString('fa-IR')} نظر)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              {business.address || 'آدرس ثبت نشده'}
            </span>
            {business.today.openTime && (
              <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${business.today.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Clock className="h-3.5 w-3.5" />
                {business.today.isOpen ? 'باز' : 'بسته'} - {toPersianDigits(business.today.openTime)} تا {toPersianDigits(business.today.closeTime || '')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-5 sm:px-8 lg:px-[120px]">
        <Link href={`/salon/${business.slug}/book`}>
          <Button className="w-full gap-2 rounded-xl bg-indigo-500 py-3 text-base font-bold text-white hover:bg-indigo-600 sm:w-auto">
            <Calendar className="h-5 w-5" />
            رزرو نوبت
          </Button>
        </Link>
      </div>
    </section>
  );
}

function TabNavigation({ activeTab, onTabChange, reviewCount }: { activeTab: string; onTabChange: (v: string) => void; reviewCount: number }) {
  const items = [
    { value: 'services', label: 'خدمات' },
    { value: 'about', label: 'درباره' },
    { value: 'reviews', label: `نظرات (${reviewCount.toLocaleString('fa-IR')})` },
    { value: 'location', label: 'موقعیت' },
  ];

  return (
    <nav className="sticky top-0 z-30 flex h-14 w-full items-center justify-center border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-[120px]">
      <Tabs value={activeTab} onValueChange={onTabChange} dir="rtl" className="w-full">
        <TabsList className="h-14 gap-6 rounded-none bg-transparent p-0 sm:gap-8">
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="h-14 rounded-none border-b-[3px] border-transparent bg-transparent px-0 py-0 font-normal text-[15px] text-slate-500 shadow-none data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-indigo-500 data-[state=active]:shadow-none"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
}

function DetailsSection({ business, similarBusinesses, activeTab, onTabChange }: {
  business: BusinessDetail;
  similarBusinesses: SalonApiResponse['similarBusinesses'];
  activeTab: string;
  onTabChange: (v: string) => void;
}) {
  return (
    <section className="flex w-full flex-col items-start gap-6 px-5 pb-20 pt-8 sm:px-8 lg:flex-row lg:px-[120px]">
      <Tabs value={activeTab} onValueChange={onTabChange} dir="rtl" className="flex min-w-0 flex-1 flex-col gap-6">
        <TabsContent value="services" className="mt-0">
          <ServicesTab business={business} />
        </TabsContent>
        <TabsContent value="about" className="mt-0">
          <AboutTab business={business} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          <ReviewsTab business={business} />
        </TabsContent>
        <TabsContent value="location" className="mt-0">
          <LocationTab business={business} />
        </TabsContent>
      </Tabs>

      <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
        <ContactCard business={business} />
        <WorkingHoursCard business={business} />
        <SimilarBusinessesCard businesses={similarBusinesses} />
      </aside>
    </section>
  );
}

const cardClassName = 'w-full rounded-2xl border border-slate-200 bg-white shadow-none';
const titleClassName = 'text-right font-extrabold text-slate-800';

function ServicesTab({ business }: { business: BusinessDetail }) {
  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-xl`}>خدمات</h2>
        <div className="flex flex-col">
          {business.services.map((service) => (
            <article key={service.id} className="flex items-center justify-between gap-4 border-b border-slate-200 py-5" dir="rtl">
              <div className="min-w-0 flex-1 text-right">
                <h3 className="text-base font-bold text-slate-800">{service.name}</h3>
                <p className="mt-1.5 text-[13px] text-slate-500">مدت زمان: {formatDuration(service.durationMin)}</p>
              </div>
              <p className="shrink-0 text-left text-[15px] font-semibold text-slate-800">
                {formatPrice(service.price)} تومان
              </p>
              <Link href={`/salon/${business.slug}/book?service=${service.id}`}>
                <Button
                  variant="outline"
                  className="shrink-0 rounded-lg border-indigo-500 bg-white px-6 py-2 text-sm font-semibold text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  انتخاب
                </Button>
              </Link>
            </article>
          ))}
          {business.services.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">خدماتی برای این سالن ثبت نشده است.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AboutTab({ business }: { business: BusinessDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className={cardClassName}>
        <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
          <h2 className={`${titleClassName} text-xl`}>درباره {business.name}</h2>
          <p className="text-right text-[15px] leading-7 text-slate-500">
            {business.description || 'توضیحاتی برای این سالن ثبت نشده است.'}
          </p>
        </CardContent>
      </Card>

      {business.gallery.length > 0 && (
        <Card className={cardClassName}>
          <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
            <h2 className={`${titleClassName} text-xl`}>گالری تصاویر</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {business.gallery.map((image) => (
                <div key={image.id} className="h-28 overflow-hidden rounded-xl sm:h-32">
                  <img src={image.url} alt={business.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {business.staff.length > 0 && (
        <Card className={cardClassName}>
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <h2 className={`${titleClassName} text-xl`}>تیم ما</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {business.staff.map((member) => (
                <article key={member.id} className="flex flex-col items-center gap-3" dir="rtl">
                  <Avatar className="h-20 w-20">
                    {member.photo ? (
                      <AvatarImage src={member.photo} alt={member.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-indigo-100 text-lg font-bold text-indigo-500">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewsTab({ business }: { business: BusinessDetail }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(business.reviews);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: '', rating: 0, comment: '' },
  });
  const selectedRating = watch('rating');

  const onSubmit = async (values: ReviewForm) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/salon/${business.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ثبت نظر ناموفق بود');
      setReviews((prev) => [{ ...data.review, createdAt: new Date().toISOString() }, ...prev]);
      reset();
      toast.success('نظر شما با موفقیت ثبت شد.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ثبت نظر ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-xl`}>نظرات کاربران</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5" dir="rtl">
          <h3 className="text-sm font-bold text-slate-700">ثبت نظر جدید</h3>
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-name">نام شما</Label>
            <Input id="review-name" {...register('name')} placeholder="نام و نام خانوادگی" />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>امتیاز</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star, { shouldValidate: true })}
                >
                  <Star className={`h-7 w-7 transition-colors ${star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-xs text-rose-500">{errors.rating.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-comment">متن نظر</Label>
            <Textarea id="review-comment" {...register('comment')} rows={3} placeholder="تجربه خود را بنویسید..." />
            {errors.comment && <p className="text-xs text-rose-500">{errors.comment.message}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="gap-2 self-start rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">
            <Send className="h-4 w-4" />
            {submitting ? 'در حال ارسال...' : 'ارسال نظر'}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          {reviews.length === 0 && <p className="py-6 text-center text-sm text-slate-400">هنوز نظری ثبت نشده است.</p>}
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-2 border-b border-slate-100 pb-4" dir="rtl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{review.name}</span>
                <div className="flex items-center gap-1" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">{review.comment}</p>
              <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('fa-IR')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LocationTab({ business }: { business: BusinessDetail }) {
  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-xl`}>موقعیت</h2>
        <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" dir="rtl">
          <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(135deg, #e2e8f0 25%, #f1f5f9 25%, #f1f5f9 50%, #e2e8f0 50%, #e2e8f0 75%, #f1f5f9 75%, #f1f5f9 100%)', backgroundSize: '40px 40px' }}>
            <div className="absolute right-0 top-1/3 h-1 w-full bg-white/70" />
            <div className="absolute left-1/4 top-0 h-full w-1 bg-white/70" />
          </div>
          {business.lat && business.lng && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <MapPin className="h-8 w-8 text-indigo-500 drop-shadow" fill="white" />
            </div>
          )}
        </div>
        {business.lat && business.lng && (
          <a href={`https://maps.google.com/?q=${business.lat},${business.lng}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full gap-2 rounded-lg border-slate-200 py-3 text-sm font-bold text-indigo-500 hover:bg-indigo-50">
              <MapIcon className="h-4 w-4" />
              مشاهده در نقشه
            </Button>
          </a>
        )}
        <p className="flex items-start gap-2 text-sm text-slate-600" dir="rtl">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          {business.address || 'آدرس ثبت نشده'}
        </p>
      </CardContent>
    </Card>
  );
}

function ContactCard({ business }: { business: BusinessDetail }) {
  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-lg`} dir="rtl">اطلاعات تماس</h2>
        <div className="flex flex-col gap-4" dir="rtl">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center justify-between text-[15px] text-slate-800">
              <Phone className="h-[18px] shrink-0 text-slate-500" />
              <span dir="ltr">{toPersianDigits(business.phone)}</span>
            </a>
          )}
          <div className="flex items-start gap-3" dir="rtl">
            <MapPin className="mt-0.5 h-[18px] shrink-0 text-slate-500" />
            <div className="flex flex-1 flex-col gap-1 text-right">
              <p className="text-sm font-medium text-slate-800">{business.neighborhood?.name || business.city.name}</p>
              <p className="text-[13px] text-slate-500">{business.address || 'آدرس ثبت نشده'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkingHoursCard({ business }: { business: BusinessDetail }) {
  const todayIndex = (new Date().getDay() + 1) % 7;
  const sorted = [...business.workingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-lg`} dir="rtl">ساعات کاری</h2>
        <dl className="flex flex-col gap-3">
          {PERSIAN_DAYS.map((day, index) => {
            const hours = sorted.find((h) => h.dayOfWeek === index);
            const isToday = index === todayIndex;
            return (
              <div key={day} className={`flex items-center justify-between py-1 text-sm ${isToday ? 'font-bold text-emerald-600' : 'font-medium text-slate-800'}`} dir="rtl">
                <dt>{day}</dt>
                <dd className={isToday ? 'text-emerald-600' : 'text-slate-500'}>
                  {hours ? `${toPersianDigits(hours.openTime)} - ${toPersianDigits(hours.closeTime)}` : 'تعطیل'}
                </dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}

function SimilarBusinessesCard({ businesses }: { businesses: SalonApiResponse['similarBusinesses'] }) {
  if (businesses.length === 0) return null;
  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className={`${titleClassName} text-lg`} dir="rtl">سالن‌های مشابه</h2>
        <div className="flex flex-col gap-4">
          {businesses.map((biz) => (
            <Link key={biz.id} href={`/salon/${biz.slug}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                {biz.coverImage && <img src={biz.coverImage} alt={biz.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex flex-1 flex-col gap-1" dir="rtl">
                <h3 className="text-sm font-bold text-slate-800">{biz.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {biz.rating.toFixed(1)}
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  {biz.neighborhood?.name || ''}
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-slate-300" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SalonProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-5 py-8 sm:px-8 lg:px-[120px]">
      <Skeleton className="h-80 w-full rounded-2xl" />
      <Skeleton className="h-32 w-32 rounded-full" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

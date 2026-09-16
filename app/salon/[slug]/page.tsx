'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Phone, Clock, Star, BadgeCheck, Sparkles, Calendar,
  CheckCircle2, MessageCircle, Scissors, ChevronLeft, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating, StarRatingInput } from '@/components/StarRating';
import { apiFetch } from '@/lib/api';
import {
  toPersianDigits, formatPrice, formatDuration, formatTime,
  DAY_NAMES_FA, formatDateShortFA
} from '@/lib/constants';
import type { Business, Service, Staff, BusinessHours, Review } from '@/lib/types';
import BusinessCard from '@/components/BusinessCard';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface BusinessDetail extends Business {
  services: Service[];
  staff: Staff[];
  hours: BusinessHours[];
  reviews: Review[];
  photos?: string[];
  owner?: { name: string };
}

export default function SalonPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [similarBusinesses, setSimilarBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', bookingCode: '', customerName: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    apiFetch<BusinessDetail>(`/api/businesses/${slug}`)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
    apiFetch<{ businesses: Business[] }>(`/api/businesses/${slug}/similar`)
      .then((data) => setSimilarBusinesses(data.businesses))
      .catch(() => setSimilarBusinesses([]));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
        <h2 className="text-xl text-text-secondary">کسب‌وکار یافت نشد</h2>
        <Link href="/search"><Button className="mt-4 bg-primary hover:bg-primary-dark text-white">بازگشت به جستجو</Button></Link>
      </div>
    );
  }

  const today = new Date().getDay();
  const todayHours = business.hours.find(h => h.dayOfWeek === today);

  const submitReview = async () => {
    try {
      // Find booking by code
      const bookingData = await apiFetch<{ booking: { id: string; businessId: string } }>(`/api/bookings/${reviewForm.bookingCode}`);
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          businessId: bookingData.booking.businessId,
          bookingId: bookingData.booking.id,
          customerName: reviewForm.customerName,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      setReviewSubmitted(true);
      setReviewForm({ rating: 5, comment: '', bookingCode: '', customerName: '' });
      // Refresh reviews
      const updated = await apiFetch<BusinessDetail>(`/api/businesses/${slug}`);
      setBusiness(updated);
    } catch (e) {
      alert((e as Error).message || 'خطا در ثبت نظر');
    }
  };

  return (
    <div>
      {/* Cover Image */}
      <div className="relative h-80 md:h-[420px] bg-gradient-to-br from-primary to-primary-light overflow-hidden">
        {(business.coverImage || (business.photos && business.photos.length > 0)) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverImage || business.photos![0]} alt={business.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-4 -mt-12 relative z-10 mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-surface shadow-card-hover bg-surface flex-shrink-0">
            {business.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.profileImage} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 bg-surface rounded-xl shadow-card border border-border p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-text-primary">{business.name}</h1>
                  {business.isVerified && <BadgeCheck className="w-6 h-6 text-primary" />}
                  {business.isFeatured && (
                    <span className="bg-warning text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> ویژه
                    </span>
                  )}
                </div>
                {business.neighborhood && (
                  <p className="text-text-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {business.neighborhood}، {business.address}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <StarRating rating={business.avgRating || 0} />
                  <span className="text-sm text-text-muted">({toPersianDigits(business.reviewCount || 0)} نظر)</span>
                  {business.isOpenNow ? (
                    <span className="text-secondary text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> باز الان
                    </span>
                  ) : (
                    <span className="text-error text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> تعطیر
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/booking/${business.slug}`}>
                <Button className="bg-primary hover:bg-primary-dark text-white gap-2 px-6">
                  <Calendar className="w-5 h-5" /> رزرو نوبت
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="mb-10">
          <TabsList className="bg-surface border border-border rounded-xl p-1 w-full justify-start gap-1 h-auto">
            <TabsTrigger value="services" className="rounded-lg px-4 py-2 text-sm">خدمات</TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg px-4 py-2 text-sm">درباره</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg px-4 py-2 text-sm">نظرات</TabsTrigger>
            <TabsTrigger value="location" className="rounded-lg px-4 py-2 text-sm">موقعیت</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-4">
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {business.services.map((service, i) => (
                <div key={service.id} className={`flex items-center justify-between p-5 ${i !== business.services.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary">{service.name}</h3>
                    {service.description && <p className="text-sm text-text-muted mt-1">{service.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-primary font-bold">{formatPrice(service.price)}</span>
                      <span className="text-text-muted text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDuration(service.durationMinutes)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/booking/${business.slug}?serviceId=${service.id}`}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">انتخاب</Button>
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-4">
            <div className="space-y-6">
              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-bold text-text-primary mb-3">درباره {business.name}</h3>
                <p className="text-text-secondary leading-relaxed">{business.description || 'اطلاعاتی ثبت نشده است.'}</p>
              </div>

              {business.photos && business.photos.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-6">
                  <h3 className="font-bold text-text-primary mb-4">تصاویر کسب‌وکار</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {business.photos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt={`${business.name} - تصویر ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-bold text-text-primary mb-4">متخصصین</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {business.staff.map(staff => (
                    <div key={staff.id} className="flex items-center gap-3 bg-muted rounded-xl p-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                        {staff.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-primary" /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">{staff.name}</h4>
                        {staff.specialty && <p className="text-sm text-text-muted">{staff.specialty}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-bold text-text-primary mb-4">ساعات کاری</h3>
                <div className="space-y-2">
                  {business.hours.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-text-secondary font-medium">{DAY_NAMES_FA[h.dayOfWeek]}</span>
                      {h.isClosed ? (
                        <span className="text-error text-sm">تعطیر</span>
                      ) : (
                        <span className="text-text-muted text-sm">{formatTime(h.openTime)} - {formatTime(h.closeTime)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-6">
              {/* Review form */}
              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-bold text-text-primary mb-4">ثبت نظر</h3>
                {reviewSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-text-secondary">نظر شما با موفقیت ثبت شد.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-text-secondary mb-1 block">نام شما</label>
                        <input type="text" value={reviewForm.customerName} onChange={e => setReviewForm({...reviewForm, customerName: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="نام و نام خانوادگی" />
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary mb-1 block">کد پیگیری رزرو</label>
                        <input type="text" value={reviewForm.bookingCode} onChange={e => setReviewForm({...reviewForm, bookingCode: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="مثلا ABCD1234" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-text-secondary mb-2 block">امتیاز</label>
                      <StarRatingInput value={reviewForm.rating} onChange={v => setReviewForm({...reviewForm, rating: v})} />
                    </div>
                    <div>
                      <label className="text-sm text-text-secondary mb-1 block">نظر شما</label>
                      <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="تجربه خود را بنویسید..." />
                    </div>
                    <Button onClick={submitReview} className="bg-primary hover:bg-primary-dark text-white">ثبت نظر</Button>
                  </div>
                )}
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {business.reviews.length === 0 ? (
                  <div className="bg-surface rounded-xl border border-border p-8 text-center text-text-muted">
                    هنوز نظری ثبت نشده است.
                  </div>
                ) : (
                  business.reviews.map(review => (
                    <div key={review.id} className="bg-surface rounded-xl border border-border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {review.customerName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">{review.customerName}</h4>
                            <span className="text-xs text-text-muted">{formatDateShortFA(new Date(review.createdAt))}</span>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.comment && <p className="text-text-secondary leading-relaxed mb-2">{review.comment}</p>}
                      {review.businessReply && (
                        <div className="bg-muted rounded-lg p-3 mt-3 border-r-2 border-primary">
                          <p className="text-sm text-text-secondary"><span className="font-medium">پاسخ کسب‌وکار: </span>{review.businessReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="mt-4">
            <div className="space-y-6">
              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-bold text-text-primary mb-3">آدرس و تماس</h3>
                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-start gap-2 text-text-secondary">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Phone className="w-5 h-5 text-primary" />
                      <span dir="ltr">{toPersianDigits(business.phone)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-surface rounded-xl border border-border p-2 overflow-hidden">
                <div className="h-[400px] rounded-xl overflow-hidden">
                  {business.latitude && business.longitude ? (
                    <MapView lat={business.latitude} lng={business.longitude} name={business.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                      موقعیت روی نقشه ثبت نشده است
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar businesses */}
        {similarBusinesses.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">کسب‌وکارهای مشابه</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check, ChevronLeft, ChevronRight, Clock, User, Calendar,
  CheckCircle2, Sparkles, Phone, FileText, AlertCircle, Home, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import {
  toPersianDigits, formatPrice, formatDuration, formatTime,
  DAY_NAMES_FA, formatDateShortFA
} from '@/lib/constants';
import JalaliCalendar from '@/components/JalaliCalendar';
import { useSiteSettings } from '@/hooks/use-site-settings';
import type { Business, Service, Staff, TimeSlot, Booking } from '@/lib/types';

const STEPS = ['انتخاب خدمت', 'انتخاب متخصص', 'تاریخ و زمان', 'اطلاعات مشتری', 'تأیید و ثبت'];

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', note: '', terms: false });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const { settings } = useSiteSettings();

  const bookingFee = Number(settings.booking_fee) || 0;
  const totalPrice = (selectedService?.price || 0) + bookingFee;

  // Pre-select service from URL
  const preselectServiceId = searchParams.get('serviceId');

  useEffect(() => {
    Promise.all([
      apiFetch<Business & { services: Service[]; staff: Staff[] }>(`/api/businesses/${slug}`),
    ]).then(([data]) => {
      setBusiness(data);
      setServices(data.services || []);
      setStaff(data.staff || []);
      if (preselectServiceId) {
        const svc = (data.services || []).find(s => s.id === preselectServiceId);
        if (svc) {
          setSelectedService(svc);
          setStep(1);
        }
      }
    }).catch(() => {});
  }, [slug, preselectServiceId]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService || !business) return;
    setLoadingSlots(true);
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    apiFetch<{ slots: TimeSlot[] }>(`/api/businesses/${slug}/availability?date=${dateStr}&serviceId=${selectedService.id}${selectedStaff ? `&staffId=${selectedStaff}` : ''}`)
      .then(data => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, selectedStaff, business, slug]);

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedService;
      case 1: return true; // "any available" is always an option
      case 2: return !!selectedDate && !!selectedTime;
      case 3: return customerForm.name && /^09\d{9}$/.test(customerForm.phone) && customerForm.terms;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!business || !selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const result = await apiFetch<{ booking: Booking }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          staffId: selectedStaff || undefined,
          customerName: customerForm.name,
          customerPhone: customerForm.phone,
          customerNote: customerForm.note || undefined,
          date: dateStr,
          startTime: selectedTime,
        }),
      });
      setConfirmedBooking(result.booking);
    } catch (e) {
      setError((e as Error).message || 'خطا در ثبت نوبت');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation screen
  if (confirmedBooking) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-10">
        <div className="bg-surface rounded-2xl border border-border shadow-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">نوبت شما ثبت شد!</h1>
          <p className="text-text-muted mb-6">کد پیگیری خود را یادداشت کنید.</p>

          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-text-muted mb-1">کد پیگیری</p>
            <p className="text-3xl font-bold text-primary tracking-wider" dir="ltr">{confirmedBooking.confirmationCode}</p>
          </div>

          <div className="text-right space-y-3 mb-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">کسب‌وکار</span>
              <span className="font-medium text-text-primary">{business?.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">خدمت</span>
              <span className="font-medium text-text-primary">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">تاریخ</span>
              <span className="font-medium text-text-primary">{selectedDate && formatDateShortFA(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">ساعت</span>
              <span className="font-medium text-text-primary">{formatTime(selectedTime)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">وضعیت</span>
              <span className={`font-medium ${confirmedBooking.status === 'CONFIRMED' ? 'text-green-600' : 'text-warning'}`}>
                {confirmedBooking.status === 'CONFIRMED' ? 'تأیید شد' : 'در انتظار تأیید'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-text-muted text-sm">مبلغ خدمت</span>
              <span className="font-medium text-primary">{formatPrice(selectedService?.price || 0)}</span>
            </div>
            {bookingFee > 0 && (
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-text-muted text-sm flex items-center gap-1"><Receipt className="w-3 h-3" /> هزینه رزرو</span>
                <span className="font-medium text-primary">{formatPrice(bookingFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">مبلغ کل</span>
              <span className="font-bold text-primary text-lg">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <p className="text-sm text-text-muted mb-6">پیام یادآوری به شماره شما ارسال شد.</p>

          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2"><Home className="w-4 h-4" /> صفحه اصلی</Button>
            </Link>
            <Link href={`/salon/${business?.slug}`}>
              <Button className="bg-primary hover:bg-primary-dark text-white">صفحه کسب‌وکار</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
          <div className="h-40 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors ${
                i < step ? 'bg-primary text-white' : i === step ? 'bg-primary/10 text-primary ring-2 ring-teal-600' : 'bg-muted text-text-muted'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : toPersianDigits(i + 1)}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <span key={i} className={`text-xs ${i === step ? 'text-primary font-medium' : 'text-text-muted'} ${i === STEPS.length - 1 ? '' : 'flex-1'}`}>{s}</span>
          ))}
        </div>
      </div>

      {/* Step 0: Service selection */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary mb-4">انتخاب خدمت</h2>
          {services.map(service => (
            <button
              key={service.id}
              onClick={() => { setSelectedService(service); setStep(1); }}
              className={`w-full text-right bg-surface rounded-2xl border-2 p-5 transition-all hover:shadow-card ${
                selectedService?.id === service.id ? 'border-teal-500 bg-primary/10' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary">{service.name}</h3>
                  {service.description && <p className="text-sm text-text-muted mt-1">{service.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-primary font-bold">{formatPrice(service.price)}</span>
                    <span className="text-text-muted text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(service.durationMinutes)}</span>
                  </div>
                  {bookingFee > 0 && (
                    <p className="text-xs text-text-muted mt-1">+ {formatPrice(bookingFee)} هزینه رزرو = {formatPrice(service.price + bookingFee)}</p>
                  )}
                </div>
                {selectedService?.id === service.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Staff selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary mb-4">انتخاب متخصص</h2>
          <button
            onClick={() => { setSelectedStaff(null); setStep(2); }}
            className={`w-full text-right bg-surface rounded-2xl border-2 p-5 transition-all hover:shadow-card ${
              selectedStaff === null ? 'border-teal-500 bg-primary/10' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">هر کسی که خالی باشد</h3>
                <p className="text-sm text-text-muted">اولین متخصص در دسترس</p>
              </div>
            </div>
          </button>
          {staff.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedStaff(s.id); setStep(2); }}
              className={`w-full text-right bg-surface rounded-2xl border-2 p-5 transition-all hover:shadow-card ${
                selectedStaff === s.id ? 'border-teal-500 bg-primary/10' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {s.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-text-muted" /></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{s.name}</h3>
                  {s.specialty && <p className="text-sm text-text-muted">{s.specialty}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date and time */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">انتخاب تاریخ و زمان</h2>
          <JalaliCalendar onSelect={setSelectedDate} selectedDate={selectedDate} />

          {selectedDate && (
            <div>
              <h3 className="font-medium text-text-secondary mb-3">
                زمان‌های موجود - {DAY_NAMES_FA[selectedDate.getDay()]} {formatDateShortFA(selectedDate)}
              </h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-muted rounded-xl p-6 text-center text-text-muted">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  زمانی برای این روز موجود نیست.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`h-12 rounded-lg font-medium text-sm transition-all ${
                        selectedTime === slot.time
                          ? 'bg-primary text-white'
                          : slot.available
                          ? 'bg-surface border border-border text-text-secondary hover:border-teal-500 hover:text-primary'
                          : 'bg-muted text-text-muted cursor-not-allowed line-through'
                      }`}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Customer info */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-text-primary mb-4">اطلاعات مشتری</h2>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">نام و نام خانوادگی *</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} placeholder="نام شما" className="w-full h-12 rounded-xl border border-border pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">شماره موبایل *</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="tel" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="09XXXXXXXXX" dir="ltr" className="w-full h-12 rounded-xl border border-border pr-10 px-4 text-sm outline-none focus:ring-2 focus:ring-primary text-right" />
            </div>
            {customerForm.phone && !/^09\d{9}$/.test(customerForm.phone) && (
              <p className="text-xs text-error mt-1">شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد.</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">توضیحات (اختیاری)</label>
            <textarea value={customerForm.note} onChange={e => setCustomerForm({...customerForm, note: e.target.value})} rows={3} placeholder="هر نکته‌ای که لازم است..." className="w-full rounded-xl border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={customerForm.terms} onChange={e => setCustomerForm({...customerForm, terms: e.target.checked})} className="w-4 h-4 mt-1 rounded accent-teal-600" />
            <span className="text-sm text-text-secondary">قوانین و مقررات {settings.site_name} را می‌پذیرم.</span>
          </label>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-text-primary mb-4">تأیید و ثبت نوبت</h2>
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
            <h3 className="font-bold text-text-primary mb-3">خلاصه نوبت</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">کسب‌وکار</span><span className="font-medium text-text-primary">{business.name}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">خدمت</span><span className="font-medium text-text-primary">{selectedService?.name}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">متخصص</span><span className="font-medium text-text-primary">{selectedStaff ? staff.find(s => s.id === selectedStaff)?.name || '—' : 'هر کسی که خالی باشد'}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">تاریخ</span><span className="font-medium text-text-primary">{selectedDate && formatDateShortFA(selectedDate)}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">ساعت</span><span className="font-medium text-text-primary">{formatTime(selectedTime)}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">نام</span><span className="font-medium text-text-primary">{customerForm.name}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">موبایل</span><span className="font-medium text-text-primary" dir="ltr">{toPersianDigits(customerForm.phone)}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">مبلغ خدمت</span><span className="font-medium text-primary">{formatPrice(selectedService?.price || 0)}</span></div>
              {bookingFee > 0 && (
                <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted flex items-center gap-1"><Receipt className="w-3 h-3" /> هزینه رزرو</span><span className="font-medium text-primary">{formatPrice(bookingFee)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-text-muted">مبلغ کل</span><span className="font-bold text-primary text-lg">{formatPrice(totalPrice)}</span></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronRight className="w-4 h-4" /> مرحله قبل
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary-dark text-white gap-2"
          >
            مرحله بعد <ChevronLeft className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary hover:bg-primary-dark text-white gap-2 px-8"
          >
            {submitting ? 'در حال ثبت...' : 'ثبت نهایی نوبت'}
          </Button>
        )}
      </div>
    </div>
  );
}

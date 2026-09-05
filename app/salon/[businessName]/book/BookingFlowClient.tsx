'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check, ChevronLeft, ChevronRight, Clock, Calendar,
  User, Phone, CheckCircle2, Loader2, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useForm, type UseFormRegister, type UseFormHandleSubmit, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import {
  type SalonApiResponse, type ServiceItem,
  formatPrice, formatDuration, toPersianDigits,
} from '@/lib/salon-types';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'نام را کامل وارد کنید'),
  phone: z.string().trim().min(8, 'شماره تماس را صحیح وارد کنید').max(20),
});

type CustomerForm = z.infer<typeof customerSchema>;

const STEPS = [
  { num: 1, label: 'انتخاب خدمات' },
  { num: 2, label: 'انتخاب متخصص' },
  { num: 3, label: 'تاریخ و ساعت' },
  { num: 4, label: 'تأیید رزرو' },
];

export function BookingFlowClient({ data }: { data: SalonApiResponse }) {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <BookingFlowInner data={data} />
    </Suspense>
  );
}

function BookingFlowInner({ data }: { data: SalonApiResponse }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service');
  const stepParam = parseInt(searchParams.get('step') || '1');
  const [step, setStep] = useState(Math.min(Math.max(stepParam, 1), 4));

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>(() => {
    if (initialService) {
      const svc = data.business.services.find((s) => s.id === Number(initialService));
      return svc ? [svc] : [];
    }
    return [];
  });
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: number; date: string; time: string; customerName: string; totalPrice: number } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    router.replace(`/salon/${data.business.slug}/book?step=${step}`, { scroll: false });
  }, [step, router, data.business.slug]);

  useEffect(() => {
    if (step !== 3 || !selectedDate || selectedServices.length === 0) return;
    setLoadingSlots(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const controller = new AbortController();
    fetch(`/api/salon/${data.business.slug}/availability?date=${dateStr}&serviceIds=${selectedServices.map((s) => s.id).join(',')}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { if (d.slots) setSlots(d.slots); })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [step, selectedDate, selectedServices, data.business.slug]);

  const toggleService = (service: ServiceItem) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMin, 0);

  const onConfirm = async (formValues: CustomerForm) => {
    try {
      const res = await fetch(`/api/salon/${data.business.slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceIds: selectedServices.map((s) => s.id),
          staffId: selectedStaffId,
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
          time: selectedTime,
          customerName: formValues.name,
          customerPhone: formValues.phone,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'ثبت رزرو ناموفق بود');
      setBookingResult(result.booking);
      toast.success('رزرو شما با موفقیت ثبت شد!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ثبت رزرو ناموفق بود');
    }
  };

  if (bookingResult) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-16 sm:px-8" dir="rtl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">رزرو شما ثبت شد!</h1>
        <Card className="w-full rounded-2xl border border-slate-200 bg-white shadow-none">
          <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">شماره رزرو</span>
              <span className="font-bold text-slate-800">#{toPersianDigits(String(bookingResult.id))}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">تاریخ</span>
              <span className="font-bold text-slate-800">{toPersianDigits(bookingResult.date)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">ساعت</span>
              <span className="font-bold text-slate-800">{toPersianDigits(bookingResult.time)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">به نام</span>
              <span className="font-bold text-slate-800">{bookingResult.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">مبلغ کل</span>
              <span className="font-bold text-indigo-500">{formatPrice(bookingResult.totalPrice)} تومان</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Link href={`/salon/${data.business.slug}`}>
            <Button variant="outline" className="rounded-lg border-slate-200 text-slate-700">بازگشت به سالن</Button>
          </Link>
          <Link href="/">
            <Button className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">صفحه اصلی</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8" dir="rtl">
      <div className="flex items-center gap-2">
        <Link href={`/salon/${data.business.slug}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
            <ChevronRight className="h-4 w-4" />
            بازگشت
          </Button>
        </Link>
        <h1 className="text-lg font-extrabold text-slate-800">رزرو نوبت - {data.business.name}</h1>
      </div>

      <ProgressIndicator currentStep={step} />

      {step === 1 && (
        <Step1Services
          services={data.business.services}
          selected={selectedServices}
          onToggle={toggleService}
          onNext={() => {
            if (selectedServices.length === 0) { toast.error('حداقل یک خدمت انتخاب کنید'); return; }
            router.push(`/booking/employee?serviceId=${selectedServices[0].id}&businessName=${data.business.slug}`);
          }}
        />
      )}
      {step === 2 && (
        <Step2Staff
          staff={data.business.staff}
          selectedStaffId={selectedStaffId}
          onSelect={setSelectedStaffId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3DateTime
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          slots={slots}
          loadingSlots={loadingSlots}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onBack={() => setStep(2)}
          onNext={() => selectedTime ? setStep(4) : toast.error('یک ساعت انتخاب کنید')}
        />
      )}
      {step === 4 && (
        <Step4Confirm
          services={selectedServices}
          staffName={selectedStaffId ? (data.business.staff.find((s) => s.id === selectedStaffId)?.name ?? 'هر متخصصی') : 'هر متخصصی'}
          date={selectedDate}
          time={selectedTime}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          onBack={() => setStep(3)}
          onConfirm={onConfirm}
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
        />
      )}
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between gap-2" dir="rtl">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${s.num < currentStep ? 'bg-emerald-500 text-white' : s.num === currentStep ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s.num < currentStep ? <Check className="h-4 w-4" /> : toPersianDigits(String(s.num))}
            </div>
            <span className={`hidden text-sm font-medium sm:inline ${s.num <= currentStep ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${s.num < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function Step1Services({ services, selected, onToggle, onNext }: {
  services: ServiceItem[];
  selected: ServiceItem[];
  onToggle: (s: ServiceItem) => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
      <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-800">انتخاب خدمات</h2>
        <p className="text-sm text-slate-500">می‌توانید یک یا چند خدمت را انتخاب کنید.</p>
        <div className="flex flex-col">
          {services.map((service) => {
            const isSelected = selected.some((s) => s.id === service.id);
            return (
              <article key={service.id} className="flex items-center justify-between gap-4 border-b border-slate-200 py-5" dir="rtl">
                <div className="min-w-0 flex-1 text-right">
                  <h3 className="text-base font-bold text-slate-800">{service.name}</h3>
                  <p className="mt-1.5 text-[13px] text-slate-500">مدت: {formatDuration(service.durationMin)}</p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold text-slate-800">{formatPrice(service.price)} تومان</p>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => onToggle(service)}
                  className={`shrink-0 gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold ${isSelected ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'}`}
                >
                  {isSelected ? <><Check className="h-4 w-4" /> انتخاب شد</> : 'انتخاب'}
                </Button>
              </article>
            );
          })}
          {services.length === 0 && <p className="py-8 text-center text-sm text-slate-400">خدماتی موجود نیست.</p>}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-500">
            {selected.length > 0 ? `${selected.length} خدمت انتخاب شده` : ''}
          </div>
          <Button onClick={onNext} className="gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">
            ادامه
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step2Staff({ staff, selectedStaffId, onSelect, onBack, onNext }: {
  staff: { id: number; name: string; role: string; photo: string | null }[];
  selectedStaffId: number | null;
  onSelect: (id: number | null) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-800">انتخاب متخصص</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => onSelect(null)}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-right transition-colors ${selectedStaffId === null ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
            dir="rtl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <Sparkles className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">هر متخصصی</span>
              <span className="text-xs text-slate-500">بدون اولویت</span>
            </div>
          </button>
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-right transition-colors ${selectedStaffId === member.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
              dir="rtl"
            >
              <Avatar className="h-14 w-14">
                {member.photo ? <AvatarImage src={member.photo} alt={member.name} className="object-cover" /> : null}
                <AvatarFallback className="bg-indigo-100 font-bold text-indigo-500">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{member.name}</span>
                <span className="text-xs text-slate-500">{member.role}</span>
              </div>
            </button>
          ))}
        </div>
        {staff.length === 0 && <p className="py-4 text-center text-sm text-slate-400">متخصصی برای این سالن ثبت نشده است.</p>}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button onClick={onBack} variant="outline" className="gap-1 rounded-lg border-slate-200 text-slate-700">
            <ChevronRight className="h-4 w-4" />
            بازگشت
          </Button>
          <Button onClick={onNext} className="gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">
            ادامه
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3DateTime({ selectedDate, onDateChange, slots, loadingSlots, selectedTime, onTimeSelect, onBack, onNext }: {
  selectedDate: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
  slots: string[];
  loadingSlots: boolean;
  selectedTime: string;
  onTimeSelect: (t: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const disabledDays = [{ before: new Date() }];

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-800">انتخاب تاریخ و ساعت</h2>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={disabledDays}
              dir="rtl"
              className="rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-700">ساعت‌های خالی</h3>
            {!selectedDate && <p className="py-8 text-center text-sm text-slate-400">ابتدا یک تاریخ را انتخاب کنید.</p>}
            {selectedDate && loadingSlots && (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
            )}
            {selectedDate && !loadingSlots && slots.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">برای این تاریخ زمان خالی وجود ندارد.</p>
            )}
            {selectedDate && !loadingSlots && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onTimeSelect(slot)}
                    className={`rounded-lg border-2 py-2.5 text-sm font-medium transition-colors ${selectedTime === slot ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                  >
                    {toPersianDigits(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button onClick={onBack} variant="outline" className="gap-1 rounded-lg border-slate-200 text-slate-700">
            <ChevronRight className="h-4 w-4" />
            بازگشت
          </Button>
          <Button onClick={onNext} className="gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">
            ادامه
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step4Confirm({ services, staffName, date, time, totalPrice, totalDuration, onBack, onConfirm, handleSubmit, register, errors }: {
  services: ServiceItem[];
  staffName: string;
  date: Date | undefined;
  time: string;
  totalPrice: number;
  totalDuration: number;
  onBack: () => void;
  onConfirm: (formValues: CustomerForm) => Promise<void>;
  handleSubmit: UseFormHandleSubmit<CustomerForm>;
  register: UseFormRegister<CustomerForm>;
  errors: FieldErrors<CustomerForm>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (formValues: CustomerForm) => {
    setSubmitting(true);
    await onConfirm(formValues);
    setSubmitting(false);
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-800">تأیید رزرو</h2>

        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-5" dir="rtl">
          <h3 className="text-sm font-bold text-slate-700">خلاصه رزرو</h3>
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{s.name}</span>
              <span className="font-semibold text-slate-800">{formatPrice(s.price)} تومان</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
            <span className="text-slate-500">مدت کل: {formatDuration(totalDuration)}</span>
            <span className="font-bold text-indigo-500">{formatPrice(totalPrice)} تومان</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">متخصص: {staffName}</span>
          </div>
          {date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">تاریخ: {toPersianDigits(format(date, 'yyyy-MM-dd'))}</span>
              <span className="text-slate-500">ساعت: {toPersianDigits(time)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="flex flex-col gap-4" dir="rtl">
          <h3 className="text-sm font-bold text-slate-700">اطلاعات تماس</h3>
          <div className="flex flex-col gap-2">
            <Label htmlFor="customer-name">نام و نام خانوادگی</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <Input id="customer-name" {...register('name')} placeholder="نام شما" />
            </div>
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="customer-phone">شماره تماس</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <Input id="customer-phone" {...register('phone')} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
            </div>
            {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" onClick={onBack} variant="outline" className="gap-1 rounded-lg border-slate-200 text-slate-700">
              <ChevronRight className="h-4 w-4" />
              بازگشت
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> در حال ثبت...</> : <><Check className="h-4 w-4" /> تأیید رزرو</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

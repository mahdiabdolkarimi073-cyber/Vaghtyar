'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Calendar, Scissors, Users, Clock, Store,
  Plus, CheckCircle2, XCircle, AlertCircle, TrendingUp, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api';
import {
  toPersianDigits, formatPrice, formatDuration, formatTime,
  DAY_NAMES_FA, formatDateShortFA
} from '@/lib/constants';
import type { Business, Service, Staff, BusinessHours, Booking } from '@/lib/types';

interface DashboardBusiness extends Business {
  services: Service[];
  staff: Staff[];
  hours: BusinessHours[];
  _count: { bookings: number; reviews: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      apiFetch<{ businesses: DashboardBusiness[]; recentBookings: Booking[] }>('/api/dashboard')
        .then((data) => {
          setBusinesses(data.businesses);
          setRecentBookings(data.recentBookings);
          if (data.businesses.length > 0) {
            setSelectedBiz(data.businesses[0].slug);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const currentBiz = businesses.find((b) => b.slug === selectedBiz);

  if (authLoading || (user && loading)) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-40 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Store className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">هنوز کسب‌وکاری ثبت نکرده‌اید</h1>
        <p className="text-text-muted mb-6">برای شروع، اولین کسب‌وکار خود را ثبت کنید.</p>
        <Link href="/register-business">
          <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
            <Plus className="w-5 h-5" /> ثبت کسب‌وکار
          </Button>
        </Link>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> تأیید شده</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 text-warning text-sm font-medium"><AlertCircle className="w-4 h-4" /> در انتظار</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 text-error text-sm font-medium"><XCircle className="w-4 h-4" /> لغو شده</span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1 text-blue-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> تکمیل شده</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">پنل مدیریت</h1>
        <span className="text-text-muted text-sm">— {user.name}</span>
      </div>

      {/* Business selector */}
      {businesses.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {businesses.map((b) => (
            <button
              key={b.slug}
              onClick={() => setSelectedBiz(b.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedBiz === b.slug ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-teal-400'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {currentBiz && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-muted">کل رزروها</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{toPersianDigits(currentBiz._count.bookings)}</p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-muted">خدمات</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{toPersianDigits(currentBiz.services.length)}</p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-muted">متخصصین</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{toPersianDigits(currentBiz.staff.length)}</p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-muted">نظرات</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{toPersianDigits(currentBiz._count.reviews)}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-surface border border-border rounded-xl p-1 w-full justify-start gap-1 h-auto overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-lg px-4 py-2 text-sm">نگاه کلی</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg px-4 py-2 text-sm">رزروها</TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg px-4 py-2 text-sm">خدمات</TabsTrigger>
              <TabsTrigger value="staff" className="rounded-lg px-4 py-2 text-sm">متخصصین</TabsTrigger>
              <TabsTrigger value="hours" className="rounded-lg px-4 py-2 text-sm">ساعات کاری</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-text-primary mb-4">آخرین رزروها</h3>
                  <div className="space-y-3">
                    {recentBookings.filter((b) => b.businessId === currentBiz.id).slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                        <div>
                          <p className="font-medium text-text-primary text-sm">{booking.customerName}</p>
                          <p className="text-xs text-text-muted">{booking.service?.name || '—'}</p>
                        </div>
                        <div className="text-left">
                          {statusBadge(booking.status)}
                          <p className="text-xs text-text-muted mt-1">{formatDateShortFA(new Date(booking.date))} - {formatTime(booking.startTime)}</p>
                        </div>
                      </div>
                    ))}
                    {recentBookings.filter((b) => b.businessId === currentBiz.id).length === 0 && (
                      <p className="text-text-muted text-sm text-center py-4">رزروی وجود ندارد.</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-text-primary mb-4">اطلاعات کسب‌وکار</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-text-muted">نام</span><span className="font-medium text-text-primary">{currentBiz.name}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">دسته‌بندی</span><span className="font-medium text-text-primary">{currentBiz.category}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">شهر</span><span className="font-medium text-text-primary">{currentBiz.city}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">تأیید شده</span><span className="font-medium text-text-primary">{currentBiz.isVerified ? 'بله' : 'خیر'}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">تأیید خودکار</span><span className="font-medium text-text-primary">{currentBiz.autoConfirm ? 'بله' : 'خیر'}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">ویژه</span><span className="font-medium text-text-primary">{currentBiz.isFeatured ? 'بله' : 'خیر'}</span></div>
                  </div>
                  <Link href={`/salon/${currentBiz.slug}`} className="mt-4 block">
                    <Button variant="outline" className="w-full">مشاهده صفحه کسب‌وکار</Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            {/* Bookings */}
            <TabsContent value="bookings" className="mt-4">
              <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                {recentBookings.filter((b) => b.businessId === currentBiz.id).length === 0 ? (
                  <div className="p-8 text-center text-text-muted">رزروی وجود ندارد.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-text-muted">
                        <tr>
                          <th className="text-right p-4 font-medium">مشتری</th>
                          <th className="text-right p-4 font-medium">خدمت</th>
                          <th className="text-right p-4 font-medium">تاریخ</th>
                          <th className="text-right p-4 font-medium">ساعت</th>
                          <th className="text-right p-4 font-medium">کد پیگیری</th>
                          <th className="text-right p-4 font-medium">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.filter((b) => b.businessId === currentBiz.id).map((booking) => (
                          <tr key={booking.id} className="border-t border-border">
                            <td className="p-4">
                              <p className="font-medium text-text-primary">{booking.customerName}</p>
                              <p className="text-xs text-text-muted" dir="ltr">{toPersianDigits(booking.customerPhone)}</p>
                            </td>
                            <td className="p-4 text-text-secondary">{booking.service?.name || '—'}</td>
                            <td className="p-4 text-text-secondary">{formatDateShortFA(new Date(booking.date))}</td>
                            <td className="p-4 text-text-secondary">{formatTime(booking.startTime)}</td>
                            <td className="p-4"><span className="font-mono text-primary" dir="ltr">{booking.confirmationCode}</span></td>
                            <td className="p-4">{statusBadge(booking.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Services management */}
            <TabsContent value="services" className="mt-4">
              <ServicesManager businessSlug={currentBiz.slug} services={currentBiz.services} />
            </TabsContent>

            {/* Staff management */}
            <TabsContent value="staff" className="mt-4">
              <StaffManager businessSlug={currentBiz.slug} staff={currentBiz.staff} />
            </TabsContent>

            {/* Hours management */}
            <TabsContent value="hours" className="mt-4">
              <HoursManager businessSlug={currentBiz.slug} hours={currentBiz.hours} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function ServicesManager({ businessSlug, services: initialServices }: { businessSlug: string; services: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', durationMinutes: '30', price: '', description: '' });
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    if (!form.name || !form.price) {
      setError('نام و قیمت الزامی است');
      return;
    }
    try {
      const data = await apiFetch<{ service: Service }>(`/api/businesses/${businessSlug}/services`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setServices([...services, data.service]);
      setForm({ name: '', durationMinutes: '30', price: '', description: '' });
      setShowForm(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">مدیریت خدمات</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary-dark text-white gap-1">
          <Plus className="w-4 h-4" /> افزودن خدمت
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام خدمت" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="قیمت (تومان)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-surface">
              <option value="15">۱۵ دقیقه</option>
              <option value="30">۳۰ دقیقه</option>
              <option value="45">۴۵ دقیقه</option>
              <option value="60">۱ ساعت</option>
              <option value="90">۱.۵ ساعت</option>
              <option value="120">۲ ساعت</option>
            </select>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات (اختیاری)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-primary-dark text-white">ذخیره</Button>
        </div>
      )}

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
            <div>
              <h4 className="font-medium text-text-primary">{s.name}</h4>
              {s.description && <p className="text-xs text-text-muted">{s.description}</p>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary font-bold text-sm">{formatPrice(s.price)}</span>
              <span className="text-text-muted text-sm">{formatDuration(s.durationMinutes)}</span>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-text-muted text-sm text-center py-4">خدمتی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

function StaffManager({ businessSlug, staff: initialStaff }: { businessSlug: string; staff: Staff[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', specialty: '', photo: '' });
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    if (!form.name) {
      setError('نام الزامی است');
      return;
    }
    try {
      const data = await apiFetch<{ staff: Staff }>(`/api/businesses/${businessSlug}/staff`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStaff([...staff, data.staff]);
      setForm({ name: '', specialty: '', photo: '' });
      setShowForm(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">مدیریت متخصصین</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary-dark text-white gap-1">
          <Plus className="w-4 h-4" /> افزودن متخصص
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted rounded-xl p-4 mb-4 space-y-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام متخصص" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="تخصص (اختیاری)" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          {error && <p className="text-error text-sm">{error}</p>}
          <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-primary-dark text-white">ذخیره</Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-muted rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary-light" />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">{s.name}</h4>
              {s.specialty && <p className="text-sm text-text-muted">{s.specialty}</p>}
            </div>
          </div>
        ))}
        {staff.length === 0 && <p className="text-text-muted text-sm col-span-full text-center py-4">متخصصی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

function HoursManager({ businessSlug, hours: initialHours }: { businessSlug: string; hours: BusinessHours[] }) {
  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateHour = (idx: number, field: keyof BusinessHours, value: string | boolean) => {
    const updated = [...hours];
    updated[idx] = { ...updated[idx], [field]: value };
    setHours(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/businesses/${businessSlug}/hours`, {
        method: 'PUT',
        body: JSON.stringify({
          hours: hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        }),
      });
      setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">ساعات کاری</h3>
        <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-dark text-white gap-1">
          {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
        </Button>
      </div>

      <div className="space-y-3">
        {hours.map((h, idx) => (
          <div key={h.id} className="flex items-center gap-4 border-b border-border pb-3 last:border-0">
            <span className="font-medium text-text-secondary w-24">{DAY_NAMES_FA[h.dayOfWeek]}</span>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={h.isClosed}
                onChange={(e) => updateHour(idx, 'isClosed', e.target.checked)}
                className="w-4 h-4 rounded accent-teal-600"
              />
              تعطیر
            </label>
            {!h.isClosed && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={h.openTime}
                  onChange={(e) => updateHour(idx, 'openTime', e.target.value)}
                  className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  dir="ltr"
                />
                <span className="text-text-muted">تا</span>
                <input
                  type="time"
                  value={h.closeTime}
                  onChange={(e) => updateHour(idx, 'closeTime', e.target.value)}
                  className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  dir="ltr"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

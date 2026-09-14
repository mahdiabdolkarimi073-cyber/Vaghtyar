'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Building2, Calendar, MessageSquare, Link2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';

type Tab = 'info' | 'booking' | 'sms' | 'link';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [businessSlug, setBusinessSlug] = useState('');

  const [info, setInfo] = useState({ name: '', address: '', phone: '', description: '', neighborhood: '', category: '', city: '' });
  const [booking, setBooking] = useState({ autoApprove: false, minAdvanceHours: 1, maxAdvanceDays: 30, allowCustomerCancel: true, reminderHoursBefore: 24 });
  const [sms, setSms] = useState({ confirmationSmsTemplate: '', reminderSmsTemplate: '' });

  const fetchSettings = useCallback(async () => {
    try {
      const [i, b, s, me] = await Promise.all([
        businessFetch<typeof info>('/api/business/settings'),
        businessFetch<typeof booking>('/api/business/settings/booking'),
        businessFetch<typeof sms>('/api/business/settings/sms'),
        businessFetch<{ business: { slug: string } }>('/api/business/auth/me'),
      ]);
      setInfo(i);
      setBooking(b);
      setSms(s);
      setBusinessSlug(me.business.slug);
    } catch { toast.error('خطا'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveInfo = async () => {
    setSaving(true);
    try { await businessFetch('/api/business/settings', { method: 'PUT', body: JSON.stringify(info) }); toast.success('ذخیره شد'); }
    catch { toast.error('خطا'); } finally { setSaving(false); }
  };

  const saveBooking = async () => {
    setSaving(true);
    try { await businessFetch('/api/business/settings/booking', { method: 'PUT', body: JSON.stringify(booking) }); toast.success('ذخیره شد'); }
    catch { toast.error('خطا'); } finally { setSaving(false); }
  };

  const saveSms = async () => {
    setSaving(true);
    try { await businessFetch('/api/business/settings/sms', { method: 'PUT', body: JSON.stringify(sms) }); toast.success('ذخیره شد'); }
    catch { toast.error('خطا'); } finally { setSaving(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${businessSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="glass h-96 rounded-2xl glass-shimmer" />;

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'info', label: 'اطلاعات کسب‌وکار', icon: Building2 },
    { id: 'booking', label: 'تنظیمات رزرو', icon: Calendar },
    { id: 'sms', label: 'قالب پیامک', icon: MessageSquare },
    { id: 'link', label: 'لینک اشتراک', icon: Link2 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primary-custom">تنظیمات</h2>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'gradient-primary text-white' : 'glass text-secondary-custom hover:text-primary-custom'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <GlassCard className="p-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-secondary-custom mb-1.5">نام کسب‌وکار</label><input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm text-secondary-custom mb-1.5">دسته‌بندی</label><input value={info.category} onChange={e => setInfo({ ...info, category: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm text-secondary-custom mb-1.5">تلفن</label><input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm text-secondary-custom mb-1.5">محله</label><input value={info.neighborhood} onChange={e => setInfo({ ...info, neighborhood: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
          </div>
          <div><label className="block text-sm text-secondary-custom mb-1.5">آدرس</label><textarea value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={2} /></div>
          <div><label className="block text-sm text-secondary-custom mb-1.5">توضیحات</label><textarea value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={3} /></div>
          <div className="flex justify-end"><GradientButton onClick={saveInfo} loading={saving} size="md">ذخیره</GradientButton></div>
        </GlassCard>
      )}

      {tab === 'booking' && (
        <GlassCard className="p-5 space-y-4 animate-fade-in">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div><div className="text-sm text-primary-custom">تایید خودکار نوبت‌ها</div><div className="text-xs text-secondary-custom">نوبت‌ها بدون نیاز به تایید دستی فعال می‌شوند</div></div>
            <button onClick={() => setBooking({ ...booking, autoApprove: !booking.autoApprove })} className={`relative w-10 h-6 rounded-full transition-colors ${booking.autoApprove ? 'bg-emerald-500' : 'bg-white/10'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${booking.autoApprove ? 'left-0.5' : 'right-0.5'}`} /></button>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-secondary-custom mb-1.5">حداقل زمان رزرو قبل از نوبت (ساعت)</label><input type="number" value={booking.minAdvanceHours} onChange={e => setBooking({ ...booking, minAdvanceHours: parseInt(e.target.value) || 0 })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
            <div><label className="block text-sm text-secondary-custom mb-1.5">حداکثر زمان رزرو قبل از نوبت (روز)</label><input type="number" value={booking.maxAdvanceDays} onChange={e => setBooking({ ...booking, maxAdvanceDays: parseInt(e.target.value) || 0 })} className="glass-input w-full px-4 py-2.5 text-sm" /></div>
          </div>
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div><div className="text-sm text-primary-custom">اجازه لغو نوبت به مشتری</div></div>
            <button onClick={() => setBooking({ ...booking, allowCustomerCancel: !booking.allowCustomerCancel })} className={`relative w-10 h-6 rounded-full transition-colors ${booking.allowCustomerCancel ? 'bg-emerald-500' : 'bg-white/10'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${booking.allowCustomerCancel ? 'left-0.5' : 'right-0.5'}`} /></button>
          </label>
          <div>
            <label className="block text-sm text-secondary-custom mb-1.5">زمان ارسال یادآور (ساعت قبل از نوبت)</label>
            <select value={booking.reminderHoursBefore} onChange={e => setBooking({ ...booking, reminderHoursBefore: parseInt(e.target.value) })} className="glass-input w-full px-4 py-2.5 text-sm">
              {[1, 2, 4, 12, 24, 48].map(h => <option key={h} value={h} className="bg-gray-900">{h} ساعت</option>)}
            </select>
          </div>
          <div className="flex justify-end"><GradientButton onClick={saveBooking} loading={saving} size="md">ذخیره</GradientButton></div>
        </GlassCard>
      )}

      {tab === 'sms' && (
        <GlassCard className="p-5 space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm text-secondary-custom mb-1.5">قالب پیامک تایید</label>
            <textarea value={sms.confirmationSmsTemplate} onChange={e => setSms({ ...sms, confirmationSmsTemplate: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={3} placeholder="کاربر {customer_name} عزیز، نوبت شما برای {service} در تاریخ {date} ساعت {time} تایید شد. {business_name}" />
            <p className="text-xs text-tertiary-custom mt-1">متغیرها: {'{customer_name}, {date}, {time}, {service}, {business_name}'}</p>
          </div>
          <div>
            <label className="block text-sm text-secondary-custom mb-1.5">قالب پیامک یادآور</label>
            <textarea value={sms.reminderSmsTemplate} onChange={e => setSms({ ...sms, reminderSmsTemplate: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm resize-none" rows={3} placeholder="یادآوری: {customer_name} عزیز، نوبت شما برای {service} فردا ساعت {time} در {business_name}." />
          </div>
          <div className="flex justify-end"><GradientButton onClick={saveSms} loading={saving} size="md">ذخیره</GradientButton></div>
        </GlassCard>
      )}

      {tab === 'link' && (
        <GlassCard className="p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-primary-custom">لینک رزرو کسب‌وکار شما</h3>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
            <code className="flex-1 text-sm text-primary-custom truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/book/{businessSlug}</code>
            <button onClick={copyLink} className="p-2 rounded-lg glass hover:bg-white/8 text-secondary-custom hover:text-primary-custom">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-secondary-custom">این لینک را با مشتریان خود به اشتراک بگذارید تا مستقیما نوبت رزرو کنند.</p>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${typeof window !== 'undefined' ? encodeURIComponent(`نوبت‌یار: ${window.location.origin}/book/${businessSlug}`) : ''}`} target="_blank" rel="noopener" className="px-4 py-2 rounded-xl glass text-sm text-primary-custom hover:bg-white/8">واتساپ</a>
            <a href={`https://t.me/share/url?url=${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/book/${businessSlug}`) : ''}`} target="_blank" rel="noopener" className="px-4 py-2 rounded-xl glass text-sm text-primary-custom hover:bg-white/8">تلگرام</a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

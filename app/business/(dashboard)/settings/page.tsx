'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, Calendar, MessageSquare, Link2, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import GradientButton from '@/components/ui/GradientButton';
import { businessFetch } from '@/lib/business-api';
import { useSiteSettings } from '@/hooks/use-site-settings';

type Tab = 'info' | 'booking' | 'sms' | 'link';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [businessSlug, setBusinessSlug] = useState('');
  const { settings } = useSiteSettings();

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

  if (loading) return <div className="bg-surface border border-border rounded-2xl h-96 glass-shimmer" />;

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'info', label: 'اطلاعات کسب‌وکار', icon: Building2 },
    { id: 'booking', label: 'تنظیمات رزرو', icon: Calendar },
    { id: 'sms', label: 'قالب پیامک', icon: MessageSquare },
    { id: 'link', label: 'لینک اشتراک', icon: Link2 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">تنظیمات</h2>
        <p className="text-sm text-text-secondary mt-0.5">مدیریت اطلاعات و تنظیمات کسب‌وکار</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'gradient-primary text-white shadow-soft' : 'bg-surface border border-border text-text-secondary hover:bg-muted'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6 shadow-card space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">نام کسب‌وکار</label>
              <input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">دسته‌بندی</label>
              <input value={info.category} onChange={e => setInfo({ ...info, category: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">تلفن</label>
              <input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">محله</label>
              <input value={info.neighborhood} onChange={e => setInfo({ ...info, neighborhood: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">آدرس</label>
            <textarea value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm resize-none" rows={2} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">توضیحات</label>
            <textarea value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm resize-none" rows={3} />
          </div>
          <div className="flex justify-end"><GradientButton onClick={saveInfo} loading={saving} size="md">ذخیره</GradientButton></div>
        </div>
      )}

      {tab === 'booking' && (
        <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6 shadow-card space-y-4 animate-fade-in">
          <label className="flex items-center justify-between p-4 rounded-xl bg-muted/30 cursor-pointer">
            <div><div className="text-sm font-medium text-text-primary">تایید خودکار نوبت‌ها</div><div className="text-xs text-text-secondary mt-0.5">نوبت‌ها بدون نیاز به تایید دستی فعال می‌شوند</div></div>
            <button onClick={() => setBooking({ ...booking, autoApprove: !booking.autoApprove })} className={`premium-toggle shrink-0 ${booking.autoApprove ? 'bg-secondary' : 'bg-muted'}`}>
              <span className={`premium-toggle-knob ${booking.autoApprove ? 'left-0.5' : 'right-0.5'}`} />
            </button>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">حداقل زمان رزرو قبل از نوبت (ساعت)</label>
              <input type="number" value={booking.minAdvanceHours} onChange={e => setBooking({ ...booking, minAdvanceHours: parseInt(e.target.value) || 0 })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">حداکثر زمان رزرو قبل از نوبت (روز)</label>
              <input type="number" value={booking.maxAdvanceDays} onChange={e => setBooking({ ...booking, maxAdvanceDays: parseInt(e.target.value) || 0 })} className="premium-input w-full px-4 py-2.5 text-sm" />
            </div>
          </div>
          <label className="flex items-center justify-between p-4 rounded-xl bg-muted/30 cursor-pointer">
            <div><div className="text-sm font-medium text-text-primary">اجازه لغو نوبت به مشتری</div></div>
            <button onClick={() => setBooking({ ...booking, allowCustomerCancel: !booking.allowCustomerCancel })} className={`premium-toggle shrink-0 ${booking.allowCustomerCancel ? 'bg-secondary' : 'bg-muted'}`}>
              <span className={`premium-toggle-knob ${booking.allowCustomerCancel ? 'left-0.5' : 'right-0.5'}`} />
            </button>
          </label>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">زمان ارسال یادآور (ساعت قبل از نوبت)</label>
            <select value={booking.reminderHoursBefore} onChange={e => setBooking({ ...booking, reminderHoursBefore: parseInt(e.target.value) })} className="premium-input w-full px-4 py-2.5 text-sm">
              {[1, 2, 4, 12, 24, 48].map(h => <option key={h} value={h} className="bg-surface">{h} ساعت</option>)}
            </select>
          </div>
          <div className="flex justify-end"><GradientButton onClick={saveBooking} loading={saving} size="md">ذخیره</GradientButton></div>
        </div>
      )}

      {tab === 'sms' && (
        <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6 shadow-card space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">قالب پیامک تایید</label>
            <textarea value={sms.confirmationSmsTemplate} onChange={e => setSms({ ...sms, confirmationSmsTemplate: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm resize-none" rows={3} placeholder="کاربر {customer_name} عزیز، نوبت شما برای {service} در تاریخ {date} ساعت {time} تایید شد. {business_name}" />
            <p className="text-xs text-text-muted mt-1">متغیرها: {'{customer_name}, {date}, {time}, {service}, {business_name}'}</p>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">قالب پیامک یادآور</label>
            <textarea value={sms.reminderSmsTemplate} onChange={e => setSms({ ...sms, reminderSmsTemplate: e.target.value })} className="premium-input w-full px-4 py-2.5 text-sm resize-none" rows={3} placeholder="یادآوری: {customer_name} عزیز، نوبت شما برای {service} فردا ساعت {time} در {business_name}." />
          </div>
          <div className="flex justify-end"><GradientButton onClick={saveSms} loading={saving} size="md">ذخیره</GradientButton></div>
        </div>
      )}

      {tab === 'link' && (
        <div className="bg-surface border border-border rounded-2xl p-5 lg:p-6 shadow-card space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-1">لینک رزرو کسب‌وکار شما</h3>
            <p className="text-xs text-text-secondary mb-3">این لینک را با مشتریان خود به اشتراک بگذارید تا مستقیما نوبت رزرو کنند</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
            <code className="flex-1 text-sm text-text-primary truncate ltr-text">{typeof window !== 'undefined' ? window.location.origin : ''}/book/{businessSlug}</code>
            <button onClick={copyLink} className="p-2 rounded-lg bg-surface border border-border hover:bg-muted text-text-secondary hover:text-primary transition-colors shrink-0">
              {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${typeof window !== 'undefined' ? encodeURIComponent(`${settings.site_name}: ${window.location.origin}/book/${businessSlug}`) : ''}`} target="_blank" rel="noopener" className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary hover:bg-muted text-center transition-colors">واتساپ</a>
            <a href={`https://t.me/share/url?url=${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/book/${businessSlug}`) : ''}`} target="_blank" rel="noopener" className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary hover:bg-muted text-center transition-colors">تلگرام</a>
          </div>
        </div>
      )}
    </div>
  );
}

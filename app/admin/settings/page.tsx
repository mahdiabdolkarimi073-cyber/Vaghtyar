'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Upload, X } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const d = await res.json();
      setSettings(d);
    } catch { setSettings({}); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (keys: string[]) => {
    setSaving(true);
    const payload: Record<string, string> = {};
    keys.forEach(k => { if (settings[k] !== undefined) payload[k] = settings[k]; });
    try {
      await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      toast.success('تنظیمات ذخیره شد');
    } catch { toast.error('خطا'); }
    finally { setSaving(false); }
  };

  const input = (key: string, label: string, type = 'text') => (
    <div>
      <label className="text-sm text-text-secondary mb-1 block">{label}</label>
      <input
        type={type} value={settings[key] || ''} onChange={e => setSettings({...settings, [key]: e.target.value})}
        className="admin-input w-full h-10 px-4 text-sm" dir={type === 'text' ? 'rtl' : 'ltr'}
      />
    </div>
  );

  if (loading) return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="تنظیمات" />
        <div className="p-4 lg:p-6"><div className="admin-card h-96 admin-skeleton rounded-2xl" /></div>
      </div>
    </>
  );

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="تنظیمات سیستم" />
        <div className="p-4 lg:p-6 max-w-3xl mx-auto">
          <Tabs defaultValue="general">
            <TabsList className="bg-surface border border-border rounded-xl p-1 flex flex-wrap overflow-x-auto scrollbar-thin">
              <TabsTrigger value="general" className="rounded-lg whitespace-nowrap shrink-0">عمومی</TabsTrigger>
              <TabsTrigger value="booking" className="rounded-lg whitespace-nowrap shrink-0">هزینه رزرو</TabsTrigger>
              <TabsTrigger value="payment" className="rounded-lg whitespace-nowrap shrink-0">درگاه پرداخت</TabsTrigger>
              <TabsTrigger value="sms" className="rounded-lg whitespace-nowrap shrink-0">پیامک</TabsTrigger>
              <TabsTrigger value="terms" className="rounded-lg whitespace-nowrap shrink-0">قوانین</TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg whitespace-nowrap shrink-0">تماس</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">تنظیمات عمومی</h3>
                {input('site_name', 'نام سایت')}
                {input('site_tagline', 'شعار سایت')}
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">لوگوی سایت</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                      {settings.site_logo ? (
                        <img src={settings.site_logo} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">ن</span>
                      )}
                    </div>
                    {settings.site_logo ? (
                      <button
                        onClick={() => setSettings({ ...settings, site_logo: '' })}
                        className="text-error hover:bg-error/10 p-2 rounded-lg flex items-center gap-1 text-sm"
                      >
                        <X className="w-4 h-4" /> حذف لوگو
                      </button>
                    ) : (
                      <label className="admin-input px-3 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" /> آپلود لوگو
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = () => setSettings((prev) => ({ ...prev, site_logo: reader.result as string }));
                            reader.readAsDataURL(f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1">تصویر لوگو در سراسر سایت جایگزین آیکون پیش‌فرض می‌شود</p>
                </div>
                <button onClick={() => save(['site_name', 'site_tagline', 'site_logo'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>

            <TabsContent value="booking">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">هزینه رزرو نوبت</h3>
                <p className="text-xs text-text-muted">این مبلغ به قیمت هر خدمت اضافه می‌شود و مشتری هنگام رزرو آن را پرداخت می‌کند. برای غیرفعال‌سازی، عدد ۰ را وارد کنید.</p>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">مبلغ هزینه رزرو (تومان)</label>
                  <input
                    type="number"
                    value={settings.booking_fee || '0'}
                    onChange={e => setSettings({...settings, booking_fee: e.target.value})}
                    className="admin-input w-full h-10 px-4 text-sm"
                    min="0"
                    placeholder="مثال: 5000"
                  />
                </div>
                {Number(settings.booking_fee) > 0 && (
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 text-sm text-text-secondary">
                    با فعال بودن این هزینه، هر نوبت با مبلغ اضافی <span className="font-bold text-primary">{Number(settings.booking_fee).toLocaleString('fa-IR')}</span> تومان برای مشتری محاسبه می‌شود.
                  </div>
                )}
                <button onClick={() => save(['booking_fee'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">درگاه پرداخت</h3>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">ارائه‌دهنده</label>
                  <select value={settings.payment_provider || ''} onChange={e => setSettings({...settings, payment_provider: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                    <option value="zarinpal">زرین‌پال</option>
                    <option value="idpay">آیدی‌پی</option>
                    <option value="nextpay">نکست‌پی</option>
                  </select>
                </div>
                {input('payment_merchant_id', 'کد پذیرنده', 'text')}
                {input('payment_api_key', 'کلید API', 'password')}
                <button onClick={() => save(['payment_provider', 'payment_merchant_id', 'payment_api_key'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>

            <TabsContent value="sms">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">سرویس پیامک</h3>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">ارائه‌دهنده</label>
                  <select value={settings.sms_provider || ''} onChange={e => setSettings({...settings, sms_provider: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                    <option value="kavenegar">کاوه‌نگار</option>
                    <option value="farapayamak">فراپیامک</option>
                    <option value="melipayamak">ملی‌پیامک</option>
                  </select>
                </div>
                {input('sms_api_key', 'کلید API', 'password')}
                {input('sms_sender_number', 'شماره ارسال‌کننده', 'text')}
                <button onClick={() => save(['sms_provider', 'sms_api_key', 'sms_sender_number'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>

            <TabsContent value="terms">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">قوانین و مقررات</h3>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">متن قوانین</label>
                  <textarea value={settings.terms_text || ''} onChange={e => setSettings({...settings, terms_text: e.target.value})} className="admin-input w-full p-3 text-sm" rows={10} />
                </div>
                <button onClick={() => save(['terms_text'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="admin-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">اطلاعات تماس</h3>
                {input('contact_phone', 'تلفن', 'text')}
                {input('contact_email', 'ایمیل', 'email')}
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">آدرس</label>
                  <textarea value={settings.contact_address || ''} onChange={e => setSettings({...settings, contact_address: e.target.value})} className="admin-input w-full p-3 text-sm" rows={3} />
                </div>
                <button onClick={() => save(['contact_phone', 'contact_email', 'contact_address'])} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> ذخیره
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

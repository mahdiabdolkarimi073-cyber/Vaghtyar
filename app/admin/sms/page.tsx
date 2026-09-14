'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, CheckCircle, XCircle, Send } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { toPersianDigits, formatDateShortFA } from '@/lib/constants';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusVariantMap: Record<string, 'success' | 'danger' | 'warning'> = {
  SENT: 'success', FAILED: 'danger', PENDING: 'warning',
};
const statusLabelMap: Record<string, string> = {
  SENT: 'ارسال شد', FAILED: 'ناموفق', PENDING: 'در انتظار',
};

export default function AdminSmsPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSent: 0, successful: 0, failed: 0, creditBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [smsRes, statsRes, setRes] = await Promise.all([
        fetch('/api/admin/sms'), fetch('/api/admin/sms/stats'), fetch('/api/admin/sms/settings'),
      ]);
      const smsData = await smsRes.json();
      const statsData = await statsRes.json();
      const setData2 = await setRes.json();
      setData(smsData.data || []);
      setStats(statsData);
      setSettings(setData2);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/sms/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      toast.success('تنظیمات ذخیره شد');
    } catch { toast.error('خطا'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <AdminSidebar />
      <div className="lg:mr-64 min-h-screen">
        <AdminHeader title="مدیریت پیامک‌ها" />
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="کل ارسال‌ها" value={stats.totalSent} icon={<MessageSquare className="w-5 h-5" />} gradient="violet" isLoading={loading} />
            <StatsCard title="موفق" value={stats.successful} icon={<CheckCircle className="w-5 h-5" />} gradient="emerald" isLoading={loading} />
            <StatsCard title="ناموفق" value={stats.failed} icon={<XCircle className="w-5 h-5" />} gradient="rose" isLoading={loading} />
            <StatsCard title="اعتبار" value={toPersianDigits(stats.creditBalance)} icon={<Send className="w-5 h-5" />} gradient="sky" isLoading={loading} />
          </div>

          <Tabs defaultValue="logs">
            <TabsList className="bg-surface border border-border rounded-xl p-1">
              <TabsTrigger value="logs" className="rounded-lg">گزارش پیامک‌ها</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">تنظیمات</TabsTrigger>
            </TabsList>

            <TabsContent value="logs">
              <DataTable
                columns={[
                  { key: 'phone', header: 'گیرنده', render: r => <span dir="ltr">{r.phone}</span> },
                  { key: 'message', header: 'پیام', render: r => <span className="text-xs text-text-muted max-w-xs block truncate">{r.message}</span> },
                  { key: 'status', header: 'وضعیت', render: r => <StatusBadge variant={statusVariantMap[r.status] || 'neutral'}>{statusLabelMap[r.status] || r.status}</StatusBadge> },
                  { key: 'type', header: 'نوع', render: r => r.type || '-' },
                  { key: 'sentAt', header: 'تاریخ', render: r => <span className="text-xs text-text-muted">{formatDateShortFA(new Date(r.sentAt))}</span> },
                ]}
                data={data}
                isLoading={loading}
                emptyMessage="پیامکی ارسال نشده است"
              />
            </TabsContent>

            <TabsContent value="settings">
              <div className="admin-card p-6 max-w-xl space-y-4">
                <h3 className="text-sm font-bold text-text-secondary">تنظیمات سرویس پیامک</h3>
                <div><label className="text-sm text-text-secondary mb-1 block">ارائه‌دهنده</label>
                  <select value={settings.sms_provider || ''} onChange={e => setSettings({...settings, sms_provider: e.target.value})} className="admin-input w-full h-10 px-4 text-sm">
                    <option value="kavenegar">کاوه‌نگار</option>
                    <option value="farapayamak">فراپیامک</option>
                    <option value="melipayamak">ملی‌پیامک</option>
                  </select>
                </div>
                <div><label className="text-sm text-text-secondary mb-1 block">کلید API</label><input value={settings.sms_api_key || ''} onChange={e => setSettings({...settings, sms_api_key: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" type="password" /></div>
                <div><label className="text-sm text-text-secondary mb-1 block">شماره ارسال‌کننده</label><input value={settings.sms_sender_number || ''} onChange={e => setSettings({...settings, sms_sender_number: e.target.value})} className="admin-input w-full h-10 px-4 text-sm" dir="ltr" /></div>
                <button onClick={saveSettings} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
              </div>

              <div className="admin-card p-6 max-w-xl space-y-4 mt-4">
                <h3 className="text-sm font-bold text-text-secondary">قالب‌های پیامک</h3>
                <div><label className="text-sm text-text-secondary mb-1 block">قالب تایید نوبت</label><textarea value={settings.sms_template_appointment || ''} onChange={e => setSettings({...settings, sms_template_appointment: e.target.value})} className="admin-input w-full p-3 text-sm" rows={2} /></div>
                <div><label className="text-sm text-text-secondary mb-1 block">قالب یادآوری</label><textarea value={settings.sms_template_reminder || ''} onChange={e => setSettings({...settings, sms_template_reminder: e.target.value})} className="admin-input w-full p-3 text-sm" rows={2} /></div>
                <div><label className="text-sm text-text-secondary mb-1 block">قالب تایید</label><textarea value={settings.sms_template_confirmation || ''} onChange={e => setSettings({...settings, sms_template_confirmation: e.target.value})} className="admin-input w-full p-3 text-sm" rows={2} /></div>
                <button onClick={saveSettings} disabled={saving} className="admin-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving ? 'در حال ذخیره...' : 'ذخیره قالب‌ها'}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

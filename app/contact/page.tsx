'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/lib/constants';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setSent(true);
    setForm({ name: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-3">تماس با ما</h1>
        <p className="text-text-muted">سوال یا پیشنهادی دارید؟ خوشحال می‌شویم بشنویم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface rounded-2xl border border-border p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">تلفن پشتیبانی</h3>
          <p className="text-text-muted text-sm" dir="ltr">{toPersianDigits('034-3220-0000')}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">ایمیل</h3>
          <p className="text-text-muted text-sm" dir="ltr">info@nobetyar.ir</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">آدرس</h3>
          <p className="text-text-muted text-sm">کرمان، خیابان مدرس</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-primary">فرم تماس</h2>
        </div>

        {sent ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-3" />
            <p className="text-text-secondary">پیام شما ارسال شد. به‌زودی پاسخ می‌دهیم.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">نام و نام خانوادگی</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="نام شما"
                className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">شماره موبایل</label>
              <input
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09XXXXXXXXX"
                className="w-full h-12 rounded-xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary text-right"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">پیام شما</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                placeholder="پیام خود را بنویسید..."
                className="w-full rounded-xl border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || !form.phone || !form.message}
              className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl gap-2"
            >
              <Send className="w-4 h-4" /> ارسال پیام
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

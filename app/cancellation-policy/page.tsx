import type { Metadata } from 'next';
import { Clock, AlertCircle, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export const metadata: Metadata = {
  title: 'سیاست لغو نوبت',
  description: 'قوانین لغو و تغییر نوبت در پلتفرم نوبت‌یار. مدت زمان مجاز برای لغو، نحوه لغو و موارد خاص.',
  alternates: { canonical: `${SITE_URL}/cancellation-policy` },
  openGraph: {
    title: 'سیاست لغو نوبت | نوبت‌یار',
    description: 'قوانین لغو و تغییر نوبت در پلتفرم نوبت‌یار.',
    url: `${SITE_URL}/cancellation-policy`,
  },
};

const SECTIONS = [
  {
    icon: Clock,
    title: 'مدت زمان مجاز برای لغو',
    body: 'لغو نوبت باید حداقل ۲ ساعت قبل از زمان نوبت انجام شود. لغو‌های دیرهنگام (کمتر از ۲ ساعت قبل) ممکن است منجر به محدود شدن رزروهای بعدی شما شود. این قانون به کسب‌وکارها اجازه می‌دهد زمان آزادشده را به مشتریان دیگر اختصاص دهند.',
  },
  {
    icon: Calendar,
    title: 'نحوه لغو نوبت',
    body: 'برای لغو نوبت، به صفحه پیگیری نوبت مراجعه کنید و کد پیگیری که پس از رزرو دریافت کرده‌اید را وارد کنید. سپس روی دکمه «لغو نوبت» کلیک کنید. پس از لغو، پیام تأیید برای شما ارسال می‌شود.',
  },
  {
    icon: AlertCircle,
    title: 'لغو توسط کسب‌وکار',
    body: 'در موارد نادر، کسب‌وکار ممکن است مجبور به لغو نوبت شود (شرایط اضطراری، تعطیلی ناگهانی). در این صورت، نوبت‌یار در اسرع وقت شما را مطلع می‌کند و می‌توانید نوبت جدیدی رزرو کنید. هیچ هزینه‌ای از شما دریافت نمی‌شود.',
  },
  {
    icon: XCircle,
    title: 'عدم حضور بدون اطلاع (No-Show)',
    body: 'اگر بدون لغو قبلی در زمان نوبت حاضر نشوید، این موضوع در پروفایل شما ثبت می‌شود. تکرار عدم حضور ممکن است منجر به محدود شدن موقت رزرو در آن کسب‌وکار شود. کسب‌وکارها حق دارند نوبت‌های لغو‌نشده را پس از ۱۵ دقیقه انتظار به دیگران بدهند.',
  },
  {
    icon: CheckCircle2,
    title: 'تغییر زمان نوبت',
    body: 'در حال حاضر برای تغییر زمان نوبت، باید نوبت فعلی را لغو کنید و نوبت جدیدی رزرو کنید. لغو در زمان مجاز (۲ ساعت قبل) هیچ تأثیر منفی روی پروفایل شما ندارد. امکان تغییر مستقیم زمان در نسخه‌های بعدی اضافه خواهد شد.',
  },
  {
    icon: AlertCircle,
    title: 'موارد خاص',
    body: 'در موارد اضطراری (بیماری، تصادف و...)، لغو دیرهنگام با ارائه مستندات قابل قبول است. در این صورت با پشتیبانی نوبت‌یار تماس بگیرید تا موضوع بررسی شود و هیچ محدودیتی برای شما ثبت نشود.',
  },
];

export default function CancellationPolicyPage() {
  return (
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-3">سیاست لغو نوبت</h1>
      <p className="text-text-muted text-sm mb-8">آخرین به‌روزرسانی: ۱۴۰۴/۰۶/۲۴</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          لطفاً قبل از رزرو نوبت، سیاست لغو زیر را بخوانید. رزرو نوبت به‌منزله پذیرش این سیاست است.
        </p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((s, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-text-primary">{s.title}</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-text-muted">
        سوال دیگری دارید؟{' '}
        <a href="/contact" className="text-primary font-medium hover:underline">با ما تماس بگیرید</a>
      </div>
    </div>
  );
}

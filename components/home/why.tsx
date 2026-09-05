import { Bell, ShieldCheck, Clock } from 'lucide-react';

const advantages = [
  {
    icon: Bell,
    title: 'یادآوری هوشمند پیامکی',
    description: 'ارسال خودکار پیامک یادآوری قبل از زمان نوبت جهت جلوگیری از فراموشی و لغو ناگهانی نوبت‌ها',
  },
  {
    icon: ShieldCheck,
    title: 'پشتیبانی و امنیت کامل',
    description: 'حفظ حریم خصوصی، امنیت اطلاعات و پشتیبانی ۲۴ ساعته همکاران ما در هر ساعت از شبانه‌روز',
  },
  {
    icon: Clock,
    title: 'رزرو ۲۴ ساعته بدون معطلی',
    description: 'امکان مشاهده ساعت‌های خالی و رزرو نوبت در تمام روزهای هفته بدون نیاز به تماس تلفنی مکرر',
  },
];

export function WhyCustomer() {
  return (
    <section className="flex w-full flex-col items-center gap-12 bg-[#6366f114] px-6 py-16 sm:px-10 lg:p-20" id="about">
      <header className="flex flex-col items-center gap-2">
        <h2 className="text-center text-[28px] font-extrabold leading-tight text-slate-900" dir="rtl">
          چرا نوبت‌یار؟
        </h2>
        <p className="text-center text-base font-normal leading-tight text-slate-600" dir="rtl">
          ساده‌ترین راهکار برای مدیریت هوشمند زمان و نوبت‌های شما
        </p>
      </header>

      <ul className="grid w-full grid-cols-1 items-start gap-10 sm:grid-cols-3 sm:gap-8">
        {advantages.map((adv) => (
          <li key={adv.title}>
            <article className="flex h-full flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10">
                <adv.icon className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-center text-lg font-bold leading-tight text-slate-900" dir="rtl">
                {adv.title}
              </h3>
              <p className="text-center text-sm font-normal leading-relaxed text-slate-600" dir="rtl">
                {adv.description}
              </p>
            </article>
          </li>
        ))}
      </ul>

      <a
        href="/search"
        className="rounded-xl bg-indigo-500 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-indigo-600"
        dir="rtl"
      >
        همین حالا شروع کنید
      </a>
    </section>
  );
}

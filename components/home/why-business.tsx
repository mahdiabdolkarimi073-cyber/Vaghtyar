import { TrendingUp, PieChart, Calendar, Users } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: 'افزایش فروش و مشتری',
    description: 'دسترسی به هزاران مشتری جدید فعال در پلتفرم و امکان ارائه تخفیف‌های هدفمند در ساعت‌های خلوت',
  },
  {
    icon: PieChart,
    title: 'گزارشات مالی و آمار دقیق',
    description: 'مشاهده نمودارهای رشد درآمد، تعداد نوبت‌های موفق و ارزیابی عملکرد کارکنان در دوره‌های زمانی مختلف',
  },
  {
    icon: Calendar,
    title: 'تقویم هوشمند نوبت‌دهی',
    description: 'مدیریت یکپارچه شیفت‌های کاری، تعطیلات، مرخصی پرسنل و دسترسی سریع به تمام نوبت‌های ثبت شده روزانه',
  },
  {
    icon: Users,
    title: 'مدیریت آسان پرسنل و مشتری',
    description: 'امکان تعریف بی‌نهایت پرسنل با خدمات متمایز و دسترسی اختصاصی، به همراه بانک اطلاعاتی کامل مشتریان',
  },
];

export function WhyBusiness() {
  return (
    <section className="flex w-full flex-col items-start gap-12 bg-slate-900 p-6 sm:p-10 lg:p-20">
      <header className="flex w-full flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
        <a
          href="/business-register"
          className="rounded-[10px] bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
          dir="rtl"
        >
          ثبت رایگان کسب‌وکار
        </a>
        <div className="flex flex-col items-end gap-2 text-right" dir="rtl">
          <h2 className="text-[28px] font-extrabold leading-tight text-white">
            چرا کسب‌وکارها نوبت‌یار را انتخاب می‌کنند؟
          </h2>
          <p className="text-base font-normal leading-tight text-slate-400">
            پنل مدیریتی قدرتمند برای اتوماسیون کامل نوبت‌دهی و پذیرش مشتریان شما
          </p>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex h-full flex-col items-start gap-4 rounded-2xl border-0 bg-white/5 p-6 text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <benefit.icon className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="w-full text-right text-lg font-bold leading-tight text-white" dir="rtl">
              {benefit.title}
            </h3>
            <p className="w-full text-right text-sm font-normal leading-relaxed text-slate-400" dir="rtl">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

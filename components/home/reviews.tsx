import { Star } from 'lucide-react';

interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

const roles: Record<string, string> = {
  'مریم احمدی': 'کاربر دندان‌پزشکی',
  'علی رضایی': 'مدیر سالن زیبایی ماهور',
  'سارا محمدی': 'کاربر خدمات خودرو',
  'حسین کریمی': 'کاربر دندان‌پزشکی',
  'نرگس صادقی': 'کاربر سالن زیبایی',
  'محمد حسینی': 'کاربر خدمات ورزشی',
};

export function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <section
      className="flex w-full flex-col items-stretch gap-8 p-5 sm:p-10 lg:p-20"
      aria-labelledby="testimonials-heading"
    >
      <header className="flex flex-col items-end gap-1.5 text-right">
        <h2
          id="testimonials-heading"
          className="text-2xl font-bold leading-tight text-slate-900"
          dir="rtl"
        >
          نظرات مشتریان راضی
        </h2>
        <p className="text-sm font-normal leading-tight text-slate-600" dir="rtl">
          همراهان نوبت‌یار در مورد ما چه می‌گویند؟
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                  <h3 className="whitespace-nowrap text-sm font-bold leading-tight text-slate-900" dir="rtl">
                    {review.name}
                  </h3>
                  <p className="whitespace-nowrap text-xs font-normal leading-tight text-slate-400" dir="rtl">
                    {roles[review.name] || 'کاربر نوبت‌یار'}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                  {review.name.charAt(0)}
                </div>
              </div>
            </div>
            <blockquote className="text-right text-sm font-normal leading-relaxed text-slate-600" dir="rtl">
              {review.comment}
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  );
}

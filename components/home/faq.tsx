'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="flex w-full flex-col items-start gap-10 bg-white px-5 py-20 sm:px-10 lg:px-[180px]"
      aria-labelledby="faq-title"
      dir="rtl"
    >
      <header className="flex w-full flex-col items-center gap-2">
        <h2
          id="faq-title"
          className="text-center text-[28px] font-extrabold leading-tight text-slate-900"
        >
          سوالات متداول
        </h2>
        <p className="text-center text-base font-normal leading-tight text-slate-600">
          پاسخ رایج‌ترین سوالات کاربران و صاحبان کسب‌وکارهای نوبت‌یار
        </p>
      </header>

      <div className="flex w-full flex-col gap-4">
        {faqs.map((faq, idx) => (
          <div
            key={faq.id}
            className="w-full rounded-xl border border-slate-200 bg-white"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="flex w-full flex-row-reverse items-center justify-between gap-3 px-5 py-5 text-right"
            >
              <span className="text-base font-bold leading-tight text-slate-900">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-600 transition-transform duration-300 ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ${
                openIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-right text-sm font-normal leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

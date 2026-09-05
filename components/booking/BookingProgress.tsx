'use client';

import { Check } from 'lucide-react';

const steps = [
  { number: 1, label: 'انتخاب خدمت' },
  { number: 2, label: 'انتخاب کارمند' },
  { number: 3, label: 'انتخاب تاریخ و ساعت' },
  { number: 4, label: 'اطلاعات شما' },
  { number: 5, label: 'تأیید و ثبت' },
];

export function BookingProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="مراحل رزرو" className="flex w-full items-center justify-center gap-2 overflow-x-auto py-1" dir="rtl">
      {steps.map((step, index) => (
        <div key={step.number} className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-[11px] sm:text-[13px] ${step.number <= currentStep ? 'font-bold text-[#582bf5]' : 'text-[#8d92a3]'}`}>
              {step.label}
            </span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step.number < currentStep ? 'bg-[#582bf5] text-white' : step.number === currentStep ? 'bg-[#582bf5] text-white' : 'border border-[#e4e8f0] bg-white text-[#8d92a3]'}`}>
              {step.number < currentStep ? <Check className="h-3.5 w-3.5" /> : step.number}
            </span>
          </div>
          {index < steps.length - 1 && <span className="h-px w-4 bg-[#e4e8f0] sm:w-10" />}
        </div>
      ))}
    </nav>
  );
}

'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export function BookingCalendar({ selected, onSelect }: { selected: Date | undefined; onSelect: (date: Date | undefined) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className="rounded-2xl border border-[#e4e8f0] bg-white p-4 shadow-[0_10px_30px_#00000005]">
      <div className="mb-3 flex items-center justify-end gap-2 text-sm font-bold text-[#1e202c]"><CalendarIcon className="h-4 w-4 text-[#582bf5]" /> تقویم انتخاب نوبت</div>
      <Calendar mode="single" selected={selected} onSelect={onSelect} disabled={[{ before: today }, { dayOfWeek: [4, 5] }]} dir="rtl" className="mx-auto" />
      <div className="mt-3 flex items-center justify-center gap-4 border-t border-[#e4e8f0] pt-3 text-[11px] text-[#8d92a3]"><span><i className="ml-1 inline-block h-2 w-2 rounded-full bg-[#582bf5]" />روز انتخاب‌شده</span><span><i className="ml-1 inline-block h-2 w-2 rounded-full bg-[#ff6b6b]" />تعطیل</span></div>
    </div>
  );
}

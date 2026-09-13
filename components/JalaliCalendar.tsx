'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toJalali } from 'date-fns-jalali';
import { DAY_NAMES_SHORT_FA, MONTH_NAMES_FA, toPersianDigits } from '@/lib/constants';

interface Props {
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  disabledDates?: Set<number>;
  minDate?: Date;
}

export default function JalaliCalendar({ onSelect, selectedDate, disabledDates, minDate }: Props) {
  const [viewDate, setViewDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateVal = minDate || today;

  const jalali = toJalali(viewDate);
  const year = jalali.year;
  const month = jalali.month; // 1-12

  // Get first day of Jalali month
  const firstOfMonthGregorian = new Date(viewDate);
  // We need to figure out the Gregorian date of the 1st of the current Jalali month
  // toJalali gives us the jalali date of viewDate. We need the gregorian date of jalali 1st.
  // Easier: build from the known jalali year/month.
  // Use date-fns-jalali's toGregorian if available, otherwise compute manually.
  // date-fns-jalali exports toGregorian.
  let toGregorian: (j: { year: number; month: number; day: number }) => Date;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('date-fns-jalali');
    toGregorian = mod.toGregorian;
  } catch {
    // Fallback: use the viewDate's day offset
    toGregorian = (j) => new Date(j.year, j.month - 1, j.day);
  }

  const firstJalaliDate = toGregorian({ year, month, day: 1 });
  const firstDayOfWeek = firstJalaliDate.getDay(); // 0=Saturday in JS getDay() is 0=Sunday

  // Number of days in Jalali month
  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  // Leap year check for Esfand (month 12)
  const isLeap = (((((year - 474) % 2820) + 2820) % 2820) * 682) % 2816) < 682;
  const daysInMonth = month === 12 && isLeap ? 30 : jalaliMonthDays[month - 1];

  // In Persian calendar, Saturday = 0 (first day of week)
  // JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
  // Persian week starts on Saturday (JS 6), so we shift: (jsDay + 1) % 7
  const startOffset = (firstDayOfWeek + 1) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const prevMonth = () => {
    const prev = new Date(viewDate);
    prev.setMonth(prev.getMonth() - 1);
    setViewDate(prev);
  };

  const nextMonth = () => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + 1);
    setViewDate(next);
  };

  const handleDayClick = (day: number | null) => {
    if (day === null) return;
    const gregDate = toGregorian({ year, month, day });
    gregDate.setHours(0, 0, 0, 0);

    if (gregDate < minDateVal) return;
    if (disabledDates && disabledDates.has(gregDate.getTime())) return;

    onSelect(gregDate);
  };

  const isDisabled = (day: number | null) => {
    if (day === null) return true;
    const gregDate = toGregorian({ year, month, day });
    gregDate.setHours(0, 0, 0, 0);
    if (gregDate < minDateVal) return true;
    if (disabledDates && disabledDates.has(gregDate.getTime())) return true;
    return false;
  };

  const isSelected = (day: number | null) => {
    if (day === null || !selectedDate) return false;
    const gregDate = toGregorian({ year, month, day });
    gregDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === gregDate.getTime();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800">
          {MONTH_NAMES_FA[month - 1]} {toPersianDigits(year)}
        </h3>
        <button onClick={nextMonth} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES_SHORT_FA.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => handleDayClick(day)}
            disabled={isDisabled(day)}
            className={`
              h-10 rounded-lg text-sm font-medium transition-all
              ${day === null ? 'cursor-default' : ''}
              ${isDisabled(day) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}
              ${isSelected(day) ? 'bg-teal-600 text-white hover:bg-teal-600 hover:text-white' : ''}
            `}
          >
            {day !== null && toPersianDigits(day)}
          </button>
        ))}
      </div>
    </div>
  );
}

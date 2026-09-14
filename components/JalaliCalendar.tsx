'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toJalali, toGregorian, isLeapJalaliYear } from '@/lib/jalali';
import { DAY_NAMES_SHORT_FA, MONTH_NAMES_FA, toPersianDigits } from '@/lib/constants';

interface Props {
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  disabledDates?: Set<number>;
  minDate?: Date;
}

function getDaysInJalaliMonth(jy: number, jm: number): number {
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (jm === 12 && isLeapJalaliYear(jy)) return 30;
  return monthLengths[jm - 1];
}

export default function JalaliCalendar({ onSelect, selectedDate, disabledDates, minDate }: Props) {
  const [viewDate, setViewDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateVal = minDate || today;

  const j = toJalali(viewDate.getFullYear(), viewDate.getMonth() + 1, viewDate.getDate());
  const jy = j.jy;
  const jm = j.jm;

  const g = toGregorian(jy, jm, 1);
  const firstJalaliDate = new Date(g.gy, g.gm - 1, g.gd);
  const firstDayOfWeek = firstJalaliDate.getDay();

  const daysInMonth = getDaysInJalaliMonth(jy, jm);

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

  const getGregorianForDay = (day: number): Date => {
    const gr = toGregorian(jy, jm, day);
    return new Date(gr.gy, gr.gm - 1, gr.gd);
  };

  const handleDayClick = (day: number | null) => {
    if (day === null) return;
    const gregDate = getGregorianForDay(day);
    gregDate.setHours(0, 0, 0, 0);

    if (gregDate < minDateVal) return;
    if (disabledDates && disabledDates.has(gregDate.getTime())) return;

    onSelect(gregDate);
  };

  const isDisabled = (day: number | null) => {
    if (day === null) return true;
    const gregDate = getGregorianForDay(day);
    gregDate.setHours(0, 0, 0, 0);
    if (gregDate < minDateVal) return true;
    if (disabledDates && disabledDates.has(gregDate.getTime())) return true;
    return false;
  };

  const isSelected = (day: number | null) => {
    if (day === null || !selectedDate) return false;
    const gregDate = getGregorianForDay(day);
    gregDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === gregDate.getTime();
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
        <h3 className="font-bold text-text-primary">
          {MONTH_NAMES_FA[jm - 1]} {toPersianDigits(jy)}
        </h3>
        <button onClick={nextMonth} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES_SHORT_FA.map((d, i) => (
          <div key={i} className="text-center text-xs text-text-muted font-medium py-1">{d}</div>
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
              ${isDisabled(day) ? 'text-text-muted cursor-not-allowed' : 'text-text-primary hover:bg-primary/10 hover:text-primary'}
              ${isSelected(day) ? 'bg-primary text-white hover:bg-primary hover:text-white shadow-soft' : ''}
            `}
          >
            {day !== null && toPersianDigits(day)}
          </button>
        ))}
      </div>
    </div>
  );
}

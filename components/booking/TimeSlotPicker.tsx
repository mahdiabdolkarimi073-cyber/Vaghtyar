'use client';

import { toPersianDigits } from '@/lib/salon-types';

export function TimeSlotPicker({ slots, selected, onSelect }: { slots: string[]; selected: string; onSelect: (slot: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" dir="rtl">
      {slots.map((slot) => <button key={slot} type="button" onClick={() => onSelect(slot)} className={`rounded-lg border px-3 py-3 text-sm font-bold transition-colors ${selected === slot ? 'border-[#582bf5] bg-[#582bf5] text-white' : 'border-[#e4e8f0] bg-white text-[#1e202c] hover:border-[#582bf5] hover:text-[#582bf5]'}`}>{toPersianDigits(slot)}</button>)}
    </div>
  );
}

'use client';

import { UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BookingEmployee } from '@/lib/booking';

export function EmployeeCard({ employee, selected, onSelect }: { employee: BookingEmployee; selected: boolean; onSelect: () => void }) {
  const initials = employee.name.slice(0, 1);
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={`flex w-full items-center justify-between border-b border-[#e4e8f0] px-5 py-4 text-right transition-colors last:border-b-0 ${selected ? 'bg-[#f4f0ff]' : 'bg-white hover:bg-[#faf9ff]'}`} dir="rtl">
      <div className="flex items-center gap-4">
        {employee.id === 'anyone' ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eee9ff] text-[#582bf5]"><UserRound className="h-6 w-6" /></div>
        ) : (
          <Avatar className="h-14 w-14"><AvatarImage src={employee.photo ?? undefined} alt={employee.name} className="object-cover" /><AvatarFallback className="bg-[#eee9ff] font-bold text-[#582bf5]">{initials}</AvatarFallback></Avatar>
        )}
        <span className="flex flex-col items-end gap-1">
          <span className={`text-[15px] font-bold ${selected ? 'text-[#582bf5]' : 'text-[#1e202c]'}`}>{employee.name}</span>
          <span className="text-[13px] text-[#6e7385]">{employee.specialization}</span>
        </span>
      </div>
      <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${selected ? 'border-[#582bf5]' : 'border-[#e4e8f0]'}`}>
        {selected && <span className="h-3 w-3 rounded-full bg-[#582bf5]" />}
      </span>
    </button>
  );
}

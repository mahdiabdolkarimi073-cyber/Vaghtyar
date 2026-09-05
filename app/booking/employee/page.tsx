'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, UserRound } from 'lucide-react';
import { EmployeeCard } from '@/components/booking/EmployeeCard';
import { BookingHeader } from '@/components/booking/BookingHeader';
import type { BookingEmployee } from '@/lib/booking';
import { fetchJson } from '@/lib/booking-api';

interface EmployeesResponse { employees: BookingEmployee[]; business: { name: string; address: string | null; slug: string }; service: { id: number; name: string; durationMin: number } }

function EmployeePageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceId = params.get('serviceId') || params.get('service') || '';
  const [data, setData] = useState<EmployeesResponse | null>(null);
  const [selected, setSelected] = useState<number | 'anyone' | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (!serviceId) { setError('خدمت انتخاب‌شده پیدا نشد.'); return; } fetchJson<EmployeesResponse>(`/api/booking/employees?serviceId=${encodeURIComponent(serviceId)}`).then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'دریافت اطلاعات ناموفق بود.')); }, [serviceId]);
  const backHref = data ? `/salon/${data.business.slug}/book?service=${serviceId}&step=1` : '/';
  const next = () => { if (selected === null || !data) return; router.push(`/booking/datetime?serviceId=${serviceId}&employeeId=${selected}&businessName=${encodeURIComponent(data.business.slug)}`); };
  return <main className="min-h-screen bg-[#f8f9fd]" dir="rtl"><BookingHeader currentStep={2} business={data?.business} backHref={backHref} /><section className="flex flex-col items-center gap-6 px-4 pb-20 pt-10"><header className="flex w-full max-w-[680px] flex-col items-center gap-3"><div className="flex items-center gap-2"><h2 className="text-base font-bold text-[#1e202c]">انتخاب کارمند</h2><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#582bf5] text-sm font-bold text-white">۲</span></div><p className="text-center text-lg font-bold text-[#1e202c]">کارمند مورد نظر خود را انتخاب کنید</p><p className="text-center text-[13px] text-[#8d92a3]">یا هر کسی که خالی باشد را انتخاب کنید</p></header><div className="w-full max-w-[680px] overflow-hidden rounded-[20px] border border-[#e4e8f0] bg-white shadow-[0_10px_30px_#00000005]">{error ? <div className="flex flex-col items-center gap-3 p-10 text-center text-sm text-rose-500"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-[#e4e8f0] px-4 py-2 text-[#582bf5]">تلاش دوباره</button></div> : !data ? <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin text-[#582bf5]" /></div> : data.employees.map((employee) => <EmployeeCard key={employee.id} employee={employee} selected={selected === employee.id} onSelect={() => setSelected(employee.id)} />)}</div><div className="flex w-full max-w-[680px] items-center justify-between"><button type="button" onClick={() => router.push(backHref)} className="flex items-center gap-2 rounded-xl border border-[#582bf5] bg-white px-6 py-3 text-sm text-[#582bf5]"><ArrowRight className="h-4 w-4" /> مرحله قبل</button><div className="hidden text-center sm:block"><p className="text-[13px] text-[#582bf5]">خدمت انتخاب‌شده: {data?.service.name || '...'}</p><p className="text-sm font-bold text-[#1e202c]">انتخاب کارمند برای ادامه</p></div><button type="button" disabled={selected === null} onClick={next} className="flex items-center gap-2 rounded-xl bg-[#582bf5] px-9 py-3 text-sm text-white transition-colors hover:bg-[#4822cf] disabled:cursor-not-allowed disabled:opacity-40">مرحله بعد <ArrowLeft className="h-4 w-4" /></button></div></section></main>;
}

export default function EmployeePage() { return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#582bf5]" /></div>}><EmployeePageContent /></Suspense>; }

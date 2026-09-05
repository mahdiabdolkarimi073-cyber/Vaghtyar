import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BookingProgress } from './BookingProgress';

export function BookingHeader({ currentStep, business, backHref }: { currentStep: number; business?: { name: string; address: string | null }; backHref: string }) {
  return <header className="flex w-full flex-col gap-6 border-b border-[#e4e8f0] bg-white px-5 py-5 sm:px-12 sm:py-6" dir="rtl"><div className="flex items-center justify-between gap-5"><div className="hidden w-[260px] shrink-0 rounded-2xl border border-[#e4e8f0] bg-white p-4 sm:block"><p className="text-[15px] font-bold text-[#1e202c]">{business?.name || 'رزرو نوبت'}</p><p className="mt-2 text-xs text-[#6e7385]">{business?.address || 'اطلاعات کسب‌وکار'}</p><Link href={backHref} className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-[#582bf5]">بازگشت به صفحه کسب‌وکار <ArrowLeft className="h-3.5 w-3.5" /></Link></div><div className="flex-1 text-right sm:text-center"><h1 className="text-xl font-bold text-[#1e202c]">رزرو نوبت</h1><p className="mt-1 text-xs text-[#6e7385]">فرآیند رزرو در {business?.name || 'کسب‌وکار'}</p></div></div><BookingProgress currentStep={currentStep} /></header>;
}

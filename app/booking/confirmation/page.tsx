'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { toPersianDigits } from '@/lib/salon-types';

interface Booking { id: number; serviceName: string; employeeName: string; date: string; time: string }

export default function ConfirmationPage() { const [booking, setBooking] = useState<Booking | null>(null); useEffect(() => { const value = sessionStorage.getItem('bookingConfirmation'); if (value) setBooking(JSON.parse(value) as Booking); }, []); return <main className="flex min-h-screen items-center justify-center bg-[#f8f9fd] px-5 py-12" dir="rtl"><section className="flex w-full max-w-[520px] flex-col items-center gap-6 rounded-[20px] border border-[#e4e8f0] bg-white p-8 text-center shadow-[0_10px_30px_#00000005]"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eee9ff]"><CheckCircle2 className="h-11 w-11 text-[#582bf5]" /></div><h1 className="text-2xl font-bold text-[#1e202c]">رزرو شما با موفقیت ثبت شد!</h1>{booking && <div className="w-full space-y-3 rounded-xl bg-[#f8f9fd] p-5 text-sm"><div className="flex justify-between"><span className="text-[#8d92a3]">شماره رزرو</span><b>#{toPersianDigits(String(booking.id))}</b></div><div className="flex justify-between"><span className="text-[#8d92a3]">خدمت</span><b>{booking.serviceName}</b></div><div className="flex justify-between"><span className="text-[#8d92a3]">کارمند</span><b>{booking.employeeName}</b></div><div className="flex justify-between"><span className="text-[#8d92a3]">تاریخ</span><b>{toPersianDigits(booking.date)}</b></div><div className="flex justify-between"><span className="text-[#8d92a3]">ساعت</span><b>{toPersianDigits(booking.time)}</b></div></div>}<p className="text-sm text-[#6e7385]">جزئیات نوبت شما با موفقیت ثبت شد.</p><Link href="/" className="rounded-xl bg-[#582bf5] px-8 py-3 text-sm font-bold text-white hover:bg-[#4822cf]">بازگشت به خانه</Link></section></main>; }

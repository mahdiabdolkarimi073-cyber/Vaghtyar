import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBookingContext, isValidDate, overlaps, timeToMinutes } from '@/lib/booking';
import { prisma } from '@/lib/prisma';

const schema = z.object({ serviceId: z.number().int().positive(), employeeId: z.union([z.literal('anyone'), z.number().int().positive()]), date: z.string(), timeSlot: z.string().regex(/^\d{2}:\d{2}$/), customerName: z.string().trim().min(2).max(100).optional(), customerPhone: z.string().trim().min(8).max(20).optional() });

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    if (!isValidDate(body.date)) return NextResponse.json({ error: 'تاریخ معتبر نیست.' }, { status: 400 });
    const service = await getBookingContext(body.serviceId);
    if (!service) return NextResponse.json({ error: 'خدمت مورد نظر پیدا نشد.' }, { status: 404 });
    const staffId = body.employeeId === 'anyone' ? null : String(body.employeeId);
    if (staffId && !service.business.staff.some((staff) => String(staff.id) === staffId)) return NextResponse.json({ error: 'کارمند مورد نظر پیدا نشد.' }, { status: 404 });
    const existing = await prisma.appointment.findMany({ where: { businessId: service.businessId, appointmentDate: body.date, ...(staffId ? { staffId } : {}) }, select: { appointmentTime: true, totalDuration: true } });
    if (existing.some((appointment) => overlaps(timeToMinutes(body.timeSlot), service.durationMin, timeToMinutes(appointment.appointmentTime), appointment.totalDuration))) return NextResponse.json({ error: 'این زمان به‌تازگی رزرو شده است.' }, { status: 409 });
    const appointment = await prisma.appointment.create({ data: { businessId: service.businessId, serviceIds: JSON.stringify([service.id]), staffId, customerName: body.customerName || 'مشتری نوبت‌یار', customerPhone: body.customerPhone || '', appointmentDate: body.date, appointmentTime: body.timeSlot, totalPrice: service.price, totalDuration: service.durationMin } });
    await prisma.business.update({ where: { id: service.businessId }, data: { appointmentCount: { increment: 1 } } });
    return NextResponse.json({ booking: { id: appointment.id, serviceName: service.name, employeeName: staffId ? service.business.staff.find((staff) => String(staff.id) === staffId)?.name || '' : 'هر کسی که خالی باشد', date: body.date, time: body.timeSlot } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'اطلاعات رزرو را کامل و صحیح وارد کنید.' }, { status: 400 });
    return NextResponse.json({ error: 'ثبت رزرو با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

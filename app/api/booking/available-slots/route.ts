import { NextRequest, NextResponse } from 'next/server';
import { getBookingContext, getIranianDay, isValidDate, minutesToTime, overlaps, timeToMinutes } from '@/lib/booking';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const search = new URL(request.url).searchParams;
  const rawServiceId = search.get('serviceId');
  const employeeId = search.get('employeeId');
  const date = search.get('date') || '';
  const serviceId = Number(rawServiceId);
  if (!rawServiceId || !Number.isInteger(serviceId) || !employeeId || !isValidDate(date)) return NextResponse.json({ error: 'اطلاعات تاریخ و انتخاب‌ها معتبر نیست.' }, { status: 400 });

  try {
    const service = await getBookingContext(serviceId);
    if (!service) return NextResponse.json({ error: 'خدمت مورد نظر پیدا نشد.' }, { status: 404 });
    const selectedStaff = employeeId === 'anyone' ? service.business.staff : service.business.staff.filter((staff) => String(staff.id) === employeeId);
    if (employeeId !== 'anyone' && selectedStaff.length === 0) return NextResponse.json({ error: 'کارمند مورد نظر پیدا نشد.' }, { status: 404 });
    const hours = service.business.workingHours.find((item) => item.dayOfWeek === getIranianDay(new Date(`${date}T00:00:00`)));
    if (!hours || selectedStaff.length === 0) return NextResponse.json({ date, duration: service.durationMin, slots: [] });

    const appointments = await prisma.appointment.findMany({ where: { businessId: service.businessId, appointmentDate: date }, select: { staffId: true, appointmentTime: true, totalDuration: true } });
    const duration = service.durationMin;
    const start = timeToMinutes(hours.openTime);
    const end = timeToMinutes(hours.closeTime) - duration;
    const slots: string[] = [];
    for (let minute = start; minute <= end; minute += 30) {
      const available = selectedStaff.some((staff) => appointments.filter((appointment) => appointment.staffId === String(staff.id)).every((appointment) => !overlaps(minute, duration, timeToMinutes(appointment.appointmentTime), appointment.totalDuration)));
      if (available) slots.push(minutesToTime(minute));
    }
    return NextResponse.json({ date, duration, slots, service: { id: service.id, name: service.name } });
  } catch {
    return NextResponse.json({ error: 'دریافت زمان‌های خالی با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

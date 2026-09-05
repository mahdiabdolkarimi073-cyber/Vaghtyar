import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export async function GET(
  request: NextRequest,
  { params }: { params: { businessName: string } }
) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '';
  const serviceIds = (searchParams.get('serviceIds') || '').split(',').filter(Boolean).map(Number);

  if (!isValidDate(date) || serviceIds.length === 0 || serviceIds.some((id) => !Number.isInteger(id))) {
    return NextResponse.json({ error: 'تاریخ و خدمات انتخاب‌شده معتبر نیستند.' }, { status: 400 });
  }

  try {
    const business = await prisma.business.findUnique({
      where: { slug: decodeURIComponent(params.businessName) },
      include: { services: true, workingHours: true },
    });
    if (!business) return NextResponse.json({ error: 'سالن مورد نظر پیدا نشد.' }, { status: 404 });

    const selected = business.services.filter((service) => serviceIds.includes(service.id));
    if (selected.length !== serviceIds.length) {
      return NextResponse.json({ error: 'یکی از خدمات انتخاب‌شده معتبر نیست.' }, { status: 400 });
    }

    const requestedDate = new Date(`${date}T00:00:00`);
    const iranianDay = (requestedDate.getDay() + 1) % 7;
    const hours = business.workingHours.find((item) => item.dayOfWeek === iranianDay);
    if (!hours) return NextResponse.json({ date, slots: [] });

    const duration = selected.reduce((sum, service) => sum + service.durationMin, 0);
    const [openHour, openMinute] = hours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = hours.closeTime.split(':').map(Number);
    const start = openHour * 60 + openMinute;
    const end = closeHour * 60 + closeMinute - duration;
    const existing = await prisma.appointment.findMany({
      where: { businessId: business.id, appointmentDate: date },
      select: { appointmentTime: true },
    });
    const reserved = new Set(existing.map((appointment) => appointment.appointmentTime));
    const slots: string[] = [];
    for (let minutes = start; minutes <= end; minutes += 30) {
      const slot = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      if (!reserved.has(slot)) slots.push(slot);
    }
    return NextResponse.json({ date, duration, slots });
  } catch {
    return NextResponse.json({ error: 'دریافت زمان‌های خالی با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

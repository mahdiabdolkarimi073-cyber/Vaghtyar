import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

const schema = z.object({
  customerName: z.string().min(1, 'نام مشتری الزامی است'),
  customerMobile: z.string().min(1, 'موبایل الزامی است'),
  serviceId: z.string().min(1, 'خدمت الزامی است'),
  staffId: z.string().min(1, 'کارکن الزامی است'),
  date: z.string(),
  time: z.string(),
});

export async function POST(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.data ? '' : parsed.error.errors[0].message }, { status: 400 });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { customerName, customerMobile, serviceId, staffId, date, time } = parsed.data;

  let customer = await prisma.customer.findFirst({ where: { businessId, mobile: customerMobile } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { businessId, name: customerName, mobile: customerMobile } });
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
  if (!service) return NextResponse.json({ error: 'خدمت یافت نشد' }, { status: 404 });

  const startDate = new Date(`${date}T${time}:00`);
  const endDate = new Date(startDate.getTime() + service.durationMinutes * 60000);

  // ─── جلوگیری از رزرو مضاعف — بررسی هم Booking و هم Appointment ───
  const bookingDate = new Date(date + 'T00:00:00');
  const [startH, startM] = time.split(':').map(Number);
  const endMinutes = startH * 60 + startM + service.durationMinutes;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [existingBookings, existingAppointments] = await Promise.all([
    prisma.booking.findMany({
      where: {
        businessId,
        staffId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.appointment.findMany({
      where: {
        businessId,
        staffId,
        startTime: { gte: startOfDay, lt: new Date(endOfDay.getTime() + 1) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
  ]);

  const slotStartMin = startH * 60 + startM;
  const slotEndMin = endMinutes;

  for (const booking of existingBookings) {
    const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
    const [bEndH, bEndM] = booking.endTime.split(':').map(Number);
    const bStart = bStartH * 60 + bStartM;
    const bEnd = bEndH * 60 + bEndM;
    if (slotStartMin < bEnd && slotEndMin > bStart) {
      return NextResponse.json({ error: 'این زمان با یک رزرو آنلاین تداخل دارد' }, { status: 400 });
    }
  }

  for (const appt of existingAppointments) {
    const aStart = appt.startTime.getHours() * 60 + appt.startTime.getMinutes();
    const aEnd = appt.endTime.getHours() * 60 + appt.endTime.getMinutes();
    if (slotStartMin < aEnd && slotEndMin > aStart) {
      return NextResponse.json({ error: 'این زمان با یک نوبت موجود تداخل دارد' }, { status: 400 });
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      customerId: customer.id,
      serviceId,
      staffId,
      startTime: startDate,
      endTime: endDate,
      status: 'CONFIRMED',
      source: 'MANUAL',
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

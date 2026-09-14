import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  customerName: z.string().min(1, 'نام مشتری الزامی است'),
  customerMobile: z.string().min(1, 'موبایل الزامی است'),
  serviceId: z.string().min(1, 'خدمت الزامی است'),
  staffId: z.string().min(1, 'کارکن الزامی است'),
  date: z.string(),
  time: z.string(),
});

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
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

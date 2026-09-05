import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bookingSchema = z.object({
  serviceIds: z.array(z.number().int()).min(1),
  staffId: z.number().int().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(8).max(20),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { businessName: string } }
) {
  try {
    const body = bookingSchema.parse(await request.json());
    const business = await prisma.business.findUnique({
      where: { slug: decodeURIComponent(params.businessName) },
      include: { services: true },
    });
    if (!business) return NextResponse.json({ error: 'سالن مورد نظر پیدا نشد.' }, { status: 404 });

    const selected = business.services.filter((service) => body.serviceIds.includes(service.id));
    if (selected.length !== body.serviceIds.length) {
      return NextResponse.json({ error: 'خدمت انتخاب‌شده معتبر نیست.' }, { status: 400 });
    }

    const totalPrice = selected.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selected.reduce((sum, service) => sum + service.durationMin, 0);
    const alreadyBooked = await prisma.appointment.findFirst({
      where: { businessId: business.id, appointmentDate: body.date, appointmentTime: body.time },
    });
    if (alreadyBooked) return NextResponse.json({ error: 'این زمان به‌تازگی رزرو شده است.' }, { status: 409 });

    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        serviceIds: JSON.stringify(body.serviceIds),
        staffId: body.staffId ? String(body.staffId) : null,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        appointmentDate: body.date,
        appointmentTime: body.time,
        totalPrice,
        totalDuration,
      },
    });
    await prisma.business.update({ where: { id: business.id }, data: { appointmentCount: { increment: 1 } } });

    return NextResponse.json({
      booking: { id: appointment.id, date: appointment.appointmentDate, time: appointment.appointmentTime, customerName: appointment.customerName, totalPrice },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'اطلاعات رزرو را کامل و صحیح وارد کنید.' }, { status: 400 });
    return NextResponse.json({ error: 'ثبت رزرو با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

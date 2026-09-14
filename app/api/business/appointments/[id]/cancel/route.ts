import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms-service';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true, business: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: 'CANCELLED', cancelReason: body.reason },
  });

  await sendSms({
    businessId,
    appointmentId: appointment.id,
    recipientPhone: appointment.customer.mobile,
    recipientType: 'CUSTOMER',
    smsType: 'APPOINTMENT_CANCEL',
    templateData: {
      salonName: appointment.business.name,
      date: appointment.startTime,
      time: appointment.startTime.toTimeString().slice(0, 5),
    },
  });

  return NextResponse.json(updated);
}

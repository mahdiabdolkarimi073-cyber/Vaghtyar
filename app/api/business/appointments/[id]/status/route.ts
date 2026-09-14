import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms-service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { status } = await req.json();
  const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'وضعیت نامعتبر' }, { status: 400 });

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true, business: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  const previousStatus = appointment.status;
  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
  });

  if (previousStatus !== 'CONFIRMED' && status === 'CONFIRMED') {
    await sendSms({
      businessId,
      appointmentId: appointment.id,
      recipientPhone: appointment.customer.mobile,
      recipientType: 'CUSTOMER',
      smsType: 'APPOINTMENT_CONFIRM',
      templateData: {
        salonName: appointment.business.name,
        service: appointment.service.name,
        date: appointment.startTime,
        time: appointment.startTime.toTimeString().slice(0, 5),
        code: '',
      },
    });
  }

  if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
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
  }

  return NextResponse.json(updated);
}

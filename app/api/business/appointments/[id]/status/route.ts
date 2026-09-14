import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms-service';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { appointmentStatusSchema } from '@/lib/validations/schemas';

/**
 * PATCH /api/business/appointments/[id]/status
 *
 * تغییر وضعیت نوبت — businessId از JWT، اعتبارسنجی با zod.
 * قیمت و پلن از بدنه درخواست قبول نمی‌شوند.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();

  // ─── اعتبارسنجی ورودی با zod ───
  const parsed = appointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'ورودی نامعتبر' },
      { status: 400 }
    );
  }

  // ─── فیلتر با businessId از JWT ───
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true, business: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  const previousStatus = appointment.status;
  const { status } = parsed.data;

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
        date: appointment.startTime.toISOString().split('T')[0],
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
        date: appointment.startTime.toISOString().split('T')[0],
        time: appointment.startTime.toTimeString().slice(0, 5),
      },
    });
  }

  return NextResponse.json(updated);
}

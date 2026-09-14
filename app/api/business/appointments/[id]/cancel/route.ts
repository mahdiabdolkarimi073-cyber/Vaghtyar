import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms-service';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

/**
 * PUT /api/business/appointments/[id]/cancel
 *
 * لغو نوبت — businessId از JWT، فیلتر با businessId در کوئری.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 500) : undefined;

  // ─── فیلتر با businessId از JWT ───
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true, business: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: 'CANCELLED', cancelReason: reason },
  });

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

  return NextResponse.json(updated);
}

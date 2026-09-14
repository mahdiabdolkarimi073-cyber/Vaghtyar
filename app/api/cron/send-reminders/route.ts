import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms-service';
import { getBusinessPlan } from '@/lib/plan-limits';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const token = authHeader?.replace('Bearer ', '');
    if (token !== cronSecret) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: tomorrow, lt: dayAfter },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    include: { customer: true, service: true, business: true },
  });

  let sentCount = 0;
  for (const appt of appointments) {
    const { plan } = await getBusinessPlan(appt.businessId);
    if (!plan?.hasSmsReminder) continue;

    const result = await sendSms({
      businessId: appt.businessId,
      appointmentId: appt.id,
      recipientPhone: appt.customer.mobile,
      recipientType: 'CUSTOMER',
      smsType: 'APPOINTMENT_REMINDER',
      templateData: {
        salonName: appt.business.name,
        time: appt.startTime.toTimeString().slice(0, 5),
      },
    });

    if (result.success) sentCount++;
  }

  return NextResponse.json({ sent: sentCount, total: appointments.length });
}

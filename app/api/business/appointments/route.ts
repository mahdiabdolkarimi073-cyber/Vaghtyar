import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = { businessId };
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.startTime = { gte: d, lt: dayEnd };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { customer: true, service: true, staff: true },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json(appointments.map(a => ({
    id: a.id,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    status: a.status,
    source: a.source,
    internalNote: a.internalNote,
    cancelReason: a.cancelReason,
    customer: { id: a.customer.id, name: a.customer.name, mobile: a.customer.mobile, isBlocked: a.customer.isBlocked },
    service: { id: a.service.id, name: a.service.name, durationMinutes: a.service.durationMinutes, price: a.service.price },
    staff: { id: a.staff.id, name: a.staff.name },
  })));
}

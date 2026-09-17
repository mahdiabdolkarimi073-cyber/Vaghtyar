import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: now, lt: todayEnd } },
    include: { customer: true, service: true, staff: true },
    orderBy: { startTime: 'asc' },
    take: 20,
  });

  return NextResponse.json(appointments.map(a => ({
    id: a.id,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    customerName: a.customer.name,
    customerMobile: a.customer.mobile,
    serviceName: a.service.name,
    staffName: a.staff.name,
    status: a.status,
    source: a.source,
  })));
}

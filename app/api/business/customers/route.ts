import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 25;

  const where: Record<string, unknown> = { businessId };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { mobile: { contains: search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { appointments: { select: { startTime: true }, orderBy: { startTime: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  const result = await Promise.all(
    customers.map(async (c) => {
      const count = await prisma.appointment.count({ where: { customerId: c.id } });
      return {
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        isBlocked: c.isBlocked,
        createdAt: c.createdAt.toISOString(),
        totalAppointments: count,
        lastVisitDate: c.appointments[0]?.startTime.toISOString() || null,
      };
    })
  );

  return NextResponse.json({ customers: result, total, page, totalPages: Math.ceil(total / limit) });
}

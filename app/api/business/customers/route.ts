import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

/**
 * GET /api/business/customers
 *
 * دریافت لیست مشتریان — businessId از JWT.
 * مشتریان فقط متعلق به کسب‌وکار احراز شده برگردانده می‌شوند.
 */
export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

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

  // ─── شماره موبایل فقط برای مالک کسب‌وکار — در اینجا همه مشتریان متعلق به همین کسب‌وکار هستند ───
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

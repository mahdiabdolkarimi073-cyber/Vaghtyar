import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }

    const businesses = await prisma.business.findMany({
      where: { ownerId: user.id },
      include: {
        services: true,
        staff: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const businessIds = businesses.map((b) => b.id);

    const recentBookings = businessIds.length > 0
      ? await prisma.booking.findMany({
          where: { businessId: { in: businessIds } },
          include: {
            service: true,
            staff: true,
            business: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [];

    return NextResponse.json({ businesses, recentBookings });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

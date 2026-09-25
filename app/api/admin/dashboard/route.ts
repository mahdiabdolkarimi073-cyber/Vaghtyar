import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const now = new Date();

    // Business counts
    const [total, active, pending, inactive] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: 'APPROVED' } }),
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.business.count({ where: { status: 'SUSPENDED' } }),
    ]);

    // Monthly growth for last 12 months
    const monthlyGrowth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.business.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      const monthLabel = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      monthlyGrowth.push({ month: monthLabel, count });
    }

    // Appointments
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [today, thisMonth] = await Promise.all([
      prisma.appointment.count({
        where: { startTime: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.appointment.count({
        where: { startTime: { gte: startOfMonth, lt: endOfMonth } },
      }),
    ]);

    // Daily growth for last 30 days
    const dailyGrowth: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const count = await prisma.appointment.count({
        where: { startTime: { gte: dayStart, lt: dayEnd } },
      });
      const dateLabel = dayStart.toISOString().split('T')[0];
      dailyGrowth.push({ date: dateLabel, count });
    }

    // Revenue — computed from service price of completed appointments
    const completedAppts = await prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      select: { service: { select: { price: true } } },
    });
    const totalRevenue = completedAppts.reduce((sum, a) => sum + (a.service?.price || 0), 0);

    const monthCompletedAppts = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        startTime: { gte: startOfMonth, lt: endOfMonth },
      },
      select: { service: { select: { price: true } } },
    });
    const thisMonthRevenue = monthCompletedAppts.reduce((sum, a) => sum + (a.service?.price || 0), 0);

    // Recent businesses
    const recentBusinesses = await prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    // Recent payments from completed appointments
    const recentPayments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { startTime: 'desc' },
      where: { status: 'COMPLETED' },
      include: {
        business: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      businesses: {
        total,
        active,
        pending,
        inactive,
        monthlyGrowth,
      },
      appointments: {
        today,
        thisMonth,
        dailyGrowth,
      },
      revenue: {
        thisMonth: thisMonthRevenue,
        total: totalRevenue,
      },
      recentBusinesses,
      recentPayments,
    });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

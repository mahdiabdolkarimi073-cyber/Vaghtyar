import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 29);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setDate(prevMonthStart.getDate() - 30);

  const [todayApps, pendingApps, cancelledApps, todayRevApps, weekRevApps, monthRevApps, prevWeekRevApps, prevMonthRevApps] = await Promise.all([
    prisma.appointment.count({ where: { businessId, startTime: { gte: todayStart, lt: todayEnd } } }),
    prisma.appointment.count({ where: { businessId, status: 'PENDING' } }),
    prisma.appointment.count({ where: { businessId, status: 'CANCELLED', startTime: { gte: todayStart, lt: todayEnd } } }),
    prisma.appointment.findMany({ where: { businessId, status: 'COMPLETED', startTime: { gte: todayStart, lt: todayEnd } }, select: { service: { select: { price: true } } } }),
    prisma.appointment.findMany({ where: { businessId, status: 'COMPLETED', startTime: { gte: weekStart, lt: todayEnd } }, select: { service: { select: { price: true } } } }),
    prisma.appointment.findMany({ where: { businessId, status: 'COMPLETED', startTime: { gte: monthStart, lt: todayEnd } }, select: { service: { select: { price: true } } } }),
    prisma.appointment.findMany({ where: { businessId, status: 'COMPLETED', startTime: { gte: prevWeekStart, lt: weekStart } }, select: { service: { select: { price: true } } } }),
    prisma.appointment.findMany({ where: { businessId, status: 'COMPLETED', startTime: { gte: prevMonthStart, lt: monthStart } }, select: { service: { select: { price: true } } } }),
  ]);

  const sumRevenue = (apps: { service: { price: number } }[]) => apps.reduce((s, a) => s + a.service.price, 0);
  const todayRevenue = sumRevenue(todayRevApps);
  const weekRevenue = sumRevenue(weekRevApps);
  const monthRevenue = sumRevenue(monthRevApps);
  const prevWeekRevenue = sumRevenue(prevWeekRevApps);
  const prevMonthRevenue = sumRevenue(prevMonthRevApps);

  const calcTrend = (curr: number, prev: number) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

  return NextResponse.json({
    todayAppointments: todayApps,
    pendingAppointments: pendingApps,
    cancelledAppointments: cancelledApps,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    todayRevenueTrend: 0,
    weekRevenueTrend: calcTrend(weekRevenue, prevWeekRevenue),
    monthRevenueTrend: calcTrend(monthRevenue, prevMonthRevenue),
  });
}

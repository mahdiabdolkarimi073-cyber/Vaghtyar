import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toJalali } from '@/lib/jalali';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
    endDate.setDate(endDate.getDate() + 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  const appointments = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: startDate, lt: endDate } },
    include: { service: true, staff: true, customer: true },
  });

  const totalAppointments = appointments.length;
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED');
  const totalRevenue = completed.reduce((sum, a) => sum + a.service.price, 0);

  const revByService = new Map<string, { name: string; revenue: number; count: number }>();
  const revByStaff = new Map<string, { name: string; revenue: number; count: number }>();

  for (const a of completed) {
    const sKey = a.service.id;
    if (!revByService.has(sKey)) revByService.set(sKey, { name: a.service.name, revenue: 0, count: 0 });
    revByService.get(sKey)!.revenue += a.service.price;
    revByService.get(sKey)!.count += 1;

    const stKey = a.staff.id;
    if (!revByStaff.has(stKey)) revByStaff.set(stKey, { name: a.staff.name, revenue: 0, count: 0 });
    revByStaff.get(stKey)!.revenue += a.service.price;
    revByStaff.get(stKey)!.count += 1;
  }

  const dailyRevMap = new Map<string, number>();
  const dailyAppMap = new Map<string, { confirmed: number; pending: number; completed: number; cancelled: number }>();

  for (const a of appointments) {
    const dKey = a.startTime.toISOString().split('T')[0];
    if (!dailyRevMap.has(dKey)) dailyRevMap.set(dKey, 0);
    if (!dailyAppMap.has(dKey)) dailyAppMap.set(dKey, { confirmed: 0, pending: 0, completed: 0, cancelled: 0 });

    if (a.status === 'COMPLETED') dailyRevMap.set(dKey, dailyRevMap.get(dKey)! + a.service.price);
    const dayApps = dailyAppMap.get(dKey)!;
    if (a.status === 'CONFIRMED') dayApps.confirmed++;
    else if (a.status === 'PENDING') dayApps.pending++;
    else if (a.status === 'COMPLETED') dayApps.completed++;
    else if (a.status === 'CANCELLED') dayApps.cancelled++;
  }

  const dailyRevenue = Array.from(dailyRevMap.entries()).map(([date, revenue]) => {
    const d = new Date(date);
    const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return { date, jalaliDate: `${j.jy}/${j.jm}/${j.jd}`, revenue };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const dailyAppointments = Array.from(dailyAppMap.entries()).map(([date, counts]) => {
    const d = new Date(date);
    const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return { date, jalaliDate: `${j.jy}/${j.jm}/${j.jd}`, ...counts };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const statusBreakdown = [
    { name: 'تایید شده', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: '#6366f1' },
    { name: 'در انتظار', value: appointments.filter(a => a.status === 'PENDING').length, color: '#f59e0b' },
    { name: 'تکمیل شده', value: completed.length, color: '#10b981' },
    { name: 'لغو شده', value: cancelled.length, color: '#ef4444' },
    { name: 'حاضر نشده', value: appointments.filter(a => a.status === 'NO_SHOW').length, color: '#6b7280' },
  ];

  return NextResponse.json({
    totalRevenue,
    totalAppointments,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled.length,
    cancellationRate: totalAppointments > 0 ? Math.round((cancelled.length / totalAppointments) * 100) : 0,
    avgRevenuePerAppointment: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
    revenueByService: Array.from(revByService.values()).sort((a, b) => b.revenue - a.revenue),
    revenueByStaff: Array.from(revByStaff.values()).sort((a, b) => b.revenue - a.revenue),
    dailyRevenue,
    dailyAppointments,
    statusBreakdown,
  });
}

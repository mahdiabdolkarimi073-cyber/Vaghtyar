import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toJalali } from '@/lib/jalali';
import { checkPlanFeature } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const feature = await checkPlanFeature(businessId, 'hasRevenueReport');
  if (!feature.allowed) {
    return NextResponse.json(
      { error: `گزارش درآمد در پلن ${feature.planName} فعال نیست. برای دسترسی، پلن خود را ارتقا دهید.`, featureLocked: true, feature: 'hasRevenueReport' },
      { status: 403 }
    );
  }

  const now = new Date();
  const days: { date: Date; jalali: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    days.push({ date: d, jalali: `${j.jy}/${j.jm}/${j.jd}` });
  }

  const revenue: { date: string; jalaliDate: string; revenue: number }[] = [];
  const appointments: { date: string; jalaliDate: string; confirmed: number; pending: number; completed: number; cancelled: number }[] = [];

  for (const day of days) {
    const dayStart = day.date;
    const dayEnd = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate() + 1);

    const [dayApps, revApps] = await Promise.all([
      prisma.appointment.findMany({
        where: { businessId, startTime: { gte: dayStart, lt: dayEnd } },
        select: { status: true, service: { select: { price: true } } },
      }),
      prisma.appointment.findMany({
        where: { businessId, status: 'COMPLETED', startTime: { gte: dayStart, lt: dayEnd } },
        select: { service: { select: { price: true } } },
      }),
    ]);

    const rev = revApps.reduce((s, a) => s + a.service.price, 0);
    const statusCount = (s: string) => dayApps.filter(a => a.status === s).length;
    revenue.push({ date: day.date.toISOString(), jalaliDate: day.jalali, revenue: rev });
    appointments.push({
      date: day.date.toISOString(),
      jalaliDate: day.jalali,
      confirmed: statusCount('CONFIRMED'),
      pending: statusCount('PENDING'),
      completed: statusCount('COMPLETED'),
      cancelled: statusCount('CANCELLED'),
    });
  }

  return NextResponse.json({ revenue, appointments });
}

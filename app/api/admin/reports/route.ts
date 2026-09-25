import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'revenue';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    if (type === 'revenue') {
      const appointments = await prisma.appointment.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
        select: { service: { select: { price: true } }, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      const dailyMap = new Map<string, number>();
      appointments.forEach(a => {
        const d = a.createdAt.toISOString().split('T')[0];
        dailyMap.set(d, (dailyMap.get(d) || 0) + (a.service?.price || 0));
      });
      return NextResponse.json({
        data: Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount })),
        total: appointments.reduce((s, a) => s + (a.service?.price || 0), 0),
      });
    }

    if (type === 'businesses') {
      const businesses = await prisma.business.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { createdAt: { gte: start, lte: end } },
      });
      return NextResponse.json({ data: businesses.map(b => ({ category: b.category, count: b._count.id })) });
    }

    if (type === 'appointments') {
      const appointments = await prisma.appointment.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      const dailyMap = new Map<string, number>();
      appointments.forEach(a => {
        const d = a.createdAt.toISOString().split('T')[0];
        dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
      });
      return NextResponse.json({
        data: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
        total: appointments.length,
      });
    }

    return NextResponse.json({ error: 'نوع گزارش نامعتبر' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

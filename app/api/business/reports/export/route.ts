import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

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
    orderBy: { startTime: 'asc' },
  });

  const headers = ['تاریخ', 'نام مشتری', 'موبایل', 'خدمت', 'کارکن', 'مدت', 'قیمت', 'وضعیت', 'منبع'];
  const rows = appointments.map(a => [
    a.startTime.toISOString().split('T')[0],
    a.customer.name,
    a.customer.mobile,
    a.service.name,
    a.staff.name,
    String(a.service.durationMinutes),
    String(a.service.price),
    a.status,
    a.source,
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="report-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

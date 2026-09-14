import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  let hours = await prisma.workingHours.findMany({ where: { businessId }, orderBy: { dayOfWeek: 'asc' } });
  if (hours.length === 0) {
    hours = await Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        prisma.workingHours.create({ data: { businessId, dayOfWeek: i, isClosed: i === 6, startTime: '09:00', endTime: '18:00' } })
      )
    );
  }
  return NextResponse.json(hours);
}

export async function PUT(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json() as Array<{
    dayOfWeek: number; isClosed: boolean; startTime: string | null; endTime: string | null;
  }>;

  await prisma.workingHours.deleteMany({ where: { businessId } });
  await prisma.workingHours.createMany({
    data: body.map(h => ({ businessId, dayOfWeek: h.dayOfWeek, isClosed: h.isClosed, startTime: h.startTime, endTime: h.endTime })),
  });
  return NextResponse.json({ success: true });
}

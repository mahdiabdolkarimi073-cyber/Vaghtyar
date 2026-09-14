import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const holidays = await prisma.holiday.findMany({
    where: { businessId },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(holidays);
}

const schema = z.object({
  date: z.string(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'تاریخ الزامی است' }, { status: 400 });

  const holiday = await prisma.holiday.create({
    data: { businessId, date: new Date(parsed.data.date), reason: parsed.data.reason },
  });
  return NextResponse.json(holiday, { status: 201 });
}

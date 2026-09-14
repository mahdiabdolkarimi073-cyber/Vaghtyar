import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { businessId },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(services);
}

const createSchema = z.object({
  name: z.string().min(1, 'نام خدمت الزامی است'),
  durationMinutes: z.number().int().min(5, 'حداقل مدت ۵ دقیقه'),
  price: z.number().int().min(0, 'قیمت نمی‌تواند منفی باشد'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const count = await prisma.service.count({ where: { businessId } });
  const service = await prisma.service.create({
    data: {
      ...parsed.data,
      businessId,
      sortOrder: count,
    },
  });
  return NextResponse.json(service, { status: 201 });
}

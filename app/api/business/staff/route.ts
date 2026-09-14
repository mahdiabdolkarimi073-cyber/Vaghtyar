import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const staff = await prisma.staff.findMany({
    where: { businessId },
    include: { staffServices: { include: { service: true } } },
    orderBy: { name: 'asc' },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const withCounts = await Promise.all(
    staff.map(async (s) => {
      const count = await prisma.appointment.count({
        where: { staffId: s.id, startTime: { gte: todayStart, lt: todayEnd } },
      });
      return {
        ...s,
        todayAppointmentCount: count,
        services: s.staffServices.map((ss) => ({ id: ss.service.id, name: ss.service.name })),
        staffServices: undefined,
      };
    })
  );

  return NextResponse.json(withCounts);
}

const createSchema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  photo: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const staff = await prisma.staff.create({ data: { ...parsed.data, businessId } });
  return NextResponse.json(staff, { status: 201 });
}

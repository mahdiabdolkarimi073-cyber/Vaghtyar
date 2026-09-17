import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const hours = await prisma.staffWorkingHours.findMany({ where: { staffId: params.id } });
  return NextResponse.json(hours);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json() as Array<{
    dayOfWeek: number; isClosed: boolean; startTime: string | null; endTime: string | null; useBusinessDefault: boolean;
  }>;

  await prisma.staffWorkingHours.deleteMany({ where: { staffId: params.id } });
  await prisma.staffWorkingHours.createMany({
    data: body.map(h => ({
      staffId: params.id,
      dayOfWeek: h.dayOfWeek,
      isClosed: h.isClosed,
      startTime: h.startTime,
      endTime: h.endTime,
      useBusinessDefault: h.useBusinessDefault,
    })),
  });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { serviceIds } = await req.json();
  await prisma.staffService.deleteMany({ where: { staffId: params.id } });

  if (serviceIds && serviceIds.length > 0) {
    await prisma.staffService.createMany({
      data: serviceIds.map((serviceId: string) => ({ staffId: params.id, serviceId })),
    });
  }
  return NextResponse.json({ success: true });
}

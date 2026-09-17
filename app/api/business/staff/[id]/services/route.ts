import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { serviceIds } = await req.json();
  await prisma.staffService.deleteMany({ where: { staffId: params.id } });

  if (serviceIds && serviceIds.length > 0) {
    await prisma.staffService.createMany({
      data: serviceIds.map((serviceId: string) => ({ staffId: params.id, serviceId })),
    });
  }
  return NextResponse.json({ success: true });
}

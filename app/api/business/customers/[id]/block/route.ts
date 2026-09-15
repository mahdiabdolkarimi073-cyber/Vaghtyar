import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const customer = await prisma.customer.findFirst({ where: { id: params.id, businessId } });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: { isBlocked: !customer.isBlocked },
  });
  return NextResponse.json(updated);
}

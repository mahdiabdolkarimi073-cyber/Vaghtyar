import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const customer = await prisma.customer.findFirst({ where: { id: params.id, businessId } });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: { isBlocked: !customer.isBlocked },
  });
  return NextResponse.json(updated);
}

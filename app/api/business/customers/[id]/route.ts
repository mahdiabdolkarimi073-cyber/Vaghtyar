import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId },
    include: { notes: { orderBy: { createdAt: 'desc' } } },
  });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();
  const customer = await prisma.customer.update({
    where: { id: params.id, businessId },
    data: { name: body.name, mobile: body.mobile, isBlocked: body.isBlocked },
  });
  return NextResponse.json(customer);
}

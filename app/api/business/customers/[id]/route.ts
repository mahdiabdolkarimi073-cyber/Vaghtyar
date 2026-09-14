import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId },
    include: { notes: { orderBy: { createdAt: 'desc' } } },
  });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const customer = await prisma.customer.update({
    where: { id: params.id, businessId },
    data: { name: body.name, mobile: body.mobile, isBlocked: body.isBlocked },
  });
  return NextResponse.json(customer);
}

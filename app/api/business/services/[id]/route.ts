import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const service = await prisma.service.update({
    where: { id: params.id, businessId },
    data: {
      name: body.name,
      durationMinutes: body.durationMinutes,
      price: body.price,
      description: body.description,
    },
  });
  return NextResponse.json(service);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const service = await prisma.service.update({
    where: { id: params.id, businessId },
    data: { isActive: body.isActive },
  });
  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  await prisma.service.delete({ where: { id: params.id, businessId } });
  return NextResponse.json({ success: true });
}

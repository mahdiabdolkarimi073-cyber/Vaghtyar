import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const appointment = await prisma.appointment.update({
    where: { id: params.id, businessId },
    data: { status: 'CANCELLED', cancelReason: body.reason },
  });
  return NextResponse.json(appointment);
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { status } = await req.json();
  const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'وضعیت نامعتبر' }, { status: 400 });

  const appointment = await prisma.appointment.update({
    where: { id: params.id, businessId },
    data: { status },
  });
  return NextResponse.json(appointment);
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });
  return NextResponse.json(appointment);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const appointment = await prisma.appointment.update({
    where: { id: params.id, businessId },
    data: {
      status: body.status,
      internalNote: body.internalNote,
      cancelReason: body.cancelReason,
    },
  });
  return NextResponse.json(appointment);
}

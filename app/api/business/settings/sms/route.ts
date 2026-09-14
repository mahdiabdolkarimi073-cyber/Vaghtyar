import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { confirmationSmsTemplate: true, reminderSmsTemplate: true },
  });
  return NextResponse.json(business);
}

export async function PUT(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const body = await req.json();
  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      confirmationSmsTemplate: body.confirmationSmsTemplate,
      reminderSmsTemplate: body.reminderSmsTemplate,
    },
  });
  return NextResponse.json(business);
}

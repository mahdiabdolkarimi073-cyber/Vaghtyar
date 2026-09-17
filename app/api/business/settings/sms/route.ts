import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { confirmationSmsTemplate: true, reminderSmsTemplate: true },
  });
  return NextResponse.json(business);
}

export async function PUT(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

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

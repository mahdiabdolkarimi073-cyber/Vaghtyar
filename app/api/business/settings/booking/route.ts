import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { autoApprove: true, minAdvanceHours: true, maxAdvanceDays: true, allowCustomerCancel: true, reminderHoursBefore: true },
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
      autoApprove: body.autoApprove,
      minAdvanceHours: body.minAdvanceHours,
      maxAdvanceDays: body.maxAdvanceDays,
      allowCustomerCancel: body.allowCustomerCancel,
      reminderHoursBefore: body.reminderHoursBefore,
    },
  });
  return NextResponse.json(business);
}

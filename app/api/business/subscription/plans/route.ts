import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
  return NextResponse.json(plans);
}

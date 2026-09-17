import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const payments = await prisma.payment.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true },
  });

  return NextResponse.json(
    payments.map((p) => ({
      id: p.id,
      planName: p.plan.name,
      amount: p.amount,
      status: p.status,
      refId: p.refId,
      createdAt: p.createdAt.toISOString(),
    }))
  );
}

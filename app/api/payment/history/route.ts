import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where = { businessId };
  const total = await prisma.payment.count({ where });
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { plan: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    payments: payments.map(p => ({
      id: p.id,
      planName: p.plan.name,
      amount: p.amount,
      status: p.status,
      refId: p.refId,
      paymentMethod: p.paymentMethod,
      paidAt: p.paidAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

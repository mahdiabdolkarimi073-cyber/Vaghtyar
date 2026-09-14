import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
  });

  const planIds = [...new Set(payments.map(p => p.planId))];
  const plans = await prisma.plan.findMany({ where: { id: { in: planIds } } });
  const planMap = new Map(plans.map(p => [p.id, p.name]));

  return NextResponse.json(payments.map(p => ({
    id: p.id,
    planName: planMap.get(p.planId) || 'نامشخص',
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  })));
}

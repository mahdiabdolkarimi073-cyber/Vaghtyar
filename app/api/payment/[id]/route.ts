import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const payment = await prisma.payment.findFirst({
    where: { id: params.id, businessId },
    include: { plan: true },
  });
  if (!payment) return NextResponse.json({ error: 'پرداخت یافت نشد' }, { status: 404 });

  return NextResponse.json({
    id: payment.id,
    planName: payment.plan.name,
    amount: payment.amount,
    status: payment.status,
    refId: payment.refId,
    transactionId: payment.transactionId,
    authority: payment.authority,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt?.toISOString() || null,
    createdAt: payment.createdAt.toISOString(),
  });
}

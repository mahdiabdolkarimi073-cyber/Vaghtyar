import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

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

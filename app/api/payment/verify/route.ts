import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { paymentId, authority, status } = await req.json();
  if (!paymentId) return NextResponse.json({ error: 'شناسه پرداخت الزامی است' }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.businessId !== businessId) {
    return NextResponse.json({ error: 'پرداخت یافت نشد' }, { status: 404 });
  }

  const result = await verifyPayment({ paymentId, authority, status });

  if (result.success) {
    const subscription = await prisma.subscription.findFirst({
      where: { businessId, isActive: true },
      include: { plan: true },
    });
    return NextResponse.json({ success: true, refId: result.refId, subscription });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 400 });
}

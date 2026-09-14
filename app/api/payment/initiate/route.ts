import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiatePayment } from '@/lib/payment-service';

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ error: 'شناسه پلن الزامی است' }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: 'پلن یافت نشد' }, { status: 404 });
  }

  const callbackUrl = process.env.ZARINPAL_CALLBACK_URL || `${req.nextUrl.origin}/payment/callback`;

  const result = await initiatePayment({
    businessId,
    planId,
    amount: plan.price,
    callbackUrl,
  });

  return NextResponse.json(result);
}

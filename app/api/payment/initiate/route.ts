import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiatePayment } from '@/lib/payment-service';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { subscriptionUpgradeSchema } from '@/lib/validations/schemas';

/**
 * POST /api/payment/initiate
 *
 * شروع پرداخت — قیمت فقط از دیتابیس خوانده می‌شود.
 * فیلدهای price، amount، discount از بدنه درخواست strip می‌شوند.
 */
export async function POST(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();

  // ─── اعتبارسنجی — فقط planId، نه price ───
  const parsed = subscriptionUpgradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'ورودی نامعتبر' },
      { status: 400 }
    );
  }

  // ─── قیمت را فقط از دیتابیس می‌خوانیم ───
  const plan = await prisma.plan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: 'پلن یافت نشد' }, { status: 404 });
  }

  const callbackUrl = process.env.ZARINPAL_CALLBACK_URL || `${req.nextUrl.origin}/payment/callback`;

  const result = await initiatePayment({
    businessId,
    planId: parsed.data.planId,
    amount: plan.price, // قیمت از دیتابیس
    callbackUrl,
  });

  return NextResponse.json(result);
}

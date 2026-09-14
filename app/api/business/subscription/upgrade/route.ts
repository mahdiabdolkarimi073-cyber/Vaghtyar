import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { subscriptionUpgradeSchema } from '@/lib/validations/schemas';

/**
 * POST /api/business/subscription/upgrade
 *
 * ارتقای اشتراک — قیمت فقط از دیتابیس خوانده می‌شود.
 * فیلدهای price، amount، discount از بدنه درخواست strip می‌شوند.
 */
export async function POST(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();

  // ─── اعتبارسنجی — فقط planId قبول می‌شود، price/amount strip می‌شوند ───
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
    return NextResponse.json({ error: 'پلن یافت نشد یا غیرفعال است' }, { status: 404 });
  }

  const existing = await prisma.subscription.findFirst({
    where: { businessId, isActive: true },
    include: { plan: true },
  });

  if (existing && existing.planId === parsed.data.planId) {
    return NextResponse.json({ error: 'شما در حال حاضر این پلن را دارید' }, { status: 400 });
  }

  if (existing && plan.price <= existing.plan.price) {
    return NextResponse.json({ error: 'ارتقا فقط به پلن بالاتر ممکن است' }, { status: 400 });
  }

  return NextResponse.json({
    plan,
    currentPlan: existing?.plan || null,
    amount: plan.price, // قیمت از دیتابیس
  });
}

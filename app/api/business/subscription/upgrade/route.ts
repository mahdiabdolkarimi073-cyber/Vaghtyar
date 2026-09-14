import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ error: 'شناسه پلن الزامی است' }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: 'پلن یافت نشد یا غیرفعال است' }, { status: 404 });
  }

  const existing = await prisma.subscription.findFirst({
    where: { businessId, isActive: true },
    include: { plan: true },
  });

  if (existing && existing.planId === planId) {
    return NextResponse.json({ error: 'شما در حال حاضر این پلن را دارید' }, { status: 400 });
  }

  if (existing && plan.price <= existing.plan.price) {
    return NextResponse.json({ error: 'ارتقا فقط به پلن بالاتر ممکن است' }, { status: 400 });
  }

  return NextResponse.json({
    plan,
    currentPlan: existing?.plan || null,
    amount: plan.price,
  });
}

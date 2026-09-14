import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSmsQuotaUsage } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const subscription = await prisma.subscription.findFirst({
    where: { businessId, isActive: true },
    include: { plan: true },
  });

  if (!subscription) {
    const freePlan = await prisma.plan.findFirst({
      where: { name: 'رایگان', isActive: true },
    });
    const smsQuota = await getSmsQuotaUsage(businessId);
    return NextResponse.json({
      subscription: freePlan
        ? {
            id: '',
            plan: freePlan,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            isActive: true,
            daysRemaining: 0,
            smsQuota,
          }
        : null,
    });
  }

  const now = new Date();
  const daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const smsQuota = await getSmsQuotaUsage(businessId);

  return NextResponse.json({
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      isActive: subscription.isActive,
      daysRemaining: Math.max(0, daysRemaining),
      smsQuota,
    },
  });
}

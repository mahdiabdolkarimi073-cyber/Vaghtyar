import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSmsQuotaUsage } from '@/lib/plan-limits';
import { getBusinessPlan } from '@/lib/subscription-service';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { subscription, plan, isFreePlan } = await getBusinessPlan(businessId);
  const smsQuota = await getSmsQuotaUsage(businessId);

  if (isFreePlan || !subscription) {
    return NextResponse.json({
      subscription: plan
        ? {
            id: '',
            plan,
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

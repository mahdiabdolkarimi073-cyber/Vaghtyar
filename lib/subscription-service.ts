import { prisma } from './prisma';

export async function getBusinessPlan(businessId: string) {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      businessId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { plan: true },
  });

  if (subscription) {
    return { subscription, plan: subscription.plan, isFreePlan: false };
  }

  const freePlan = await prisma.plan.findFirst({
    where: { name: 'رایگان', isActive: true },
  });
  return { subscription: null, plan: freePlan, isFreePlan: true };
}

export function hasActiveSubscription(
  subscription: { isActive: boolean; startDate: Date; endDate: Date } | null
): boolean {
  if (!subscription || !subscription.isActive) return false;
  const now = new Date();
  return subscription.startDate <= now && subscription.endDate >= now;
}

export async function getEffectivePlanId(businessId: string): Promise<string | null> {
  const { plan } = await getBusinessPlan(businessId);
  return plan?.id ?? null;
}

export async function activateSubscription(params: {
  businessId: string;
  planId: string;
  paymentId: string;
}) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const existing = await prisma.subscription.findUnique({
    where: { businessId: params.businessId },
  });

  if (existing) {
    const startFrom = existing.endDate > now ? existing.endDate : now;
    const newEnd = new Date(startFrom);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    return prisma.subscription.update({
      where: { businessId: params.businessId },
      data: {
        planId: params.planId,
        startDate: startFrom,
        endDate: newEnd,
        isActive: true,
        paymentId: params.paymentId,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      businessId: params.businessId,
      planId: params.planId,
      startDate: now,
      endDate,
      isActive: true,
      paymentId: params.paymentId,
    },
  });
}

import { prisma } from './prisma';

export async function activateSubscription({
  businessId,
  planId,
  paymentId,
}: {
  businessId: string;
  planId: string;
  paymentId: string;
}) {
  await prisma.subscription.updateMany({
    where: { businessId, isActive: true },
    data: { isActive: false },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const subscription = await prisma.subscription.create({
    data: {
      businessId,
      planId,
      startDate,
      endDate,
      isActive: true,
      paymentId,
    },
    include: { plan: true },
  });

  return subscription;
}

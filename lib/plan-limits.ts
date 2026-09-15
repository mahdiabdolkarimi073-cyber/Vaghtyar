import { prisma } from './prisma';
import { getBusinessPlan } from './subscription-service';

export { getBusinessPlan };

export type LimitType = 'maxServices' | 'maxStaff' | 'smsConfirmQuota';

export interface PlanLimitResult {
  allowed: boolean;
  limit: number | null;
  current: number;
  planName: string;
}

export async function checkPlanLimit(
  businessId: string,
  limitType: LimitType
): Promise<PlanLimitResult> {
  const { plan } = await getBusinessPlan(businessId);

  if (!plan) {
    return { allowed: true, limit: null, current: 0, planName: 'نامشخص' };
  }

  const limit = plan[limitType];

  if (limit === null) {
    return { allowed: true, limit: null, current: 0, planName: plan.name };
  }

  let current = 0;

  if (limitType === 'maxServices') {
    current = await prisma.service.count({ where: { businessId } });
  } else if (limitType === 'maxStaff') {
    current = await prisma.staff.count({ where: { businessId } });
  } else if (limitType === 'smsConfirmQuota') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    current = await prisma.smsLog.count({
      where: {
        businessId,
        smsType: 'APPOINTMENT_CONFIRM',
        status: { in: ['SIMULATED', 'SENT'] },
        createdAt: { gte: startOfMonth },
      },
    });
  }

  return {
    allowed: current < limit,
    limit,
    current,
    planName: plan.name,
  };
}

export async function getSmsQuotaUsage(businessId: string) {
  const { plan } = await getBusinessPlan(businessId);

  if (!plan) {
    return { used: 0, limit: 0, unlimited: false, planName: 'نامشخص' };
  }

  const limit = plan.smsConfirmQuota;
  if (limit === null) {
    return { used: 0, limit: null, unlimited: true, planName: plan.name };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.smsLog.count({
    where: {
      businessId,
      smsType: 'APPOINTMENT_CONFIRM',
      status: { in: ['SIMULATED', 'SENT'] },
      createdAt: { gte: startOfMonth },
    },
  });

  return { used, limit, unlimited: false, planName: plan.name };
}

// Subscription system has been removed. All plan limits and features are now unrestricted.

export const UNLIMITED = true;

export interface PlanLimitResult {
  allowed: boolean;
  limit: number | null;
  current: number;
  planName: string;
}

export async function checkPlanLimit(
  _businessId: string,
  _limitType: string
): Promise<PlanLimitResult> {
  return { allowed: true, limit: null, current: 0, planName: 'نامحدود' };
}

export async function checkPlanFeature(
  _businessId: string,
  _feature: string
): Promise<{ allowed: boolean; planName: string }> {
  return { allowed: true, planName: 'نامحدود' };
}

export async function getSmsQuotaUsage(_businessId: string) {
  return { used: 0, limit: null, unlimited: true, planName: 'نامحدود' };
}

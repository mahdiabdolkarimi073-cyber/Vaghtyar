import { NextRequest, NextResponse } from 'next/server';
import { checkPlanLimit, getSmsQuotaUsage } from '@/lib/plan-limits';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const [services, staff, smsQuota] = await Promise.all([
    checkPlanLimit(businessId, 'maxServices'),
    checkPlanLimit(businessId, 'maxStaff'),
    getSmsQuotaUsage(businessId),
  ]);

  return NextResponse.json({
    maxServices: services,
    maxStaff: staff,
    smsQuota,
  });
}

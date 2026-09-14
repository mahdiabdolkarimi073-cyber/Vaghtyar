import { NextRequest, NextResponse } from 'next/server';
import { checkPlanLimit, getSmsQuotaUsage } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

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

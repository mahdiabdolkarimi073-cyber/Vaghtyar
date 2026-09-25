import { NextRequest, NextResponse } from 'next/server';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  return NextResponse.json({
    maxServices: { allowed: true, limit: null, current: 0, planName: 'نامحدود' },
    maxStaff: { allowed: true, limit: null, current: 0, planName: 'نامحدود' },
    smsQuota: { used: 0, limit: null, unlimited: true, planName: 'نامحدود' },
  });
}

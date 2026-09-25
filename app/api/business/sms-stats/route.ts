import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalSent, totalSimulated, totalFailed, byTypeRaw] = await Promise.all([
    prisma.smsLog.count({ where: { businessId, status: 'SENT', createdAt: { gte: startOfMonth } } }),
    prisma.smsLog.count({ where: { businessId, status: 'SIMULATED', createdAt: { gte: startOfMonth } } }),
    prisma.smsLog.count({ where: { businessId, status: 'FAILED', createdAt: { gte: startOfMonth } } }),
    prisma.smsLog.groupBy({
      by: ['smsType'],
      where: { businessId, createdAt: { gte: startOfMonth } },
      _count: { smsType: true },
    }),
  ]);

  const byType: Record<string, number> = {
    APPOINTMENT_CONFIRM: 0,
    APPOINTMENT_REMINDER: 0,
    NEW_BOOKING_NOTIFY: 0,
    APPOINTMENT_CANCEL: 0,
  };
  for (const item of byTypeRaw) {
    byType[item.smsType] = item._count.smsType;
  }

  return NextResponse.json({
    totalSent,
    totalSimulated,
    totalFailed,
    quotaUsed: totalSent + totalSimulated,
    quotaLimit: null,
    quotaUnlimited: true,
    byType,
  });
}

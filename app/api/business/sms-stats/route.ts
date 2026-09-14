import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSmsQuotaUsage } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

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

  const quota = await getSmsQuotaUsage(businessId);

  return NextResponse.json({
    totalSent,
    totalSimulated,
    totalFailed,
    quotaUsed: quota.used,
    quotaLimit: quota.limit,
    quotaUnlimited: quota.unlimited,
    byType,
  });
}

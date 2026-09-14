import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const [totalSent, successful, failed] = await Promise.all([
      prisma.smsLog.count(),
      prisma.smsLog.count({ where: { status: 'SENT' } }),
      prisma.smsLog.count({ where: { status: 'FAILED' } }),
    ]);

    return NextResponse.json({
      totalSent,
      successful,
      failed,
      creditBalance: 0,
    });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

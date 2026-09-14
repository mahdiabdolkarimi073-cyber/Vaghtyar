import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let where: Record<string, unknown> = {};

    if (status === 'active') {
      where = {
        isActive: true,
        endDate: { gt: now },
      };
    } else if (status === 'expiring') {
      where = {
        isActive: true,
        endDate: { gt: now, lt: sevenDaysLater },
      };
    } else if (status === 'expired') {
      where = {
        endDate: { lt: now },
      };
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { endDate: 'desc' },
      include: {
        business: {
          select: { id: true, name: true },
        },
        plan: {
          select: { id: true, name: true, price: true },
        },
      },
    });

    return NextResponse.json(subscriptions);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

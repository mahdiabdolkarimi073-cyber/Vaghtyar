import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const body = await req.json();
    const { planId, extendDays, manualRenew } = body;

    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'اشتراک یافت نشد' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (planId !== undefined) {
      data.planId = planId;
    }

    if (extendDays !== undefined) {
      const newEndDate = new Date(existing.endDate);
      newEndDate.setDate(newEndDate.getDate() + extendDays);
      data.endDate = newEndDate;
    }

    if (manualRenew === true) {
      const now = new Date();
      const newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      data.endDate = newEndDate;
      data.isActive = true;
    }

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data,
      include: {
        business: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

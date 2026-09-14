import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const hours = await prisma.businessHours.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ hours });
  } catch (error) {
    console.error('Hours error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    if (business.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { hours } = body as { hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[] };

    if (!hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: 'داده ساعات کاری نامعتبر است' }, { status: 400 });
    }

    for (const h of hours) {
      await prisma.businessHours.updateMany({
        where: { businessId: business.id, dayOfWeek: h.dayOfWeek },
        data: {
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        },
      });
    }

    const updated = await prisma.businessHours.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ hours: updated });
  } catch (error) {
    console.error('Update hours error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

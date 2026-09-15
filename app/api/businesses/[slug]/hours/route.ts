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

    // Read from WorkingHours (single source of truth)
    let hours = await prisma.workingHours.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Fallback to BusinessHours if WorkingHours empty
    if (hours.length === 0) {
      const bh = await prisma.businessHours.findMany({
        where: { businessId: business.id },
        orderBy: { dayOfWeek: 'asc' },
      });
      hours = bh.map(b => ({
        id: b.id,
        businessId: b.businessId,
        dayOfWeek: b.dayOfWeek,
        isClosed: b.isClosed,
        startTime: b.openTime,
        endTime: b.closeTime,
      }));
    }

    return NextResponse.json({ hours: hours.map(h => ({
      id: h.id,
      businessId: h.businessId,
      dayOfWeek: h.dayOfWeek,
      openTime: h.startTime || '09:00',
      closeTime: h.endTime || '18:00',
      isClosed: h.isClosed,
    })) });
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

    // Write to WorkingHours (single source of truth) and sync to BusinessHours
    for (const h of hours) {
      await prisma.workingHours.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: h.dayOfWeek } },
        create: {
          businessId: business.id,
          dayOfWeek: h.dayOfWeek,
          isClosed: h.isClosed,
          startTime: h.openTime,
          endTime: h.closeTime,
        },
        update: {
          isClosed: h.isClosed,
          startTime: h.openTime,
          endTime: h.closeTime,
        },
      });
      await prisma.businessHours.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: h.dayOfWeek } },
        create: {
          businessId: business.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        },
        update: {
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        },
      });
    }

    const updated = await prisma.workingHours.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ hours: updated.map(h => ({
      id: h.id,
      businessId: h.businessId,
      dayOfWeek: h.dayOfWeek,
      openTime: h.startTime || '09:00',
      closeTime: h.endTime || '18:00',
      isClosed: h.isClosed,
    })) });
  } catch (error) {
    console.error('Update hours error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

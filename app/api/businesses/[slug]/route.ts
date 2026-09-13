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
      include: {
        services: true,
        staff: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
        owner: { select: { name: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const avgRating = business.reviews.length > 0
      ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
      : 0;

    // Check if currently open
    const now = new Date();
    const today = now.getDay();
    const todayHours = business.hours.find((h) => h.dayOfWeek === today);
    let isOpenNow = false;
    if (todayHours && !todayHours.isClosed) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = todayHours.openTime.split(':').map(Number);
      const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    return NextResponse.json({
      ...business,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: business.reviews.length,
      isOpenNow,
    });
  } catch (error) {
    console.error('Business detail error:', error);
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
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    if (business.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name, category, city, neighborhood, address, phone,
      coverImage, profileImage, description, isFeatured, autoConfirm,
      minAdvanceBookingHours,
    } = body;

    const updated = await prisma.business.update({
      where: { slug: params.slug },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(city !== undefined && { city }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(coverImage !== undefined && { coverImage }),
        ...(profileImage !== undefined && { profileImage }),
        ...(description !== undefined && { description }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(autoConfirm !== undefined && { autoConfirm }),
        ...(minAdvanceBookingHours !== undefined && { minAdvanceBookingHours }),
      },
    });

    return NextResponse.json({ business: updated });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

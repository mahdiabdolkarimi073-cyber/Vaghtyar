import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const iranianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

function getIranianDay(): number {
  return (new Date().getDay() + 1) % 7;
}

function isOpenToday(openTime: string, closeTime: string): boolean {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  return current >= openHour * 60 + openMinute && current < closeHour * 60 + closeMinute;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { businessName: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: decodeURIComponent(params.businessName) },
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true } },
        neighborhood: { select: { name: true } },
        services: { orderBy: { id: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' } },
        staff: { orderBy: { id: 'asc' } },
        galleryImages: { orderBy: { id: 'asc' } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'سالن مورد نظر پیدا نشد.' }, { status: 404 });
    }

    const todayHours = business.workingHours.find((hours) => hours.dayOfWeek === getIranianDay());
    const similarBusinesses = await prisma.business.findMany({
      where: {
        id: { not: business.id },
        categoryId: business.categoryId,
        neighborhoodId: business.neighborhoodId,
      },
      include: { category: { select: { name: true } }, neighborhood: { select: { name: true } } },
      orderBy: { rating: 'desc' },
      take: 4,
    });

    return NextResponse.json({
      business: {
        ...business,
        today: {
          day: iranianDays[getIranianDay()],
          openTime: todayHours?.openTime || null,
          closeTime: todayHours?.closeTime || null,
          isOpen: todayHours ? isOpenToday(todayHours.openTime, todayHours.closeTime) : false,
        },
        gallery: business.galleryImages.length > 0
          ? business.galleryImages
          : business.coverImage ? [{ id: 0, url: business.coverImage }] : [],
      },
      similarBusinesses,
    });
  } catch {
    return NextResponse.json({ error: 'دریافت اطلاعات سالن با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

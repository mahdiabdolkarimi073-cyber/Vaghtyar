import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: { id: true, category: true, city: true, neighborhood: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const similar = await prisma.business.findMany({
      where: {
        id: { not: business.id },
        OR: [
          { category: business.category, city: business.city },
          { neighborhood: business.neighborhood || undefined, city: business.city },
        ],
      },
      include: {
        services: { select: { price: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
    });

    const result = similar.map((b) => {
      const avgRating = b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
      const minPrice = b.services.length > 0
        ? Math.min(...b.services.map((s) => s.price))
        : 0;
      const { reviews, services, ...rest } = b;
      return {
        ...rest,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        minPrice,
      };
    });

    return NextResponse.json({ businesses: result });
  } catch (error) {
    console.error('Similar businesses error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const city = await prisma.city.findUnique({
      where: { slug: params.citySlug },
    });

    if (!city) {
      return NextResponse.json({ error: 'شهر یافت نشد' }, { status: 404 });
    }

    const businesses = await prisma.business.findMany({
      where: { city: params.citySlug },
      include: {
        services: { select: { price: true } },
        reviews: { select: { rating: true } },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    const categoriesInCity = await prisma.business.findMany({
      where: { city: params.citySlug },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = await prisma.category.findMany({
      where: { slug: { in: categoriesInCity.map((b) => b.category) } },
    });

    const result = businesses.map((b) => {
      const avgRating = b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
      const minPrice = b.services.length > 0
        ? Math.min(...b.services.map((s) => s.price))
        : 0;
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        category: b.category,
        neighborhood: b.neighborhood,
        coverImage: b.coverImage,
        isFeatured: b.isFeatured,
        isVerified: b.isVerified,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: b.reviews.length,
        minPrice,
      };
    });

    return NextResponse.json({
      city,
      categories,
      businesses: result,
    });
  } catch (error) {
    console.error('SEO city error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

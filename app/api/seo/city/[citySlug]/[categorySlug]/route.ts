import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { citySlug: string; categorySlug: string } }
) {
  try {
    const city = await prisma.city.findUnique({
      where: { slug: params.citySlug },
    });

    if (!city) {
      return NextResponse.json({ error: 'شهر یافت نشد' }, { status: 404 });
    }

    const category = await prisma.category.findUnique({
      where: { slug: params.categorySlug },
    });

    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    const businesses = await prisma.business.findMany({
      where: { city: params.citySlug, category: params.categorySlug },
      include: {
        services: { select: { price: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
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
      category,
      businesses: result,
    });
  } catch (error) {
    console.error('SEO city+category error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

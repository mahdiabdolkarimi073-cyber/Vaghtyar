import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        services: { select: { price: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
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
        city: b.city,
        neighborhood: b.neighborhood,
        coverImage: b.coverImage,
        profileImage: b.profileImage,
        isFeatured: b.isFeatured,
        isVerified: b.isVerified,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: b.reviews.length,
        minPrice,
      };
    });

    return NextResponse.json({ businesses: result });
  } catch (error) {
    console.error('Recent businesses error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

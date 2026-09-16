import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const neighborhood = searchParams.get('neighborhood');
    const isOpen = searchParams.get('isOpen');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) where.category = category;
    if (city) where.city = city;
    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    }

    const businesses = await prisma.business.findMany({
      where,
      include: {
        services: true,
        reviews: { select: { rating: true } },
        hours: true,
      },
      orderBy: sort === 'rating'
        ? undefined
        : sort === 'newest'
        ? { createdAt: 'desc' }
        : { name: 'asc' },
      skip,
      take: limit,
    });

    let result = businesses.map((b) => {
      const avgRating = b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
      const minServicePrice = b.services.length > 0
        ? Math.min(...b.services.map((s) => s.price))
        : 0;
      return {
        ...b,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: b.reviews.length,
        minPrice: minServicePrice,
      };
    });

    if (sort === 'rating') {
      result = result.sort((a, b) => b.avgRating - a.avgRating);
    }
    if (sort === 'price') {
      result = result.sort((a, b) => a.minPrice - b.minPrice);
    }
    if (minRating) {
      result = result.filter((b) => b.avgRating >= parseFloat(minRating));
    }
    if (maxPrice) {
      result = result.filter((b) => b.minPrice <= parseInt(maxPrice));
    }
    if (isOpen === 'true') {
      const now = new Date();
      const today = now.getDay();
      result = result.filter((b) => {
        const todayHours = b.hours.find((h) => h.dayOfWeek === today);
        return todayHours && !todayHours.isClosed;
      });
    }

    const total = await prisma.business.count({ where });

    return NextResponse.json({
      businesses: result.map(({ reviews, hours, ...b }) => b),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Businesses list error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, city, neighborhood, address, phone, description, latitude, longitude, profileImage } = body;

    if (!name || !category || !city) {
      return NextResponse.json({ error: 'نام، دسته‌بندی و شهر الزامی است' }, { status: 400 });
    }

    const slug = name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now().toString(36);

    const business = await prisma.business.create({
      data: {
        slug,
        name,
        category,
        city,
        neighborhood: neighborhood || null,
        address: address || null,
        phone: phone || null,
        description: description || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        profileImage: profileImage || null,
        coverImage: profileImage || null,
        photos: profileImage ? [profileImage] : [],
        ownerId: user.id,
      },
    });

    // Create default hours (closed all days)
    for (let day = 0; day < 7; day++) {
      await prisma.businessHours.create({
        data: {
          businessId: business.id,
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '17:00',
          isClosed: day === 5, // Friday closed
        },
      });
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

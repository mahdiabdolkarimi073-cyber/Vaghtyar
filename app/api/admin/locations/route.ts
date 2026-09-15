import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '');
}

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: { neighborhoods: { orderBy: { name: 'asc' } } },
    });

    const citiesWithCount = await Promise.all(
      cities.map(async (city) => {
        const businessCount = await prisma.business.count({
          where: { city: city.name },
        });
        return {
          ...city,
          businessCount,
          neighborhoods: city.neighborhoods.map((n) => ({
            ...n,
            businessCount: 0,
          })),
        };
      })
    );

    return NextResponse.json({ cities: citiesWithCount });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const body = await req.json();
    const { type, name, cityId } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 });
    }

    if (type === 'city') {
      const slug = slugify(name);
      const existing = await prisma.city.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'این شهر قبلاً وجود دارد' }, { status: 400 });
      }

      const city = await prisma.city.create({ data: { name, slug } });
      return NextResponse.json(city, { status: 201 });
    }

    if (type === 'neighborhood') {
      if (!cityId) {
        return NextResponse.json({ error: 'انتخاب شهر الزامی است' }, { status: 400 });
      }

      const slug = slugify(name);
      const existing = await prisma.neighborhood.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'این محله قبلاً وجود دارد' }, { status: 400 });
      }

      const neighborhood = await prisma.neighborhood.create({
        data: { name, slug, cityId },
      });
      return NextResponse.json(neighborhood, { status: 201 });
    }

    return NextResponse.json({ error: 'نوع نامعتبر است' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

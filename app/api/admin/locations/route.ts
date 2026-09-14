import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    // Cities with business count
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
    });

    const citiesWithCount = await Promise.all(
      cities.map(async (city) => {
        const count = await prisma.business.count({
          where: { city: city.name },
        });
        return {
          ...city,
          businessCount: count,
        };
      })
    );

    // Neighborhoods - distinct values with count
    const businesses = await prisma.business.findMany({
      where: {
        neighborhood: { not: null },
      },
      select: { neighborhood: true },
      distinct: ['neighborhood'],
    });

    const neighborhoods = await Promise.all(
      businesses
        .filter((b) => b.neighborhood)
        .map(async (b) => {
          const count = await prisma.business.count({
            where: { neighborhood: b.neighborhood! },
          });
          return {
            name: b.neighborhood!,
            businessCount: count,
          };
        })
    );

    return NextResponse.json({
      cities: citiesWithCount,
      neighborhoods,
    });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

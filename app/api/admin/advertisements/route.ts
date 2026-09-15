import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const advertisements = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(advertisements);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const { businessId, type, image, startDate, endDate, price } = await req.json();

    if (!businessId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'کسب‌وکار، نوع، تاریخ شروع و پایان الزامی است' },
        { status: 400 }
      );
    }

    const validTypes = ['FEATURED', 'BANNER'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع تبلیغات نامعتبر است' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const advertisement = await prisma.advertisement.create({
      data: {
        businessId,
        type,
        image,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: price || 0,
      },
      include: {
        business: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(advertisement, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

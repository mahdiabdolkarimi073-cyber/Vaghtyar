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
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Services error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(
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
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    if (business.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { name, durationMinutes, price, description } = body;

    if (!name || !durationMinutes || !price) {
      return NextResponse.json({ error: 'نام، مدت و قیمت الزامی است' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        durationMinutes: parseInt(durationMinutes),
        price: parseInt(price),
        description: description || null,
      },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

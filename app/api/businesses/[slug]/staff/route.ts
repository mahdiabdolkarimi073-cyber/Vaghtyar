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

    const staff = await prisma.staff.findMany({
      where: { businessId: business.id },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff error:', error);
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
    const { name, photo, specialty } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 });
    }

    const staff = await prisma.staff.create({
      data: {
        businessId: business.id,
        name,
        photo: photo || null,
        specialty: specialty || null,
      },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      include: {
        services: true,
        staff: true,
        owner: {
          select: { id: true, name: true, phone: true },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: {
            service: true,
            staff: true,
            customer: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const body = await req.json();
    const { status, name, category, neighborhood, isFeatured, isVerified } = body;

    const existing = await prisma.business.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (status !== undefined) {
      const validStatuses = ['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 });
      }
      data.status = status;
    }

    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (neighborhood !== undefined) data.neighborhood = neighborhood;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isVerified !== undefined) data.isVerified = isVerified;

    const updated = await prisma.business.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const existing = await prisma.business.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    await prisma.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'کسب‌وکار با موفقیت حذف شد' });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

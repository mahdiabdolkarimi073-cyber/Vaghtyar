import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const body = await req.json();
    const { endDate } = body;

    const existing = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'تبلیغات یافت نشد' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (endDate !== undefined) {
      data.endDate = new Date(endDate);
    }

    const updated = await prisma.advertisement.update({
      where: { id: params.id },
      data,
      include: {
        business: { select: { id: true, name: true } },
      },
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
    const existing = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'تبلیغات یافت نشد' }, { status: 404 });
    }

    await prisma.advertisement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'تبلیغات با موفقیت حذف شد' });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

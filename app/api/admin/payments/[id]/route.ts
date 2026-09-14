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
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        business: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'پرداخت یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const existing = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'پرداخت یافت نشد' }, { status: 404 });
    }

    if (existing.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'این پرداخت قبلاً بازگردانده شده است' },
        { status: 400 }
      );
    }

    const refunded = await prisma.payment.update({
      where: { id: params.id },
      data: { status: 'REFUNDED' },
      include: {
        business: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
    });

    return NextResponse.json(refunded);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

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
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        business: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true } },
        customer: { select: { id: true, name: true, mobile: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'رکورد یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

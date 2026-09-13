import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

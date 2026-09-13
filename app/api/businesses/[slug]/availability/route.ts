import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const staffId = searchParams.get('staffId');

    if (!dateStr) {
      return NextResponse.json({ error: 'تاریخ الزامی است' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    let serviceDuration = 30;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { durationMinutes: true },
      });
      if (service) serviceDuration = service.durationMinutes;
    }

    const date = new Date(dateStr + 'T00:00:00');
    const slots = await getAvailableSlots(
      business.id,
      date,
      serviceDuration,
      staffId || undefined
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

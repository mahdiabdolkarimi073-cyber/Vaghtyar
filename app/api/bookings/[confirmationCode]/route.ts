import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { confirmationCode: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: params.confirmationCode },
      include: {
        business: true,
        service: true,
        staff: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'رزرو یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

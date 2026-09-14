import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bookings/[code] — دریافت اطلاعات رزرو با کد تأیید (بدون نیاز به احراز هویت)
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: params.code },
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/bookings/[code]/cancel — لغو رزرو با کد تأیید (بدون نیاز به احراز هویت)
export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: params.code },
    });

    if (!booking) {
      return NextResponse.json({ error: 'رزرو یافت نشد' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'این رزرو قبلا لغو شده است' }, { status: 400 });
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'امکان لغو رزرو تکمیل شده وجود ندارد' }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

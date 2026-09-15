import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { mobileSchema } from '@/lib/validations/schemas';

// PUT /api/bookings/[code]/cancel — لغو رزرو با کد تأیید + شماره موبایل
export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 10, prefix: 'cancel' });
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const phone = typeof body.phone === 'string' ? body.phone : '';

    if (!phone || !mobileSchema.safeParse(phone).success) {
      return NextResponse.json(
        { error: 'شماره موبایل برای لغو رزرو الزامی است' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: params.code },
    });

    if (!booking) {
      return NextResponse.json({ error: 'رزرو یافت نشد' }, { status: 404 });
    }

    if (booking.customerPhone !== phone) {
      return NextResponse.json({ error: 'شماره موبایل با رزرو مطابقت ندارد' }, { status: 403 });
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

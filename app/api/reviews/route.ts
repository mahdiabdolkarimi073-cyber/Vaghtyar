import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, bookingId, customerName, rating, comment } = body;

    if (!businessId || !bookingId || !customerName || !rating) {
      return NextResponse.json({ error: 'تمامی فیلدهای الزامی باید پر شوند' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۵ باشد' }, { status: 400 });
    }

    // Check booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'رزرو یافت نشد' }, { status: 404 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'برای این رزرو قبلا نظر ثبت شده است' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        businessId,
        bookingId,
        customerName,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

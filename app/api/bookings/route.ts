import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateConfirmationCode } from '@/lib/constants';
import { sendSms } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessId,
      serviceId,
      staffId,
      customerName,
      customerPhone,
      customerNote,
      date,
      startTime,
    } = body;

    // Validation
    if (!businessId || !serviceId || !customerName || !customerPhone || !date || !startTime) {
      return NextResponse.json({ error: 'تمامی فیلدهای الزامی باید پر شوند' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(customerPhone)) {
      return NextResponse.json({ error: 'شماره موبایل نامعتبر است (فرمت: 09XXXXXXXXX)' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { hours: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.businessId !== businessId) {
      return NextResponse.json({ error: 'خدمت یافت نشد' }, { status: 404 });
    }

    // Calculate end time
    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startH * 60 + startM + service.durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const bookingDate = new Date(date + 'T00:00:00');

    // Check advance booking limit
    const bookingDateTime = new Date(date + 'T' + startTime + ':00');
    const now = new Date();
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < business.minAdvanceBookingHours) {
      return NextResponse.json(
        { error: `باید حداقل ${business.minAdvanceBookingHours} ساعت قبل رزرو کنید` },
        { status: 400 }
      );
    }

    // Check day is not closed
    const dayOfWeek = bookingDate.getDay();
    const dayHours = business.hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!dayHours || dayHours.isClosed) {
      return NextResponse.json({ error: 'در این روز کسب‌وکار تعطیر است' }, { status: 400 });
    }

    // Check slot is within business hours
    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    if (
      startH < openH || (startH === openH && startM < openM) ||
      endH > closeH || (endH === closeH && endM > closeM)
    ) {
      return NextResponse.json({ error: 'زمان انتخابی خارج از ساعات کاری است' }, { status: 400 });
    }

    // Check for double booking
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
        ...(staffId ? { staffId } : {}),
      },
    });

    const slotStartMin = startH * 60 + startM;
    const slotEndMin = endMinutes;

    for (const existing of existingBookings) {
      const [bStartH, bStartM] = existing.startTime.split(':').map(Number);
      const [bEndH, bEndM] = existing.endTime.split(':').map(Number);
      const existingStartMin = bStartH * 60 + bStartM;
      const existingEndMin = bEndH * 60 + bEndM;

      if (slotStartMin < existingEndMin && slotEndMin > existingStartMin) {
        return NextResponse.json({ error: 'این زمان قبلا رزرو شده است' }, { status: 400 });
      }
    }

    // Get optional customer
    let customerId: string | null = null;
    const user = await getUserFromRequest(req);
    if (user) {
      customerId = user.id;
    }

    // Generate confirmation code
    let confirmationCode = generateConfirmationCode();
    let codeExists = await prisma.booking.findUnique({ where: { confirmationCode } });
    while (codeExists) {
      confirmationCode = generateConfirmationCode();
      codeExists = await prisma.booking.findUnique({ where: { confirmationCode } });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        staffId: staffId || null,
        customerId,
        customerName,
        customerPhone,
        customerNote: customerNote || null,
        date: bookingDate,
        startTime,
        endTime,
        status: business.autoConfirm ? 'CONFIRMED' : 'PENDING',
        confirmationCode,
      },
      include: {
        service: true,
        business: true,
        staff: true,
      },
    });

    // Send SMS
    const statusText = booking.status === 'CONFIRMED' ? 'تایید شد' : 'در انتظار تایید است';
    const smsMessage = `${customerName} عزیز، نوبت شما در ${business.name} برای ${service.name} در تاریخ ${date} ساعت ${startTime} ${statusText}. کد پیگیری: ${confirmationCode}`;
    await sendSms(customerPhone, smsMessage);

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

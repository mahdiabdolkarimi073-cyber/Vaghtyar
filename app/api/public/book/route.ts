import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateConfirmationCode } from '@/lib/constants';
import { sendSms } from '@/lib/sms-service';
import { publicBookingSchema } from '@/lib/validations/schemas';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/public/book
 *
 * رزرو نوبت عمومی — بدون نیاز به احراز هویت یا ورود به سیستم.
 * مشتری فقط با شماره موبایل شناسایی می‌شود.
 *
 * اقدامات امنیتی:
 * - قیمت هرگز از بدنه درخواست قبول نمی‌شود — فقط از دیتابیس خوانده می‌شود
 * - اعتبارسنجی تمام فیلدها با zod
 * - جلوگیری از رزرو مضاعف با تراکنش و بررسی یکتایی
 * - فیلدهای price، subscriptionPlan، discount با .strip() حذف می‌شوند
 * - Rate limiting برای جلوگیری از اسپم
 */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 10, prefix: 'book' });
    if (limited) return limited;

    const body = await req.json();

    // اعتبارسنجی ورودی — فیلدهای ممنوعه strip می‌شوند
    const parsed = publicBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'ورودی نامعتبر' },
        { status: 400 }
      );
    }

    const {
      businessId,
      serviceId,
      staffId,
      customerName,
      customerPhone,
      customerNote,
      date,
      startTime,
    } = parsed.data;

    // بررسی وجود کسب‌وکار
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { hours: true, workingHours: true },
    });

    if (!business || business.status !== 'APPROVED') {
      return NextResponse.json({ error: 'کسب‌وکار یافت نشد یا فعال نیست' }, { status: 404 });
    }

    // ─── قیمت را فقط از دیتابیس می‌خوانیم — هرگز از کلاینت ───
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.businessId !== businessId || !service.isActive) {
      return NextResponse.json({ error: 'خدمت یافت نشد' }, { status: 404 });
    }

    // محاسبه زمان پایان از مدت خدمت در دیتابیس
    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startH * 60 + startM + service.durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const bookingDate = new Date(date + 'T00:00:00');

    // بررسی محدودیت رزرو زودهنگام
    const bookingDateTime = new Date(date + 'T' + startTime + ':00');
    const now = new Date();
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < business.minAdvanceBookingHours) {
      return NextResponse.json(
        { error: `باید حداقل ${business.minAdvanceBookingHours} ساعت قبل رزرو کنید` },
        { status: 400 }
      );
    }

    // بررسی تعطیل بودن روز — اولویت با WorkingHours (منبع حقیقت واحد)
    const dayOfWeek = bookingDate.getDay();
    let dayHours = business.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!dayHours) {
      const bh = business.hours.find((h) => h.dayOfWeek === dayOfWeek);
      if (bh) {
        dayHours = {
          id: bh.id,
          businessId: bh.businessId,
          dayOfWeek: bh.dayOfWeek,
          isClosed: bh.isClosed,
          startTime: bh.openTime,
          endTime: bh.closeTime,
        };
      }
    }
    if (!dayHours || dayHours.isClosed || !dayHours.startTime || !dayHours.endTime) {
      return NextResponse.json({ error: 'در این روز کسب‌وکار تعطیل است' }, { status: 400 });
    }

    // بررسی بازه ساعات کاری
    const [openH, openM] = dayHours.startTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.endTime.split(':').map(Number);
    if (
      startH < openH || (startH === openH && startM < openM) ||
      endH > closeH || (endH === closeH && endM > closeM)
    ) {
      return NextResponse.json({ error: 'زمان انتخابی خارج از ساعات کاری است' }, { status: 400 });
    }

    // ─── جلوگیری از رزرو مضاعف با تراکنش ───
    const result = await prisma.$transaction(async (tx) => {
      // ۱. بررسی نوبت موجود در همان بازه زمانی برای همان کارمند (در Booking)
      const conflict = await tx.booking.findFirst({
        where: {
          businessId,
          staffId: staffId || null,
          date: bookingDate,
          startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (conflict) {
        throw new Error('این زمان قبلاً رزرو شده است');
      }

      // ۱ب. بررسی نوبت موجود در همان بازه زمانی برای همان کارمند (در Appointment)
      const slotStartDateTime = new Date(date + 'T' + startTime + ':00');
      const slotEndDateTime = new Date(slotStartDateTime.getTime() + service.durationMinutes * 60000);

      const apptConflict = await tx.appointment.findFirst({
        where: {
          businessId,
          staffId: staffId || undefined,
          startTime: { lt: slotEndDateTime },
          endTime: { gt: slotStartDateTime },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (apptConflict) {
        throw new Error('این زمان قبلاً رزرو شده است');
      }

      // ۲. بررسی تداخل زمانی با نوبت‌های موجود (حتی با زمان‌های متفاوت)
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await tx.booking.findMany({
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
          throw new Error('این زمان با نوبت موجود تداخل دارد');
        }
      }

      // ۳. تولید کد تأیید یکتا
      let confirmationCode = generateConfirmationCode();
      let codeExists = await tx.booking.findUnique({ where: { confirmationCode } });
      while (codeExists) {
        confirmationCode = generateConfirmationCode();
        codeExists = await tx.booking.findUnique({ where: { confirmationCode } });
      }

      // ۴. ایجاد رزرو — قیمت از دیتابیس، نه از کلاینت
      return tx.booking.create({
        data: {
          businessId,
          serviceId,
          staffId: staffId || null,
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
    }).catch((err: Error) => {
      if (err.message === 'این زمان قبلاً رزرو شده است' || err.message === 'این زمان با نوبت موجود تداخل دارد') {
        return { _error: err.message };
      }
      throw err;
    });

    if (result && typeof result === 'object' && '_error' in result) {
      return NextResponse.json({ error: (result as { _error: string })._error }, { status: 400 });
    }

    const booking = result as Awaited<ReturnType<typeof prisma.booking.create>>;

    // ارسال SMS به مشتری در صورت تأیید خودکار
    if (booking.status === 'CONFIRMED') {
      await sendSms({
        businessId,
        recipientPhone: customerPhone,
        recipientType: 'CUSTOMER',
        smsType: 'APPOINTMENT_CONFIRM',
        templateData: {
          salonName: business.name,
          service: service.name,
          date,
          time: startTime,
          code: booking.confirmationCode,
        },
      });
    }

    // ارسال SMS به کسب‌وکار
    await sendSms({
      businessId,
      recipientPhone: business.phone || customerPhone,
      recipientType: 'BUSINESS',
      smsType: 'NEW_BOOKING_NOTIFY',
      templateData: {
        customerName,
        service: service.name,
        date,
        time: startTime,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Public booking error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

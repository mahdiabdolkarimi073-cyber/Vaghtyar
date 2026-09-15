import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 3, prefix: 'contact' });
    if (limited) return limited;

    const body = await req.json();
    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدها را پر کنید' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'نام نامعتبر است' },
        { status: 400 }
      );
    }

    if (typeof phone !== 'string' || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.length < 5 || message.length > 2000) {
      return NextResponse.json(
        { error: 'پیام باید بین ۵ تا ۲۰۰۰ کاراکتر باشد' },
        { status: 400 }
      );
    }

    await prisma.notification.create({
      data: {
        type: 'REVIEW_REPORTED',
        title: `پیام تماس از ${name}`,
        message: `موبایل: ${phone}\n${message}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

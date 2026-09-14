import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const forgotSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const business = await prisma.business.findFirst({ where: { email } });
    if (business) {
      // TODO: send reset email/SMS here
    }

    return NextResponse.json({
      message: 'در صورت وجود حساب، لینک بازنشانی رمز عبور ارسال خواهد شد',
    });
  } catch (error) {
    console.error('Business forgot password error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

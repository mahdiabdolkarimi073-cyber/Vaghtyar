import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signBusinessToken, setBusinessCookie } from '@/lib/business-auth';
import { rateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 5, prefix: 'biz-login' });
    if (limited) return limited;

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const business = await prisma.business.findFirst({ where: { email } });
    if (!business || !business.passwordHash) {
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, business.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    if (business.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'درخواست شما رد شده است. لطفاً با پشتیبانی تماس بگیرید' },
        { status: 403 }
      );
    }

    if (business.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'حساب شما معلق شده است. لطفاً با پشتیبانی تماس بگیرید' },
        { status: 403 }
      );
    }

    const token = signBusinessToken({ businessId: business.id, email: business.email! });
    const response = NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        slug: business.slug,
        category: business.category,
        city: business.city,
        neighborhood: business.neighborhood,
        address: business.address,
        phone: business.phone,
        status: business.status,
        ownerFirstName: business.ownerFirstName,
        ownerLastName: business.ownerLastName,
        ownerMobile: business.ownerMobile,
      },
    });
    setBusinessCookie(response, token);
    return response;
  } catch (error) {
    console.error('Business login error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

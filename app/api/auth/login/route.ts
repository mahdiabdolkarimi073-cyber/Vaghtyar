import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
  phone: z.string().min(1, 'شماره موبایل الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 5, prefix: 'login' });
    if (limited) return limited;

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const { phone, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

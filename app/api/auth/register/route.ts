import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, role } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'تمامی فیلدها الزامی هستند' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل نامعتبر است' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'این شماره قبلا ثبت شده است' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: role === 'BUSINESS_OWNER' ? 'BUSINESS_OWNER' : 'CUSTOMER',
      },
    });

    const token = await createSession(user.id);

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

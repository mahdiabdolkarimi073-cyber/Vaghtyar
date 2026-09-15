import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAdminToken, setAdminCookie } from '@/lib/admin-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 5, prefix: 'admin-login' });
    if (limited) return limited;

    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'شماره و رمز عبور الزامی است' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = signAdminToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
    setAdminCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

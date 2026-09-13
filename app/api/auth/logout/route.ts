import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 400 });
    }

    await prisma.session.deleteMany({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const user = await getAdminFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
  }
  return NextResponse.json({ user });
}

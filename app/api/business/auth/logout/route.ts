import { NextResponse } from 'next/server';
import { clearBusinessCookie } from '@/lib/business-auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearBusinessCookie(res);
  return res;
}

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required. Set it in .env');
  return secret;
}
const JWT_SECRET = getJwtSecret();
const ADMIN_COOKIE = 'admin_token';

export interface AdminJWTPayload {
  userId: string;
  role: string;
}

export function signAdminToken(payload: AdminJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
  } catch {
    return null;
  }
}

export function getAdminTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie) return cookie;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  return null;
}

export async function getAdminFromRequest(req: NextRequest) {
  const token = getAdminTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyAdminToken(token);
  if (!payload) return null;
  if (payload.role !== 'ADMIN') return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, phone: true, role: true },
  });
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export function adminUnauthorized(): NextResponse {
  return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
}

export function adminUnauthenticated(): NextResponse {
  return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
}

export function setAdminCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.delete(ADMIN_COOKIE);
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;

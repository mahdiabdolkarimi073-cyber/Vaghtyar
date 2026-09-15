import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required. Set it in .env');
  return secret;
}
const JWT_SECRET = getJwtSecret();
const COOKIE_NAME = 'business_token';

export interface BusinessJWTPayload {
  businessId: string;
  email: string;
}

export function signBusinessToken(payload: BusinessJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyBusinessToken(token: string): BusinessJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as BusinessJWTPayload;
  } catch {
    return null;
  }
}

export function getBusinessTokenFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) return token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  return null;
}

export async function getBusinessFromRequest(req: NextRequest) {
  const token = getBusinessTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyBusinessToken(token);
  if (!payload) return null;
  const business = await prisma.business.findUnique({
    where: { id: payload.businessId },
  select: {
      id: true,
      name: true,
      email: true,
      status: true,
      slug: true,
      ownerFirstName: true,
      ownerLastName: true,
    },
  });
  return business;
}

export function setBusinessCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearBusinessCookie(res: NextResponse) {
  res.cookies.delete(COOKIE_NAME);
}

export const BUSINESS_COOKIE_NAME = COOKIE_NAME;

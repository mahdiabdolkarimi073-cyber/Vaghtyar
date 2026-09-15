import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required. Set it in .env');
  return secret;
}
const JWT_SECRET = getJwtSecret();

export interface JWTPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export async function getUserFromRequest(req: NextRequest) {
  const token = extractTokenFromHeader(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return session.user;
}

export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const token = signToken({ userId, role: user?.role ?? 'CUSTOMER' });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await prisma.session.delete({ where: { token } });
  } catch {
    // session may already be deleted
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return session.user;
}

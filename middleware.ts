import { NextRequest, NextResponse } from 'next/server';

const BUSINESS_COOKIE = 'business_token';
const ADMIN_COOKIE = 'admin_token';

const PUBLIC_API_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/categories',
  '/api/cities',
  '/api/plans',
  '/api/business/auth/register',
  '/api/business/auth/login',
  '/api/business/auth/forgot-password',
  '/api/admin/auth/login',
  '/api/cron/send-reminders',
  '/api/public/book',
  '/api/bookings',
  '/api/businesses',
  '/api/contact',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1];
    const json = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin pages — check cookie existence
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookieToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-admin-id', decoded.userId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Protect business dashboard pages
  if (pathname.startsWith('/business/') && !pathname.startsWith('/business/login') && !pathname.startsWith('/business/register') && !pathname.startsWith('/business/forgot-password')) {
    const token = req.cookies.get(BUSINESS_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/business/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded || !decoded.businessId) {
      const loginUrl = new URL('/business/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-business-id', decoded.businessId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Admin API routes — check token and pass admin id
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    const cookieToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-admin-id', decoded.userId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Payment API routes — check business token
  if (pathname.startsWith('/api/payment/') && !pathname.startsWith('/api/payment/callback')) {
    const cookieToken = req.cookies.get(BUSINESS_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded || !decoded.businessId) {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-business-id', decoded.businessId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Business API routes — check business token
  if (pathname.startsWith('/api/business/') && !pathname.startsWith('/api/business/auth/')) {
    const cookieToken = req.cookies.get(BUSINESS_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    const decoded = decodeJwtPayload(token);
    if (!decoded || !decoded.businessId) {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-business-id', decoded.businessId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Customer API routes
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = decodeJwtPayload(token);
    if (decoded && decoded.userId) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', decoded.userId as string);
      requestHeaders.set('x-user-role', decoded.role as string);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/business/:path*', '/admin/:path*'],
};

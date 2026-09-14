import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nobetyar-dev-secret-change-me';
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
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin pages — check cookie OR Authorization header
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookieToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      if (decoded.role !== 'ADMIN') {
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
      }
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-admin-id', decoded.userId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect business dashboard pages
  if (pathname.startsWith('/business/') && !pathname.startsWith('/business/login') && !pathname.startsWith('/business/register') && !pathname.startsWith('/business/forgot-password')) {
    const token = req.cookies.get(BUSINESS_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/business/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { businessId: string };
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-business-id', decoded.businessId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL('/business/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Admin API routes — verify admin token from cookie OR Authorization header
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    const cookieToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
      }
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-admin-id', decoded.userId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }
  }

  // Payment API routes — verify business token from cookie OR Authorization header
  if (pathname.startsWith('/api/payment/') && !pathname.startsWith('/api/payment/callback')) {
    const cookieToken = req.cookies.get(BUSINESS_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { businessId: string };
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-business-id', decoded.businessId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }
  }

  // Business API routes — verify business token from cookie OR Authorization header
  if (pathname.startsWith('/api/business/') && !pathname.startsWith('/api/business/auth/')) {
    const cookieToken = req.cookies.get(BUSINESS_COOKIE)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { businessId: string };
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-business-id', decoded.businessId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }
  }

  // Customer API routes
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-role', decoded.role);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      // Token invalid, continue
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/business/:path*', '/admin/:path*'],
};

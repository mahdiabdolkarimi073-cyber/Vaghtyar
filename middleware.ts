import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nobetyar-dev-secret-change-me';
const BUSINESS_COOKIE = 'business_token';

const PUBLIC_API_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/categories',
  '/api/cities',
  '/api/business/auth/register',
  '/api/business/auth/login',
  '/api/business/auth/forgot-password',
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

  // Protect business dashboard pages (server-side redirect)
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

  // Only intercept API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Business API routes — verify business token from cookie
  if (pathname.startsWith('/api/business/') && !pathname.startsWith('/api/business/auth/')) {
    const token = req.cookies.get(BUSINESS_COOKIE)?.value;
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

  // Customer API routes — pass token through
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
      // Token invalid, but continue — route handler will handle auth
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/business/:path*'],
};

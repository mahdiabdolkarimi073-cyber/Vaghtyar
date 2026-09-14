import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'nobetyar-dev-secret-change-me';
const BUSINESS_COOKIE = 'business_token';

/**
 * استخراج businessId از توکن JWT در درخواست.
 * توکن می‌تواند از کوکی HttpOnly یا هدر Authorization باشد.
 * هرگز businessId را از بدنه درخواست یا پارامتر کوئری قبول نمی‌کنیم — فقط از JWT.
 *
 * @returns businessId معتبر یا null اگر توکن نامعتبر باشد
 */
export function getBusinessId(req: NextRequest): string | null {
  // اولویت اول: کوکی HttpOnly
  const cookieToken = req.cookies.get(BUSINESS_COOKIE)?.value;
  // اولویت دوم: هدر Authorization Bearer
  const authHeader = req.headers.get('authorization');
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  const token = cookieToken || bearerToken;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { businessId?: string };
    if (!decoded.businessId) return null;
    return decoded.businessId;
  } catch {
    return null;
  }
}

/**
 * نسخه‌ای از getBusinessId که در صورت نبودن توکن، پاسخ 401 برمی‌گرداند.
 * مناسب استفاده در ابتدای هر route handler محافظت‌شده.
 */
export function requireBusinessId(req: NextRequest): string | null {
  const businessId = getBusinessId(req);
  return businessId;
}

/**
 * پاسخ استاندارد 401 برای زمانی که businessId در دسترس نیست.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });
}

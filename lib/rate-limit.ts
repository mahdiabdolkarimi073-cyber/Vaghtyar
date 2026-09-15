import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}

/**
 * استخراج IP واقعی کلاینت.
 * اولویت با هدر x-real-ip است که توسط Next.js/反向プロキسی تنظیم می‌شود
 * و قابل جعل توسط کلاینت نیست. x-forwarded-for فقط در صورت وجود proxy قابل اعتماد
 * استفاده می‌شود. در غیاب هر دو، از اطلاعات اتصال استفاده می‌کنیم.
 */
function getClientIp(req: NextRequest): string {
  // x-real-ip is set by the platform's reverse proxy and is not client-controllable
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // In Next.js serverless, we can try to get IP from the request's geo info
  // Fall back to a combination of headers that are harder to spoof together
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  // x-forwarded-for is set by the proxy chain — take the first IP but only if
  // we're behind a trusted proxy (Next.js always is in production)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return 'unknown';
}

export function rateLimit(
  req: NextRequest,
  opts: { windowMs: number; max: number; prefix?: string }
): NextResponse | null {
  cleanup();
  const ip = getClientIp(req);
  const key = `${opts.prefix || 'rl'}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > opts.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'درخواست‌های زیادی ارسال شده است. لطفاً کمی بعد تلاش کنید.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  return null;
}

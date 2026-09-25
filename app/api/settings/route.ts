import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PUBLIC_KEYS = [
  'site_name',
  'site_tagline',
  'site_logo',
  'contact_phone',
  'contact_email',
  'contact_address',
  'booking_fee',
];

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });
    const result: Record<string, string> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

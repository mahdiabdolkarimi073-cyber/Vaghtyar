import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = !!(process.env.SMS_API_KEY && process.env.SMS_PROVIDER);
  return NextResponse.json({ isConfigured });
}

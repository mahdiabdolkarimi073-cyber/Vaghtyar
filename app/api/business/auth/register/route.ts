import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signBusinessToken, setBusinessCookie } from '@/lib/business-auth';
import { rateLimit } from '@/lib/rate-limit';

const registerSchema = z.object({
  ownerFirstName: z.string().min(1, 'نام صاحب کسب‌وکار الزامی است'),
  ownerLastName: z.string().min(1, 'نام خانوادگی صاحب کسب‌وکار الزامی است'),
  ownerMobile: z.string().min(1, 'موبایل صاحب کسب‌وکار الزامی است'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  name: z.string().min(1, 'نام کسب‌وکار الزامی است'),
  category: z.string().min(1, 'دسته‌بندی الزامی است'),
  city: z.string().optional().default('کرمان'),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

function generateSlug(name: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safeName || 'business'}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { windowMs: 60_000, max: 3, prefix: 'biz-register' });
    if (limited) return limited;
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingBusiness = await prisma.business.findFirst({ where: { email: data.email } });
    if (existingBusiness) {
      return NextResponse.json({ error: 'این ایمیل قبلا ثبت شده است' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone: data.ownerMobile } });
    if (existingUser) {
      return NextResponse.json({ error: 'این شماره موبایل قبلا ثبت شده است' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: `${data.ownerFirstName} ${data.ownerLastName}`,
        phone: data.ownerMobile,
        passwordHash,
        role: 'BUSINESS_OWNER',
      },
    });

    let slug = generateSlug(data.name);
    let slugExists = await prisma.business.findUnique({ where: { slug } });
    while (slugExists) {
      slug = generateSlug(data.name);
      slugExists = await prisma.business.findUnique({ where: { slug } });
    }

    const business = await prisma.business.create({
      data: {
        ownerFirstName: data.ownerFirstName,
        ownerLastName: data.ownerLastName,
        ownerMobile: data.ownerMobile,
        email: data.email,
        passwordHash,
        name: data.name,
        slug,
        category: data.category,
        city: data.city,
        neighborhood: data.neighborhood,
        address: data.address,
        phone: data.phone,
        status: 'PENDING',
        ownerId: user.id,
      },
    });

    const token = signBusinessToken({ businessId: business.id, email: business.email! });
    const response = NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        slug: business.slug,
        category: business.category,
        city: business.city,
        status: business.status,
      },
    });
    setBusinessCookie(response, token);
    return response;
  } catch (error) {
    console.error('Business register error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

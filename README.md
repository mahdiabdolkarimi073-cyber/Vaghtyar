# نوبت‌یار (Nobetyar)

پلتفرم رزرو آنلاین نوبت برای سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌ها در سراسر ایران.

## تکنولوژی‌ها

- **Frontend & Backend**: Next.js 13 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT با ذخیره سشن در دیتابیس
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Calendar**: date-fns-jalali (تقویم شمسی)
- **Map**: Leaflet + OpenStreetMap

## راه‌اندازی

### ۱. نصب وابستگی‌ها

```bash
npm install
```

### ۲. تنظیم متغیرهای محیطی

فایل `.env` را با مقادیر زیر ایجاد کنید:

```
DATABASE_URL="postgresql://user:password@localhost:5432/nobetyar"
JWT_SECRET="your-secret-key"
```

### ۳. راه‌اندازی دیتابیس

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### ۴. اجرای پروژه

```bash
npm run dev
```

## ساختار پروژه

```
/app               صفحات و API routes
/app/api           Backend API handlers
/prisma            Schema و seed
/components        کامپوننت‌های قابل استفاده مجدد
/lib               توابع کمکی
/middleware.ts     احراز هویت JWT
```

## امکانات

- رزرو آنلاین نوبت با تقویم شمسی
- جستجوی کسب‌وکارها با فیلتر و مرتب‌سازی
- صفحه پروفایل کسب‌وکار با نقشه
- پنل مدیریت صاحبان کسب‌وکار (مدیریت خدمات، متخصصین، ساعات کاری)
- ثبت‌نام و ورود کاربران
- سیستم نظرات و امتیازدهی
- صفحات SEO برای شهرها و دسته‌بندی‌ها
- پیامک شبیه‌سازی‌شده

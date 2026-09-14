/*
# Create full application schema for Nobetyar

Creates all tables for the booking platform: users, businesses, appointments,
payments, subscriptions, advertisements, settings, notifications, SMS logs.
RLS enabled on all tables with anon+authenticated access for public data
and authenticated access for business data.
*/

-- Enums
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('CUSTOMER','BUSINESS_OWNER','ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "BusinessStatus" AS ENUM ('PENDING','APPROVED','REJECTED','SUSPENDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING','CONFIRMED','COMPLETED','NO_SHOW','CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AppointmentSource" AS ENUM ('ONLINE','MANUAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AdType" AS ENUM ('FEATURED','BANNER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "SmsStatus" AS ENUM ('SENT','FAILED','PENDING'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "NotificationType" AS ENUM ('BUSINESS_REGISTERED','PAYMENT_RECEIVED','SUBSCRIPTION_EXPIRING','REVIEW_REPORTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL, role "Role" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Session
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL, "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Category
CREATE TABLE IF NOT EXISTS "Category" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT, image TEXT
);

-- City
CREATE TABLE IF NOT EXISTS "City" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL
);

-- Business
CREATE TABLE IF NOT EXISTS "Business" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
  "categoryId" TEXT REFERENCES "Category"(id),
  city TEXT NOT NULL DEFAULT 'کرمان', neighborhood TEXT, address TEXT,
  phone TEXT, email TEXT, "coverImage" TEXT, "profileImage" TEXT,
  photos TEXT[] DEFAULT '{}', description TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false, "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "autoConfirm" BOOLEAN NOT NULL DEFAULT false, "autoApprove" BOOLEAN NOT NULL DEFAULT false,
  "minAdvanceBookingHours" INTEGER NOT NULL DEFAULT 2, "minAdvanceHours" INTEGER NOT NULL DEFAULT 1,
  "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30, "allowCustomerCancel" BOOLEAN NOT NULL DEFAULT true,
  "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
  "confirmationSmsTemplate" TEXT, "reminderSmsTemplate" TEXT,
  status "BusinessStatus" NOT NULL DEFAULT 'PENDING', "passwordHash" TEXT,
  "ownerFirstName" TEXT, "ownerLastName" TEXT, "ownerMobile" TEXT,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ownerId" TEXT NOT NULL REFERENCES "User"(id)
);
CREATE INDEX IF NOT EXISTS "Business_ownerId_idx" ON "Business"("ownerId");

-- BusinessHours
CREATE TABLE IF NOT EXISTS "BusinessHours" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL, "openTime" TEXT NOT NULL, "closeTime" TEXT NOT NULL,
  "isClosed" BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS "BusinessHours_businessId_idx" ON "BusinessHours"("businessId");

-- WorkingHours
CREATE TABLE IF NOT EXISTS "WorkingHours" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL, "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "startTime" TEXT, "endTime" TEXT
);
CREATE INDEX IF NOT EXISTS "WorkingHours_businessId_idx" ON "WorkingHours"("businessId");

-- Holiday
CREATE TABLE IF NOT EXISTS "Holiday" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  date timestamptz NOT NULL, reason TEXT
);
CREATE INDEX IF NOT EXISTS "Holiday_businessId_idx" ON "Holiday"("businessId");

-- Staff
CREATE TABLE IF NOT EXISTS "Staff" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  name TEXT NOT NULL, photo TEXT, specialty TEXT, bio TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS "Staff_businessId_idx" ON "Staff"("businessId");

-- Service
CREATE TABLE IF NOT EXISTS "Service" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  name TEXT NOT NULL, "durationMinutes" INTEGER NOT NULL, price INTEGER NOT NULL,
  description TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "Service_businessId_idx" ON "Service"("businessId");

-- StaffService
CREATE TABLE IF NOT EXISTS "StaffService" (
  "staffId" TEXT NOT NULL REFERENCES "Staff"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  PRIMARY KEY ("staffId","serviceId")
);

-- StaffWorkingHours
CREATE TABLE IF NOT EXISTS "StaffWorkingHours" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "staffId" TEXT NOT NULL REFERENCES "Staff"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL, "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "startTime" TEXT, "endTime" TEXT, "useBusinessDefault" BOOLEAN NOT NULL DEFAULT true
);

-- Booking
CREATE TABLE IF NOT EXISTS "Booking" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id),
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
  "staffId" TEXT REFERENCES "Staff"(id), "customerId" TEXT REFERENCES "User"(id),
  "customerName" TEXT NOT NULL, "customerPhone" TEXT NOT NULL, "customerNote" TEXT,
  date timestamptz NOT NULL, "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL,
  status "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "confirmationCode" TEXT UNIQUE NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Booking_businessId_idx" ON "Booking"("businessId");
CREATE INDEX IF NOT EXISTS "Booking_staffId_idx" ON "Booking"("staffId");
CREATE INDEX IF NOT EXISTS "Booking_customerId_idx" ON "Booking"("customerId");

-- Customer (must come before Appointment)
CREATE TABLE IF NOT EXISTS "Customer" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  name TEXT NOT NULL, mobile TEXT NOT NULL, "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Customer_businessId_idx" ON "Customer"("businessId");

-- CustomerNote
CREATE TABLE IF NOT EXISTS "CustomerNote" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  content TEXT NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Appointment
CREATE TABLE IF NOT EXISTS "Appointment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "customerId" TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
  "staffId" TEXT NOT NULL REFERENCES "Staff"(id),
  "startTime" timestamptz NOT NULL, "endTime" timestamptz NOT NULL,
  status "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  source "AppointmentSource" NOT NULL DEFAULT 'ONLINE',
  "internalNote" TEXT, "cancelReason" TEXT,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Appointment_businessId_idx" ON "Appointment"("businessId");
CREATE INDEX IF NOT EXISTS "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX IF NOT EXISTS "Appointment_staffId_idx" ON "Appointment"("staffId");

-- Review
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id) ON DELETE CASCADE,
  "bookingId" TEXT UNIQUE NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "customerName" TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT,
  "businessReply" TEXT, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Review_businessId_idx" ON "Review"("businessId");

-- SmsLog
CREATE TABLE IF NOT EXISTS "SmsLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phone TEXT NOT NULL, message TEXT NOT NULL,
  status "SmsStatus" NOT NULL DEFAULT 'SENT', type TEXT,
  "sentAt" timestamptz NOT NULL DEFAULT now()
);

-- Plan
CREATE TABLE IF NOT EXISTS "Plan" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL, price INTEGER NOT NULL, "maxStaff" INTEGER NOT NULL,
  "maxServices" INTEGER NOT NULL, "hasSms" BOOLEAN NOT NULL DEFAULT false,
  "hasReports" BOOLEAN NOT NULL DEFAULT false, "hasCustomSms" BOOLEAN NOT NULL DEFAULT false,
  "hasApi" BOOLEAN NOT NULL DEFAULT false, "hasPriority" BOOLEAN NOT NULL DEFAULT false
);

-- Subscription
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT UNIQUE NOT NULL REFERENCES "Business"(id),
  "planId" TEXT NOT NULL REFERENCES "Plan"(id),
  "startDate" timestamptz NOT NULL, "endDate" timestamptz NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- Payment
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id),
  "planId" TEXT NOT NULL REFERENCES "Plan"(id),
  amount INTEGER NOT NULL, status "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Setting
CREATE TABLE IF NOT EXISTS "Setting" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL, value TEXT NOT NULL,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Advertisement
CREATE TABLE IF NOT EXISTS "Advertisement" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL REFERENCES "Business"(id),
  type "AdType" NOT NULL, "startDate" timestamptz NOT NULL, "endDate" timestamptz NOT NULL,
  price DOUBLE PRECISION NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type "NotificationType" NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkingHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Holiday" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffWorkingHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "City" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SmsLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Advertisement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon+authenticated)
DROP POLICY IF EXISTS "anon_read_categories" ON "Category";
CREATE POLICY "anon_read_categories" ON "Category" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_cities" ON "City";
CREATE POLICY "anon_read_cities" ON "City" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_plans" ON "Plan";
CREATE POLICY "anon_read_plans" ON "Plan" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_businesses" ON "Business";
CREATE POLICY "anon_read_businesses" ON "Business" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_services" ON "Service";
CREATE POLICY "anon_read_services" ON "Service" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_staff" ON "Staff";
CREATE POLICY "anon_read_staff" ON "Staff" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_hours" ON "BusinessHours";
CREATE POLICY "anon_read_hours" ON "BusinessHours" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_wh" ON "WorkingHours";
CREATE POLICY "anon_read_wh" ON "WorkingHours" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_holidays" ON "Holiday";
CREATE POLICY "anon_read_holidays" ON "Holiday" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_reviews" ON "Review";
CREATE POLICY "anon_read_reviews" ON "Review" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_swh" ON "StaffWorkingHours";
CREATE POLICY "anon_read_swh" ON "StaffWorkingHours" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_ss" ON "StaffService";
CREATE POLICY "anon_read_ss" ON "StaffService" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_read_bookings" ON "Booking";
CREATE POLICY "anon_read_bookings" ON "Booking" FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bookings" ON "Booking";
CREATE POLICY "anon_insert_bookings" ON "Booking" FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bookings" ON "Booking";
CREATE POLICY "anon_update_bookings" ON "Booking" FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Authenticated CRUD for business-managed tables
DROP POLICY IF EXISTS "auth_biz_insert" ON "Business";
CREATE POLICY "auth_biz_insert" ON "Business" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_biz_update" ON "Business";
CREATE POLICY "auth_biz_update" ON "Business" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_biz_delete" ON "Business";
CREATE POLICY "auth_biz_delete" ON "Business" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_bh_write" ON "BusinessHours";
CREATE POLICY "auth_bh_write" ON "BusinessHours" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_bh_update" ON "BusinessHours";
CREATE POLICY "auth_bh_update" ON "BusinessHours" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_bh_delete" ON "BusinessHours";
CREATE POLICY "auth_bh_delete" ON "BusinessHours" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_wh_write" ON "WorkingHours";
CREATE POLICY "auth_wh_write" ON "WorkingHours" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_wh_update" ON "WorkingHours";
CREATE POLICY "auth_wh_update" ON "WorkingHours" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_wh_delete" ON "WorkingHours";
CREATE POLICY "auth_wh_delete" ON "WorkingHours" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_hol_write" ON "Holiday";
CREATE POLICY "auth_hol_write" ON "Holiday" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_hol_update" ON "Holiday";
CREATE POLICY "auth_hol_update" ON "Holiday" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_hol_delete" ON "Holiday";
CREATE POLICY "auth_hol_delete" ON "Holiday" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_staff_write" ON "Staff";
CREATE POLICY "auth_staff_write" ON "Staff" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_staff_update" ON "Staff";
CREATE POLICY "auth_staff_update" ON "Staff" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_staff_delete" ON "Staff";
CREATE POLICY "auth_staff_delete" ON "Staff" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_svc_write" ON "Service";
CREATE POLICY "auth_svc_write" ON "Service" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_svc_update" ON "Service";
CREATE POLICY "auth_svc_update" ON "Service" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_svc_delete" ON "Service";
CREATE POLICY "auth_svc_delete" ON "Service" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_ss_write" ON "StaffService";
CREATE POLICY "auth_ss_write" ON "StaffService" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_ss_delete" ON "StaffService";
CREATE POLICY "auth_ss_delete" ON "StaffService" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_swh_write" ON "StaffWorkingHours";
CREATE POLICY "auth_swh_write" ON "StaffWorkingHours" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_swh_update" ON "StaffWorkingHours";
CREATE POLICY "auth_swh_update" ON "StaffWorkingHours" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_swh_delete" ON "StaffWorkingHours";
CREATE POLICY "auth_swh_delete" ON "StaffWorkingHours" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_app_select" ON "Appointment";
CREATE POLICY "auth_app_select" ON "Appointment" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_app_insert" ON "Appointment";
CREATE POLICY "auth_app_insert" ON "Appointment" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_app_update" ON "Appointment";
CREATE POLICY "auth_app_update" ON "Appointment" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_app_delete" ON "Appointment";
CREATE POLICY "auth_app_delete" ON "Appointment" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_cust_select" ON "Customer";
CREATE POLICY "auth_cust_select" ON "Customer" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_cust_insert" ON "Customer";
CREATE POLICY "auth_cust_insert" ON "Customer" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_cust_update" ON "Customer";
CREATE POLICY "auth_cust_update" ON "Customer" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_cust_delete" ON "Customer";
CREATE POLICY "auth_cust_delete" ON "Customer" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_cn_select" ON "CustomerNote";
CREATE POLICY "auth_cn_select" ON "CustomerNote" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_cn_insert" ON "CustomerNote";
CREATE POLICY "auth_cn_insert" ON "CustomerNote" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_cn_delete" ON "CustomerNote";
CREATE POLICY "auth_cn_delete" ON "CustomerNote" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_rev_insert" ON "Review";
CREATE POLICY "auth_rev_insert" ON "Review" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_rev_update" ON "Review";
CREATE POLICY "auth_rev_update" ON "Review" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_rev_delete" ON "Review";
CREATE POLICY "auth_rev_delete" ON "Review" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_sms_select" ON "SmsLog";
CREATE POLICY "auth_sms_select" ON "SmsLog" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_sms_insert" ON "SmsLog";
CREATE POLICY "auth_sms_insert" ON "SmsLog" FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_sub_select" ON "Subscription";
CREATE POLICY "auth_sub_select" ON "Subscription" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_sub_insert" ON "Subscription";
CREATE POLICY "auth_sub_insert" ON "Subscription" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_sub_update" ON "Subscription";
CREATE POLICY "auth_sub_update" ON "Subscription" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_sub_delete" ON "Subscription";
CREATE POLICY "auth_sub_delete" ON "Subscription" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_pay_select" ON "Payment";
CREATE POLICY "auth_pay_select" ON "Payment" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_pay_insert" ON "Payment";
CREATE POLICY "auth_pay_insert" ON "Payment" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_pay_update" ON "Payment";
CREATE POLICY "auth_pay_update" ON "Payment" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_set_select" ON "Setting";
CREATE POLICY "auth_set_select" ON "Setting" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_set_insert" ON "Setting";
CREATE POLICY "auth_set_insert" ON "Setting" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_set_update" ON "Setting";
CREATE POLICY "auth_set_update" ON "Setting" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_ad_select" ON "Advertisement";
CREATE POLICY "auth_ad_select" ON "Advertisement" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ad_insert" ON "Advertisement";
CREATE POLICY "auth_ad_insert" ON "Advertisement" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_ad_update" ON "Advertisement";
CREATE POLICY "auth_ad_update" ON "Advertisement" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_ad_delete" ON "Advertisement";
CREATE POLICY "auth_ad_delete" ON "Advertisement" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_notif_select" ON "Notification";
CREATE POLICY "auth_notif_select" ON "Notification" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_notif_insert" ON "Notification";
CREATE POLICY "auth_notif_insert" ON "Notification" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_notif_update" ON "Notification";
CREATE POLICY "auth_notif_update" ON "Notification" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_notif_delete" ON "Notification";
CREATE POLICY "auth_notif_delete" ON "Notification" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_cat_write" ON "Category";
CREATE POLICY "auth_cat_write" ON "Category" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_cat_update" ON "Category";
CREATE POLICY "auth_cat_update" ON "Category" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_cat_delete" ON "Category";
CREATE POLICY "auth_cat_delete" ON "Category" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_city_write" ON "City";
CREATE POLICY "auth_city_write" ON "City" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_city_update" ON "City";
CREATE POLICY "auth_city_update" ON "City" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_city_delete" ON "City";
CREATE POLICY "auth_city_delete" ON "City" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_user_select" ON "User";
CREATE POLICY "auth_user_select" ON "User" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_user_insert" ON "User";
CREATE POLICY "auth_user_insert" ON "User" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_user_update" ON "User";
CREATE POLICY "auth_user_update" ON "User" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_user_delete" ON "User";
CREATE POLICY "auth_user_delete" ON "User" FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_session_select" ON "Session";
CREATE POLICY "auth_session_select" ON "Session" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_session_insert" ON "Session";
CREATE POLICY "auth_session_insert" ON "Session" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_session_delete" ON "Session";
CREATE POLICY "auth_session_delete" ON "Session" FOR DELETE TO authenticated USING (true);

-- Seed plans
INSERT INTO "Plan" (id, name, price, "maxStaff", "maxServices", "hasSms", "hasReports", "hasCustomSms", "hasApi", "hasPriority")
VALUES
  (gen_random_uuid()::text, 'رایگان', 0, 1, 3, false, false, false, false, false),
  (gen_random_uuid()::text, 'پایه', 99000, 3, 10, true, false, false, false, false),
  (gen_random_uuid()::text, 'حرفه‌ای', 199000, 10, 50, true, true, true, false, false),
  (gen_random_uuid()::text, 'سازمانی', 499000, 999, 999, true, true, true, true, true)
ON CONFLICT DO NOTHING;

-- Seed settings
INSERT INTO "Setting" (id, key, value) VALUES
  (gen_random_uuid()::text, 'site_name', 'نوبت‌یار'),
  (gen_random_uuid()::text, 'site_tagline', 'رزرو آنلاین نوبت'),
  (gen_random_uuid()::text, 'contact_phone', ''),
  (gen_random_uuid()::text, 'contact_email', ''),
  (gen_random_uuid()::text, 'contact_address', ''),
  (gen_random_uuid()::text, 'sms_provider', 'kavenegar'),
  (gen_random_uuid()::text, 'sms_api_key', ''),
  (gen_random_uuid()::text, 'sms_sender_number', ''),
  (gen_random_uuid()::text, 'payment_provider', 'zarinpal'),
  (gen_random_uuid()::text, 'payment_merchant_id', ''),
  (gen_random_uuid()::text, 'payment_api_key', ''),
  (gen_random_uuid()::text, 'terms_text', ''),
  (gen_random_uuid()::text, 'sms_template_appointment', 'کاربر گرامی، نوبت شما ثبت شد. کد پیگیری: {code}'),
  (gen_random_uuid()::text, 'sms_template_reminder', 'کاربر گریمی، یادآوری نوبت شما برای تاریخ {date} ساعت {time}'),
  (gen_random_uuid()::text, 'sms_template_confirmation', 'کاربر گرامی، نوبت شما تایید شد.')
ON CONFLICT (key) DO NOTHING;
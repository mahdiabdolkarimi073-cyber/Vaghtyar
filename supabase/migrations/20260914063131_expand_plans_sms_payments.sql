/*
# Expand Plan, Subscription, Payment, and SmsLog models

## Overview
Expands Plan, Subscription, Payment, and SmsLog tables for full subscription
plans, SMS system with templates/quotas, and ZarinPal payment integration.

## New Enums
- SmsRecipientType: CUSTOMER, BUSINESS
- SmsType: APPOINTMENT_CONFIRM, APPOINTMENT_REMINDER, NEW_BOOKING_NOTIFY, APPOINTMENT_CANCEL
- SmsLogStatus: PENDING, SENT, FAILED, SIMULATED

## Plan table changes
- maxStaff and maxServices changed from NOT NULL to nullable (null = unlimited)
- New columns: hasManualConfirm, smsConfirmQuota, hasSmsReminder, hasRevenueReport,
  hasMarketplacePage, hasFeaturedListing, hasCustomerReviews, hasDiscountCodes,
  hasCustomerNotes, hasPhoneSupport, isActive
- Old plans deleted, 4 new plans seeded with exact feature matrix

## Subscription table changes
- New columns: paymentId, createdAt

## Payment table changes
- New columns: transactionId, authority, refId, paymentMethod, paidAt
- Index on businessId

## SmsLog table changes
- Restructured with: businessId (FK), appointmentId, recipientPhone, recipientType,
  smsType, messageBody, status (SmsLogStatus), sentAt, createdAt
- Old columns dropped, indexes added

## RLS
- SmsLog: authenticated CRUD
- Payment: authenticated CRUD (added delete)
- Plan: authenticated write
*/

-- New enums
DO $$ BEGIN CREATE TYPE "SmsRecipientType" AS ENUM ('CUSTOMER', 'BUSINESS'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "SmsType" AS ENUM ('APPOINTMENT_CONFIRM', 'APPOINTMENT_REMINDER', 'NEW_BOOKING_NOTIFY', 'APPOINTMENT_CANCEL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "SmsLogStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SIMULATED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Plan: make maxStaff and maxServices nullable FIRST
ALTER TABLE "Plan" ALTER COLUMN "maxStaff" DROP NOT NULL;
ALTER TABLE "Plan" ALTER COLUMN "maxServices" DROP NOT NULL;

-- Plan: add new columns
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasManualConfirm" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "smsConfirmQuota" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasSmsReminder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasRevenueReport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasMarketplacePage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasFeaturedListing" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasCustomerReviews" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasDiscountCodes" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasCustomerNotes" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "hasPhoneSupport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Subscription: add new columns
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now();

-- Payment: add new columns
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "transactionId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "authority" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'zarinpal';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paidAt" timestamptz;
CREATE INDEX IF NOT EXISTS "Payment_businessId_idx" ON "Payment"("businessId");

-- SmsLog: add new columns
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "businessId" TEXT REFERENCES "Business"(id) ON DELETE CASCADE;
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "appointmentId" TEXT;
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "recipientPhone" TEXT;
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "recipientType" "SmsRecipientType" NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "smsType" "SmsType";
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "messageBody" TEXT;
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "status_new" "SmsLogStatus" NOT NULL DEFAULT 'SIMULATED';
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "sentAt_new" timestamptz;
ALTER TABLE "SmsLog" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now();

-- Migrate old SmsLog data to new columns where possible
UPDATE "SmsLog" SET "recipientPhone" = phone, "messageBody" = message WHERE "recipientPhone" IS NULL;

-- Drop old SmsLog columns and rename new ones
ALTER TABLE "SmsLog" DROP COLUMN IF EXISTS phone;
ALTER TABLE "SmsLog" DROP COLUMN IF EXISTS message;
ALTER TABLE "SmsLog" DROP COLUMN IF EXISTS type;
ALTER TABLE "SmsLog" DROP COLUMN IF EXISTS "sentAt";
ALTER TABLE "SmsLog" DROP COLUMN IF EXISTS status;
ALTER TABLE "SmsLog" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "SmsLog" RENAME COLUMN "sentAt_new" TO "sentAt";

CREATE INDEX IF NOT EXISTS "SmsLog_businessId_idx" ON "SmsLog"("businessId");
CREATE INDEX IF NOT EXISTS "SmsLog_smsType_idx" ON "SmsLog"("smsType");
CREATE INDEX IF NOT EXISTS "SmsLog_status_idx" ON "SmsLog"("status");

-- Clear old plans and seed new ones
DELETE FROM "Plan";

INSERT INTO "Plan" (id, name, price, "maxServices", "maxStaff", "hasManualConfirm", "smsConfirmQuota", "hasSmsReminder", "hasRevenueReport", "hasMarketplacePage", "hasFeaturedListing", "hasCustomerReviews", "hasDiscountCodes", "hasCustomerNotes", "hasPhoneSupport", "isActive", "hasSms", "hasReports", "hasCustomSms", "hasApi", "hasPriority")
VALUES
  (gen_random_uuid()::text, 'رایگان', 0, 3, 1, false, 0, false, false, false, false, false, false, false, false, true, false, false, false, false, false),
  (gen_random_uuid()::text, 'پایه', 299000, 10, 3, true, 10, false, true, true, false, true, false, true, false, true, true, true, false, false, false),
  (gen_random_uuid()::text, 'حرفه‌ای', 599000, NULL, 10, true, 100, true, true, true, false, true, true, true, true, true, true, true, true, false, false),
  (gen_random_uuid()::text, 'ویژه', 999000, NULL, NULL, true, NULL, true, true, true, true, true, true, true, true, true, true, true, true, true, true);

-- RLS policies for new SmsLog structure
DROP POLICY IF EXISTS "auth_sms_select" ON "SmsLog";
CREATE POLICY "auth_sms_select" ON "SmsLog" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_sms_insert" ON "SmsLog";
CREATE POLICY "auth_sms_insert" ON "SmsLog" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_sms_update" ON "SmsLog";
CREATE POLICY "auth_sms_update" ON "SmsLog" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_sms_delete" ON "SmsLog";
CREATE POLICY "auth_sms_delete" ON "SmsLog" FOR DELETE TO authenticated USING (true);

-- Payment: add delete policy
DROP POLICY IF EXISTS "auth_pay_delete" ON "Payment";
CREATE POLICY "auth_pay_delete" ON "Payment" FOR DELETE TO authenticated USING (true);

-- Plan: authenticated write policies
DROP POLICY IF EXISTS "auth_plan_insert" ON "Plan";
CREATE POLICY "auth_plan_insert" ON "Plan" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_plan_update" ON "Plan";
CREATE POLICY "auth_plan_update" ON "Plan" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_plan_delete" ON "Plan";
CREATE POLICY "auth_plan_delete" ON "Plan" FOR DELETE TO authenticated USING (true);
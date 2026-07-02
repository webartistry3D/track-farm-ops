-- CreateEnum PaymentStatus
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum SubscriptionPaymentMethod
DO $$ BEGIN
  CREATE TYPE "SubscriptionPaymentMethod" AS ENUM ('BANK_TRANSFER', 'PAYSTACK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable: add payment_method column to subscriptions if not exists
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "payment_method" "SubscriptionPaymentMethod";

-- CreateTable: payment_requests
CREATE TABLE IF NOT EXISTS "payment_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "subscription_id" INTEGER,
    "plan_id" TEXT NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "payment_method" "SubscriptionPaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" INTEGER,
    "reviewer_note" TEXT,
    "payment_request_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payment_requests_payment_reference_key" ON "payment_requests"("payment_reference");

-- AddForeignKey
ALTER TABLE "payment_requests" DROP CONSTRAINT IF EXISTS "payment_requests_user_id_fkey";
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_requests" DROP CONSTRAINT IF EXISTS "payment_requests_organization_id_fkey";
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_requests" DROP CONSTRAINT IF EXISTS "payment_requests_subscription_id_fkey";
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_requests" DROP CONSTRAINT IF EXISTS "payment_requests_reviewed_by_fkey";
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

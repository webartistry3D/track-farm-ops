-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "metadata" JSONB,
    "action_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "priority" "NotificationPriority" NOT NULL DEFAULT MEDIUM,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'HIGH_STOCK', 'EXPIRY_WARNING', 'INCOME_RECORDED', 'EXPENSE_RECORDED', 'BUDGET_ALERT', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'MAINTENANCE_DUE', 'CAMERA_OFFLINE', 'MOTION_DETECTED', 'SUBSCRIPTION_EXPIRING', 'PAYMENT_RECEIVED', 'INVOICE_OVERDUE', 'ASSET_MAINTENANCE', 'WEATHER_ALERT', 'PRICE_ALERT', 'USER_INVITED', 'ROLE_CHANGED', 'BACKUP_COMPLETED', 'SYNC_COMPLETED');

-- CreateTable
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_type_created_at_idx" ON "notifications"("type", "created_at");

-- CreateIndex
CREATE INDEX "notifications_organization_id_idx" ON "notifications"("organization_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create notification_preferences table
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_alerts" BOOLEAN NOT NULL DEFAULT true,
    "daily_reports" BOOLEAN NOT NULL DEFAULT false,
    "weekly_reports" BOOLEAN NOT NULL DEFAULT false,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- Create index on user_id for foreign key lookup
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- Add foreign key to users table
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

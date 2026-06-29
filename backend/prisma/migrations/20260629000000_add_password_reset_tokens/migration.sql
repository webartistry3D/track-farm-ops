-- AddColumn: password_reset_token and password_reset_expiry to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expiry" TIMESTAMP(3);

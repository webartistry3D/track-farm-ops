-- Create system_logs table
CREATE TABLE "system_logs" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_id" INTEGER,
    "user_name" TEXT,
    "user_role" TEXT,
    "resource" TEXT,
    "resource_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "system_logs_created_at_idx" ON "system_logs"("created_at");
CREATE INDEX "system_logs_type_idx" ON "system_logs"("type");
CREATE INDEX "system_logs_severity_idx" ON "system_logs"("severity");

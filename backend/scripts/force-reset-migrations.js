#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function forceResetMigrations() {
  try {
    console.log('🔧 Force resetting migrations - aggressive approach...');
    
    // Step 1: Completely reset the database schema
    console.log('🗑️ Force resetting database schema...');
    try {
      execSync('npx prisma db push --force-reset', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Database schema force reset completed');
    } catch (resetError) {
      console.error('❌ Force reset failed:', resetError.message);
      throw resetError;
    }
    
    // Step 2: Clear all migration history
    console.log('🧹 Clearing migration history...');
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "_prisma_migrations" RESTART IDENTITY`;
      console.log('✅ Migration history cleared');
    } catch (clearError) {
      console.log('⚠️ Could not clear migration history (table might not exist)');
    }
    
    // Step 3: Manually create the notifications schema
    console.log('🏗️ Manually creating notifications schema...');
    try {
      // Create NotificationType enum
      await prisma.$executeRaw`
        CREATE TYPE "NotificationType" AS ENUM (
          'LOW_STOCK', 'HIGH_STOCK', 'EXPIRY_WARNING', 'INCOME_RECORDED', 
          'EXPENSE_RECORDED', 'BUDGET_ALERT', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 
          'MAINTENANCE_DUE', 'CAMERA_OFFLINE', 'MOTION_DETECTED', 'SUBSCRIPTION_EXPIRING', 
          'PAYMENT_RECEIVED', 'INVOICE_OVERDUE', 'ASSET_MAINTENANCE', 'WEATHER_ALERT', 
          'PRICE_ALERT', 'USER_INVITED', 'ROLE_CHANGED', 'BACKUP_COMPLETED', 'SYNC_COMPLETED'
        )
      `;
      
      // Create NotificationPriority enum
      await prisma.$executeRaw`
        CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
      `;
      
      // Create notifications table
      await prisma.$executeRaw`
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
          "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
          
          CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create indexes
      await prisma.$executeRaw`CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read")`;
      await prisma.$executeRaw`CREATE INDEX "notifications_type_created_at_idx" ON "notifications"("type", "created_at")`;
      await prisma.$executeRaw`CREATE INDEX "notifications_organization_id_idx" ON "notifications"("organization_id")`;
      
      // Create foreign keys
      await prisma.$executeRaw`ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`;
      await prisma.$executeRaw`ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`;
      
      console.log('✅ Notifications schema created manually');
      
    } catch (schemaError) {
      console.error('❌ Manual schema creation failed:', schemaError.message);
      throw schemaError;
    }
    
    // Step 4: Verify the fix
    console.log('✅ Verifying database state...');
    const verification = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    `;
    
    if (verification[0].count > 0) {
      console.log('🎉 Database successfully reset and notifications schema created!');
      console.log('✅ P3009 error should be resolved permanently');
    } else {
      throw new Error('Notifications table still missing after force reset');
    }
    
  } catch (error) {
    console.error('❌ Force reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

forceResetMigrations();

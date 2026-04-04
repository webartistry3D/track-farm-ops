#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function fixDatabaseState() {
  try {
    console.log('🔧 Permanently fixing database state...');
    
    // Check current database state
    console.log('🔍 Checking current database state...');
    
    // Check if notifications table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    `;
    
    const notificationsTableExists = tableCheck.length > 0;
    console.log(`📋 Notifications table exists: ${notificationsTableExists}`);
    
    // Check if enums exist
    const enumCheck = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('NotificationType', 'NotificationPriority')
      ORDER BY typname
    `;
    
    const existingEnums = enumCheck.map(row => row.typname);
    console.log(`📋 Existing enums: ${existingEnums.join(', ')}`);
    
    // Clean up broken state
    console.log('🧹 Cleaning up broken database state...');
    
    try {
      // Drop notifications table if it exists (to ensure clean state)
      if (notificationsTableExists) {
        console.log('🗑️ Dropping existing notifications table...');
        await prisma.$executeRaw`DROP TABLE IF EXISTS "notifications" CASCADE`;
        console.log('✅ Notifications table dropped');
      }
      
      // Drop enums if they exist
      if (existingEnums.includes('NotificationType')) {
        console.log('🗑️ Dropping NotificationType enum...');
        await prisma.$executeRaw`DROP TYPE IF EXISTS "NotificationType" CASCADE`;
        console.log('✅ NotificationType enum dropped');
      }
      
      if (existingEnums.includes('NotificationPriority')) {
        console.log('🗑️ Dropping NotificationPriority enum...');
        await prisma.$executeRaw`DROP TYPE IF EXISTS "NotificationPriority" CASCADE`;
        console.log('✅ NotificationPriority enum dropped');
      }
      
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
    
    // Reset migration history
    console.log('🔄 Resetting migration history...');
    try {
      // Remove the failed migration from _prisma_migrations table
      await prisma.$executeRaw`
        DELETE FROM "_prisma_migrations" 
        WHERE "migration_name" = '20260403212700_add_notifications'
      `;
      console.log('✅ Migration history reset');
    } catch (resetError) {
      console.log('⚠️ Migration reset warning:', resetError.message);
    }
    
    // Apply the schema using db push (more reliable than migrate)
    console.log('🚀 Applying clean schema using db push...');
    try {
      execSync('npx prisma db push --force-reset', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Schema applied successfully');
    } catch (pushError) {
      console.error('❌ Schema push failed:', pushError.message);
      throw pushError;
    }
    
    // Verify the fix
    console.log('✅ Verifying database state...');
    const finalCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    `;
    
    if (finalCheck.length > 0) {
      console.log('🎉 Database state permanently fixed!');
      console.log('✅ Notifications table created successfully');
      console.log('✅ Ready for normal deployments');
    } else {
      throw new Error('Notifications table still missing after fix');
    }
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseState();

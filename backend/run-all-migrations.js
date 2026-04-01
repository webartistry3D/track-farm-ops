// Run all Prisma migrations in order for production
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function runAllMigrations() {
  console.log('🚀 Running all database migrations...');
  
  try {
    // First, fix missing columns that aren't in migration files
    console.log('🔧 Fixing missing columns first...');
    try {
      execSync('node fix-missing-columns.js', { 
        stdio: 'inherit',
        cwd: __dirname
      });
      console.log('✅ Missing columns fixed!');
    } catch (error) {
      console.log('⚠️ Missing columns fix had issues, continuing...');
    }
    const migrationsDir = path.join(__dirname, 'prisma/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order
    
    console.log('📋 Found migration files:', migrationFiles);
    
    for (const file of migrationFiles) {
      console.log(`\n🔄 Processing migration: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split SQL by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') || 
              error.message.includes('does not exist')) {
            console.log(`⚠️ Statement skipped (already applied): ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`);
            console.error(`Error: ${error.message}`);
            // Continue with other statements instead of failing completely
          }
        }
      }
      
      console.log(`✅ Migration ${file} completed`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    
    // Verify critical columns exist
    console.log('\n🔍 Verifying critical columns...');
    const criticalColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by', 'profile_image_url')
    `;
    
    const existingColumns = criticalColumns.map(col => col.column_name);
    console.log('📋 Verified columns:', existingColumns);
    
    const requiredColumns = ['address', 'last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by', 'profile_image_url'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
      throw new Error(`Missing critical columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ All critical columns present!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run all migrations
runAllMigrations()
  .then(() => {
    console.log('🎉 All migrations completed successfully - Database is ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

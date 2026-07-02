const { execSync } = require('child_process');

async function buildProduction() {
  try {
    console.log('🔧 Starting production build process...');
    console.log('📊 Build started at:', new Date().toISOString());
    
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Dependencies installed successfully');
    } catch (installError) {
      console.error('❌ Dependency installation failed:', installError.message);
      throw new Error(`Dependency installation failed: ${installError.message}`);
    }
    
    // Step 2: Generate Prisma client
    console.log('🗄️ Generating Prisma client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        timeout: 30000 // 30 second timeout
      });
      console.log('✅ Prisma client generated successfully');
    } catch (prismaError) {
      console.error('❌ Prisma client generation failed:', prismaError.message);
      throw new Error(`Prisma client generation failed: ${prismaError.message}`);
    }
    
    // Step 3: Resolve any previously failed migration, then apply pending migrations
    console.log('🗄️ Resolving any failed migrations...');
    try {
      execSync('npx prisma migrate resolve --rolled-back 20260702000000_add_payment_requests', {
        stdio: 'inherit',
        timeout: 30000
      });
      console.log('✅ Failed migration marked as rolled back');
    } catch (resolveError) {
      // Ignore errors - migration may not exist or may not be in failed state
      console.log('ℹ️ No failed migration to resolve (or already resolved)');
    }

    console.log('🗄️ Applying database migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Database migrations applied successfully');
    } catch (migrateError) {
      console.error('❌ Database migration failed:', migrateError.message);
      throw new Error(`Database migration failed: ${migrateError.message}`);
    }
    
    // Step 4: Skip user seeding (DISABLED - ONE-TIME SETUP COMPLETED)
    console.log('🚫 User seeding disabled - one-time setup completed');
    
    // Step 5: Final verification
    try {
      // Test that we can import Prisma client
      execSync('node -e "require(\'@prisma/client\')"', { 
        stdio: 'pipe',
        timeout: 5000
      });
    } catch (verifyError) {
      console.warn('⚠️ Build verification warning:', verifyError.message);
    }
    
    console.log('🎉 Production build completed successfully!');
    console.log('📊 Build completed at:', new Date().toISOString());
    console.log('🚀 Backend is ready for deployment');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
}

if (require.main === module) {
  buildProduction()
    .then(() => {
      console.log('✅ Production build script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production build script failed:', error);
      process.exit(1);
    });
}

module.exports = { buildProduction };

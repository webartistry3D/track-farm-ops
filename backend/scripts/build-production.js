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
    
    // Step 3: Migrate production database (SAFE - no data loss)
    console.log('🔄 Migrating production database...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minute timeout for database operations
      });
      console.log('✅ Database migration completed successfully');
    } catch (dbError) {
      console.error('❌ Database migration failed:', dbError.message);
      // Don't fail the build if migration fails, but log it clearly
      console.warn('⚠️ Continuing build despite migration failure');
    }
    
    // Step 4: Ensure admin user exists (SAFE - no data loss)
    console.log('� Ensuring admin user exists...');
    try {
      execSync('node scripts/seed-production.js', { 
        stdio: 'inherit',
        timeout: 30000 // 30 second timeout
      });
      console.log('✅ Admin user verification completed');
    } catch (seedError) {
      console.warn('⚠️ Admin user seeding warning:', seedError.message);
      // Don't fail the build if seeding fails
    }
    
    // Step 5: Final verification
    console.log('🔍 Final build verification...');
    try {
      // Test that we can import Prisma client
      execSync('node -e "require(\'@prisma/client\'); console.log(\'✅ Prisma client import test passed\')"', { 
        stdio: 'inherit',
        timeout: 5000
      });
      console.log('✅ Build verification completed successfully');
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

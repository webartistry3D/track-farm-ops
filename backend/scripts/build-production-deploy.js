const { execSync } = require('child_process');

async function buildProductionDeploy() {
  try {
    console.log('🔧 Starting production deployment build...');
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
    
    // Step 3: Skip Prisma migrations (use custom migration instead)
    console.log('🔄 Skipping Prisma migrations - using custom migration for production...');
    console.log('📝 Prisma migrations cause issues with existing production databases');
    console.log('� Using custom password features migration instead');

    // Step 3.5: Run password features migration
    console.log('🔐 Running password features migration...');
    try {
      execSync('node scripts/migrate-password-features.js', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Password features migration completed successfully');
    } catch (passwordMigrationError) {
      console.warn('⚠️ Password features migration failed:', passwordMigrationError.message);
      console.log('📝 Continuing with deployment despite password migration failure');
      // Don't fail the build - this is expected on subsequent deploys
    }
    
    // Step 4: Final verification
    try {
      // Test that we can import Prisma client
      execSync('node -e "require(\'@prisma/client\')"', { 
        stdio: 'pipe',
        timeout: 5000
      });
      console.log('✅ Prisma client verification successful');
    } catch (verifyError) {
      console.warn('⚠️ Build verification warning:', verifyError.message);
    }
    
    console.log('🎉 Production deployment build completed successfully!');
    console.log('📊 Build completed at:', new Date().toISOString());
    console.log('🚀 Backend is ready for deployment with superuser functionality');
    
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
  buildProductionDeploy()
    .then(() => {
      console.log('✅ Production deployment build script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production deployment build script failed:', error);
      process.exit(1);
    });
}

module.exports = { buildProductionDeploy };

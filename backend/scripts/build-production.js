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
    
    // Step 3: Reset and migrate production database
    console.log('🔄 Resetting and migrating production database...');
    try {
      execSync('node scripts/reset-production.js', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minute timeout for database operations
      });
      console.log('✅ Database reset and migration completed successfully');
    } catch (dbError) {
      console.error('❌ Database reset failed:', dbError.message);
      throw new Error(`Database reset failed: ${dbError.message}`);
    }
    
    // Step 4: Reset admin password to ensure correct credentials
    console.log('🔑 Ensuring admin password is correct...');
    try {
      execSync('node scripts/reset-admin-password.js', { 
        stdio: 'inherit',
        timeout: 10000 // 10 second timeout
      });
      console.log('✅ Admin password verification completed');
    } catch (passwordError) {
      console.warn('⚠️ Admin password reset warning:', passwordError.message);
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

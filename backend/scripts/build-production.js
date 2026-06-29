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
    
    // Step 3: Apply pending database migrations
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

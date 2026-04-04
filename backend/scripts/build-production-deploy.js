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
    
    // Step 3: Run database migrations (DEPLOYMENT MODE)
    console.log('🔄 Running database migrations for deployment...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Database migrations completed successfully');
    } catch (migrateError) {
      console.error('❌ Database migrations failed:', migrateError.message);
      console.log('🔄 Running permanent database state fix...');
      
      // Run permanent database state fix
      try {
        execSync('node scripts/fix-database-state.js', { 
          stdio: 'inherit',
          timeout: 120000 // 2 minute timeout for comprehensive fix
        });
        console.log('✅ Database state permanently fixed');
      } catch (fixError) {
        console.error('❌ Permanent database fix failed:', fixError.message);
        console.log('🔄 Attempting fallback migration resolution...');
        
        // Fallback to temporary resolution
        try {
          execSync('node scripts/resolve-failed-migrations.js', { 
            stdio: 'inherit',
            timeout: 30000 // 30 second timeout
          });
          console.log('✅ Fallback migration resolution completed');
        } catch (fallbackError) {
          console.error('❌ All migration fixes failed');
          throw new Error(`Database migration failed: ${fallbackError.message}`);
        }
      }
    }

    // Step 3.5: Run password features migration
    console.log('🔐 Running password features migration...');
    try {
      execSync('node scripts/migrate-password-features.js', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Password features migration completed successfully');
    } catch (passwordMigrationError) {
      console.warn('⚠️ Password features migration may have already run:', passwordMigrationError.message);
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

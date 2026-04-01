// Render-specific build script with automatic migration
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏗️ Starting Render build with automatic migration...');

try {
  // Run all migrations first
  console.log('🔄 Running database migrations...');
  execSync('node run-all-migrations.js', { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  console.log('✅ Migrations completed successfully!');
  
  // Continue with normal build process
  console.log('🏗️ Continuing with build process...');
  
  // Import and run the existing build script
  require('./build-production.js');
  
} catch (error) {
  console.error('❌ Build with migration failed:', error);
  process.exit(1);
}

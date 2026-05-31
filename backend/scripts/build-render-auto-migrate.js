// Render-specific build script with automatic migration
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏗️ Starting Render build with automatic migration...');

try {
  // Skip migrations during build - let the application handle database connection
  console.log('⏭️ Skipping migrations during build (will be handled by application)');
  console.log('🏗️ Continuing with build process...');
  
  // Import and run the existing build script
  require('./build-production.js');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Render startup script with automatic migration
const { execSync } = require('child_process');

console.log('🚀 Starting Render server with automatic migration...');

try {
  // Run migrations first (only if they haven't been run)
  console.log('🔄 Checking and running migrations...');
  try {
    execSync('node run-all-migrations.js', { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
    console.log('✅ Migrations completed or already applied!');
  } catch (error) {
    // If migrations already applied, continue anyway
    if (error.message.includes('already') || error.message.includes('completed')) {
      console.log('⚠️ Migrations already applied, continuing...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }
  
  // Start the server
  console.log('🚀 Starting application server...');
  require('ts-node/register');
  require('../src/index.ts');
  
} catch (error) {
  console.error('❌ Render startup failed:', error);
  process.exit(1);
}

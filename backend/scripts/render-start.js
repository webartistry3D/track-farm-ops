// Render startup script with robust database connection handling
const { execSync } = require('child_process');

console.log('🚀 Starting Render server with robust database handling...');

try {
  // Run database migrations before starting
  console.log('🗄️ Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations complete.');

  // Start the server
  console.log('🚀 Starting application server...');
  require('ts-node/register');
  require('../src/index.ts');

} catch (error) {
  console.error('❌ Render startup failed:', error);
  console.error('❌ Error details:', error.message);
  process.exit(1);
}

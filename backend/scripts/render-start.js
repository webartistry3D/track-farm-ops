// Render startup script with robust database connection handling
const { execSync } = require('child_process');

console.log('🚀 Starting Render server with robust database handling...');

try {
  // Start the server directly - let the application handle database connection
  console.log('🚀 Starting application server...');
  require('ts-node/register');
  require('../src/index.ts');

} catch (error) {
  console.error('❌ Render startup failed:', error);
  console.error('❌ Error details:', error.message);
  process.exit(1);
}

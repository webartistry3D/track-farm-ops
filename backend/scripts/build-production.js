const { execSync } = require('child_process');

async function buildProduction() {
  try {
    console.log('🔧 Starting production build...');
    
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Step 2: Generate Prisma client
    console.log('🗄️ Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Step 3: Reset and migrate production database
    console.log('🔄 Resetting and migrating production database...');
    execSync('node scripts/reset-production.js', { stdio: 'inherit' });
    
    console.log('✅ Production build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildProduction();
}

module.exports = { buildProduction };

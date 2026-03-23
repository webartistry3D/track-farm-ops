const { execSync } = require('child_process');

async function buildProduction() {
  try {
    console.log('🚀 Starting optimized production build...');
    
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm ci --production=false', { stdio: 'inherit' });
    
    // Step 2: Generate Prisma client (ALWAYS NEEDED)
    console.log('🗄️ Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      timeout: 30000 
    });
    
    // Step 3: Build TypeScript (ALWAYS NEEDED)
    console.log('🔨 Building TypeScript...');
    execSync('npx tsc', { 
      stdio: 'inherit',
      timeout: 60000 
    });
    
    console.log('✅ Production build completed!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProduction();

const { execSync } = require('child_process');

async function resetProduction() {
  try {
    console.log('🔄 Resetting production database to clean state...');
    
    // Step 1: Reset database (drops all tables)
    console.log('💥 Dropping all tables...');
    try {
      execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
      console.log('✅ Database reset successfully');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
    
    // Step 2: Deploy all migrations
    console.log('🔄 Deploying all migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ All migrations deployed');
    } catch (error) {
      console.error('❌ Migration deploy failed:', error);
      throw error;
    }
    
    // Step 3: Seed admin user
    console.log('🌱 Seeding admin user...');
    try {
      execSync('node scripts/seed-production.js', { stdio: 'inherit' });
      console.log('✅ Admin user seeded');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
    
    console.log('✅ Production database reset and configured successfully!');
    
  } catch (error) {
    console.error('❌ Production reset failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetProduction();
}

module.exports = { resetProduction };

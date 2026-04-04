const { PrismaClient } = require('@prisma/client');

// Test with production database URL directly
const PROD_DATABASE_URL = "postgresql://farmops_prod_user:oXkNxZdBXLXM7wxVOs9VhWj1o77Ap8gr@dpg-d6ute1hj16oc738tee1g-a.oregon-postgres.render.com:5432/farmops_prod";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL
    }
  }
});

async function debugProductionLogin() {
  try {
    console.log('🔍 Testing production database connection directly...');
    console.log('📊 Database URL:', PROD_DATABASE_URL.replace(/:[^:]*@/, ':***@'));
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Production database connection successful');
    
    // Get user count
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in production database: ${userCount}`);
    
    // Look for kelechi@super.com
    const email = 'kelechi@super.com';
    console.log(`\n🔍 Looking up user: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        password: true
      }
    });

    if (user) {
      console.log('✅ User found in production database:', user);
    } else {
      console.log('❌ User NOT found in production database');
      
      // List first 5 users to verify
      const sampleUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        },
        take: 5
      });
      
      console.log('\n📋 Sample users in production database:');
      sampleUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}, ${u.role})`);
      });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

debugProductionLogin();

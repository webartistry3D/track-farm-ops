const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function testUserLookup() {
  try {
    console.log('🔍 Testing user lookup with current database configuration...');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'undefined');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user lookup for kelechi@super.com
    const email = 'kelechi@super.com';
    console.log(`\n🔍 Looking up user: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    } else {
      console.log('❌ User NOT found:', email);
      
      // List all users to debug
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        },
        take: 10
      });
      
      console.log('\n📋 Available users in database:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}, ${u.role})`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

testUserLookup();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRecords() {
  try {
    console.log('🔍 Checking user records for keechi@owner.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      include: {
        organization: true,
        subscriptions: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Organization:', user.organization?.name);
      console.log('   Organization ID:', user.organizationId);
      console.log('   Created:', user.createdAt);
      console.log('   Subscriptions:', user.subscriptions.length);
      
      // Check subscription details
      if (user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub, index) => {
          console.log(`   Subscription ${index + 1}:`, {
            plan: sub.plan,
            status: sub.status,
            price: sub.price,
            createdAt: sub.createdAt
          });
        });
      }
    } else {
      console.log('❌ User keechi@owner.com NOT found in database');
    }
    
    // Check all users to see what exists
    console.log('\n📋 All users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
    
    allUsers.forEach(user => {
      console.log(`   ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRecords();

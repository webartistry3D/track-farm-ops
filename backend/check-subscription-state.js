const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentSubscriptionState() {
  try {
    console.log('🔍 Checking current subscription state...');
    
    // Check if there are any subscription records
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${subscriptions.length} subscription records:`);
    
    if (subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}`);
        console.log(`      User: ${sub.user?.email} (${sub.user?.role})`);
        console.log(`      Created: ${sub.createdAt}`);
        console.log(`      Expires: ${sub.expiresAt}`);
        console.log('');
      });
    } else {
      console.log('   No subscription records found');
    }
    
    // Check if there are any users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
        organizationId: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`👥 Found ${users.length} user records:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
      console.log(`      Created: ${user.createdAt}`);
      console.log(`      Organization: ${user.organizationId || 'None'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentSubscriptionState();

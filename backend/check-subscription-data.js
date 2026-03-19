const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubscriptionData() {
  try {
    console.log('🔍 Checking for any subscription data in database...');
    
    // Check if there's a subscription table or records
    try {
      const subscriptions = await prisma.subscription.findMany({
        select: {
          id: true,
          plan: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`📊 Found ${subscriptions.length} subscription records:`);
      
      if (subscriptions.length > 0) {
        subscriptions.forEach((sub, index) => {
          console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}, Expires: ${sub.expiresAt}, User: ${sub.user?.email}`);
        });
      } else {
        console.log('   No subscription records found');
      }
      
    } catch (schemaError) {
      console.log('❌ Subscription table might not exist:', schemaError.message);
    }
    
    // Check all users to see if any have plan field set
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\n👥 Recent users (checking for plan field):');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptionData();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateDuplicates() {
  try {
    console.log('🔍 Investigating duplicate owner@farmops.com records...');
    
    // Get all subscription records for owner@farmops.com
    const subscriptions = await prisma.subscription.findMany({
      where: {
        user: {
          email: 'owner@farmops.com'
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${subscriptions.length} subscription records for owner@farmops.com:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ID: ${sub.id}`);
      console.log(`      Plan: ${sub.plan}`);
      console.log(`      Status: ${sub.status}`);
      console.log(`      Created: ${sub.createdAt}`);
      console.log(`      Expires: ${sub.expiresAt}`);
      console.log(`      User ID: ${sub.userId}`);
      console.log(`      User Email: ${sub.user?.email}`);
      console.log('');
    });
    
    // Check if there are multiple active subscriptions
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const trialSubscriptions = subscriptions.filter(sub => sub.status === 'trial');
    
    console.log(`\n📈 Summary:`);
    console.log(`   Active subscriptions: ${activeSubscriptions.length}`);
    console.log(`   Trial subscriptions: ${trialSubscriptions.length}`);
    console.log(`   Total subscriptions: ${subscriptions.length}`);
    
    // Check the user record itself
    const userRecord = await prisma.user.findUnique({
      where: { email: 'owner@farmops.com' },
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`\n👤 User record:`);
    console.log(`   Email: ${userRecord?.email}`);
    console.log(`   Name: ${userRecord?.name}`);
    console.log(`   Role: ${userRecord?.role}`);
    console.log(`   Created: ${userRecord?.createdAt}`);
    console.log(`   Updated: ${userRecord?.updatedAt}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateDuplicates();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteStarterSubscription() {
  try {
    console.log('🗑️ Deleting starter subscription record...');
    
    // Find the starter subscription
    const starterSub = await prisma.subscription.findFirst({
      where: { plan: 'starter' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    if (starterSub) {
      console.log('📋 Found subscription to delete:');
      console.log(`   Plan: ${starterSub.plan}`);
      console.log(`   Status: ${starterSub.status}`);
      console.log(`   User: ${starterSub.user?.email}`);
      console.log(`   Created: ${starterSub.createdAt}`);
      
      // Delete the subscription
      await prisma.subscription.delete({
        where: { id: starterSub.id }
      });
      
      console.log('✅ Starter subscription deleted successfully!');
    } else {
      console.log('ℹ️ No starter subscription found');
    }
    
    // Verify deletion
    const remainingSubs = await prisma.subscription.count();
    console.log(`\n📊 Remaining subscriptions: ${remainingSubs}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteStarterSubscription();

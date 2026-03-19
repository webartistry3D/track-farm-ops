const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllKelechiSubscriptions() {
  try {
    console.log('🗑️ Deleting all subscription records for kelechi@owner.com...');
    
    // Find all subscriptions for kelechi@owner.com
    const subscriptions = await prisma.subscription.findMany({
      where: {
        user: {
          email: 'kelechi@owner.com'
        }
      }
    });
    
    console.log(`📋 Found ${subscriptions.length} subscription records to delete:`);
    
    for (const sub of subscriptions) {
      console.log(`   Deleting: Plan ${sub.plan}, Status ${sub.status}, ID ${sub.id}`);
      await prisma.subscription.delete({
        where: { id: sub.id }
      });
    }
    
    console.log(`✅ Deleted ${subscriptions.length} subscription records`);
    
    // Verify deletion
    const remainingSubs = await prisma.subscription.count({
      where: {
        user: {
          email: 'kelechi@owner.com'
        }
      }
    });
    
    console.log(`📊 Remaining subscriptions for kelechi@owner.com: ${remainingSubs}`);
    
    // Check total subscriptions in database
    const totalSubs = await prisma.subscription.count();
    console.log(`📊 Total subscriptions in database: ${totalSubs}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllKelechiSubscriptions();

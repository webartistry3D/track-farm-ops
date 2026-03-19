const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkKelechiSubscription() {
  try {
    console.log('🔍 Checking kelechi@owner.com subscription...');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { 
        organization: true,
        subscriptions: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization: ${user.organization?.name || 'None'}`);
      console.log(`   Organization ID: ${user.organizationId}`);
      
      console.log(`\n📋 Subscription records for this user:`);
      if (user.subscriptions && user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub, index) => {
          console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}`);
          console.log(`      Created: ${sub.createdAt}`);
          console.log(`      Expires: ${sub.expiresAt}`);
        });
      } else {
        console.log('   No subscription records found');
      }
    } else {
      console.log('❌ User not found');
    }
    
    // Check all subscription records in database
    console.log('\n📊 All subscription records in database:');
    const allSubs = await prisma.subscription.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    if (allSubs.length > 0) {
      allSubs.forEach((sub, index) => {
        console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}`);
        console.log(`      User: ${sub.user?.email}`);
        console.log(`      Created: ${sub.createdAt}`);
      });
    } else {
      console.log('   No subscription records found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkKelechiSubscription();

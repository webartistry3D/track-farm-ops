const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSubscriptionIssue() {
  try {
    console.log('🔍 Debugging subscription issue for keechi@owner.com...\n');

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🏢 Organization: ${user.organization?.name} (ID: ${user.organizationId})`);
    console.log(`👤 Role: ${user.role}\n`);

    // Check current active subscription
    console.log('📋 Current active subscription:');
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!activeSubscription) {
      console.log('   ❌ No active subscription found');
      
      // Check if there are any recent payments that should be active
      console.log('\n💳 Checking recent payments:');
      const recentPayments = await prisma.subscription.findMany({
        where: {
          userId: user.id,
          organizationId: user.organizationId,
          paystackReference: {
            not: null
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      if (recentPayments.length > 0) {
        console.log('   Found recent payments that should be active:');
        recentPayments.forEach((payment, index) => {
          console.log(`   ${index + 1}. Reference: ${payment.paystackReference}`);
          console.log(`      Plan: ${payment.plan}, Status: ${payment.status}`);
          console.log(`      Created: ${payment.createdAt.toISOString()}`);
          console.log(`      Expires: ${payment.expiresAt ? payment.expiresAt.toISOString() : 'Not set'}`);
        });
        
        // Check if any of these should be activated
        const shouldBeActive = recentPayments.find(p => 
          p.status === 'pending' && 
          p.paystackReference?.startsWith('FARMOPS_4_')
        );
        
        if (shouldBeActive) {
          console.log(`\n⚠️  Found payment that should be activated: ${shouldBeActive.paystackReference}`);
          console.log('   This payment was verified but subscription may not be properly activated');
        }
      } else {
        console.log('   No recent payments found');
      }
    } else {
      console.log('   ✅ Active subscription found:');
      console.log(`      Plan: ${activeSubscription.plan}`);
      console.log(`      Status: ${activeSubscription.status}`);
      console.log(`      Created: ${activeSubscription.createdAt.toISOString()}`);
      console.log(`      Expires: ${activeSubscription.expiresAt ? activeSubscription.expiresAt.toISOString() : 'Not set'}`);
      console.log(`      Reference: ${activeSubscription.paystackReference || 'None'}`);
      console.log(`      Activated: ${activeSubscription.activatedAt ? activeSubscription.activatedAt.toISOString() : 'Not set'}`);
      
      // Check if subscription is still valid
      if (activeSubscription.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(activeSubscription.expiresAt);
        
        if (expiresAt > now) {
          console.log(`   ✅ Subscription is still valid (expires in ${Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))} days)`);
        } else {
          console.log(`   ❌ Subscription has expired!`);
          console.log(`   Expired on: ${expiresAt.toISOString()}`);
        }
      }
    }

    // Test what the API would return
    console.log('\n🔄 Simulating API call to /subscription/current:');
    
    // This mimics the getCurrentSubscription logic
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription) {
      console.log('   ❌ API would return: No active subscription');
      
      // Check for trial
      const trialSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          organizationId: user.organizationId,
          status: 'trial'
        }
      });
      
      if (trialSubscription) {
        console.log('   ✅ API would return trial subscription');
        console.log(`      Plan: ${trialSubscription.plan}, Status: ${trialSubscription.status}`);
        console.log(`      Expires: ${trialSubscription.expiresAt.toISOString()}`);
      } else {
        console.log('   ❌ API would create new trial subscription');
      }
    } else {
      console.log('   ✅ API would return active subscription');
      console.log(`      Plan: ${subscription.plan}, Status: ${subscription.status}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugSubscriptionIssue();

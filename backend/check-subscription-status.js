const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptionStatus() {
  try {
    console.log('🔍 Checking subscription status...\n');

    // Get the user (keechi@owner.com)
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

    // Check all subscriptions for this user
    console.log('📋 All subscriptions for this user:');
    const allSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (allSubscriptions.length === 0) {
      console.log('   No subscriptions found');
    } else {
      allSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}`);
        console.log(`      Created: ${sub.createdAt.toISOString()}`);
        console.log(`      Expires: ${sub.expiresAt ? sub.expiresAt.toISOString() : 'Not set'}`);
        console.log(`      Billing: ${sub.billingCycle}, Price: ₦${sub.price}`);
        if (sub.paystackReference) {
          console.log(`      Reference: ${sub.paystackReference}`);
        }
        console.log(`      Activated: ${sub.activatedAt ? sub.activatedAt.toISOString() : 'Not set'}`);
        console.log('');
      });
    }

    // Check what getCurrentSubscription would return
    console.log('🔄 Simulating getCurrentSubscription logic:');
    
    // Check for active subscription first
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (activeSubscription) {
      console.log('   ✅ Found active subscription:');
      console.log(`      Plan: ${activeSubscription.plan}`);
      console.log(`      Status: ${activeSubscription.status}`);
      console.log(`      Expires: ${activeSubscription.expiresAt.toISOString()}`);
      console.log('   This should be returned by /subscription/current');
    } else {
      console.log('   ❌ No active subscription found');
      
      // Check for trial
      const trialSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          organizationId: user.organizationId,
          status: 'trial'
        }
      });
      
      if (trialSubscription) {
        console.log('   ✅ Found trial subscription:');
        console.log(`      Plan: ${trialSubscription.plan}`);
        console.log(`      Status: ${trialSubscription.status}`);
        console.log(`      Expires: ${trialSubscription.expiresAt.toISOString()}`);
        console.log('   This should be returned by /subscription/current');
      } else {
        console.log('   ❌ No trial subscription found');
        console.log('   A new trial subscription should be created');
      }
    }

    // Check recent payment references
    console.log('\n💳 Recent payment references:');
    const recentPayments = await prisma.subscription.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        paystackReference: {
          not: null
        }
      },
      select: {
        paystackReference: true,
        plan: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (recentPayments.length === 0) {
      console.log('   No payment references found');
    } else {
      recentPayments.forEach((payment, index) => {
        console.log(`   ${index + 1}. ${payment.paystackReference}`);
        console.log(`      Plan: ${payment.plan}, Status: ${payment.status}`);
        console.log(`      Created: ${payment.createdAt.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptionStatus();

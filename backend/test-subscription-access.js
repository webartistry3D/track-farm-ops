const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubscriptionAccess() {
  try {
    console.log('🔍 Testing subscription access logic...\n');

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🏢 Organization ID: ${user.organizationId}`);
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
      return;
    }
    
    console.log(`   ✅ Active subscription found:`);
    console.log(`      Plan: ${activeSubscription.plan}`);
    console.log(`      Status: ${activeSubscription.status}`);
    console.log(`      Expires: ${activeSubscription.expiresAt.toISOString()}`);

    // Test what subscription restrictions should allow
    console.log('\n🔐 Testing subscription restrictions logic:');
    
    // Simulate the subscription limits
    const SUBSCRIPTION_LIMITS = {
      freemium: {
        features: {
          inventoryTransactions: false,
          analytics: false,
          auditLogs: false
        }
      },
      trial: {
        features: {
          inventoryTransactions: true,
          analytics: false,
          auditLogs: false
        }
      },
      starter: {
        features: {
          inventoryTransactions: true,
          analytics: false,
          auditLogs: false
        }
      },
      growth: {
        features: {
          inventoryTransactions: true,
          analytics: true,
          auditLogs: true
        }
      },
      pro: {
        features: {
          inventoryTransactions: true,
          analytics: true,
          auditLogs: true
        }
      }
    };

    const userPlan = activeSubscription.plan;
    const userLimits = SUBSCRIPTION_LIMITS[userPlan] || SUBSCRIPTION_LIMITS.freemium;
    
    console.log(`   📊 Plan: ${userPlan}`);
    console.log(`   🔧 User Limits:`, userLimits.features);
    
    // Test specific features
    const features = ['inventoryTransactions', 'analytics', 'auditLogs'];
    
    console.log('\n🎯 Feature Access Test:');
    features.forEach(feature => {
      const hasAccess = userLimits.features[feature] !== false && userLimits.features[feature] !== 'basic';
      console.log(`   ${feature}: ${hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
    });

    // Expected results for Growth plan
    console.log('\n📋 Expected for Growth Plan:');
    console.log('   inventoryTransactions: ✅ ALLOWED');
    console.log('   analytics: ✅ ALLOWED');
    console.log('   auditLogs: ✅ ALLOWED');

    console.log('\n🔧 Issue Analysis:');
    if (userPlan === 'growth') {
      console.log('   ✅ User has Growth plan');
      console.log('   ✅ Should have access to all premium features');
      console.log('   ❌ If access is denied, the issue is in frontend subscription restrictions');
      console.log('   💡 Check: subscriptionRestrictions.ts data extraction');
    } else {
      console.log(`   ⚠️  User has ${userPlan} plan, not Growth`);
      console.log('   💡 This explains why premium features are not accessible');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionAccess();

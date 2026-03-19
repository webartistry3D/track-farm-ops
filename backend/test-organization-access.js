const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrganizationWideAccess() {
  try {
    console.log('🔍 Testing organization-wide subscription access...\n');

    // Get the owner (keechi@owner.com)
    const owner = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });
    
    if (!owner) {
      console.log('❌ Owner not found');
      return;
    }
    
    console.log(`👤 Owner: ${owner.name} (${owner.email})`);
    console.log(`🏢 Organization ID: ${owner.organizationId}`);
    console.log(`👤 Role: ${owner.role}\n`);

    // Get other users in the same organization
    const orgUsers = await prisma.user.findMany({
      where: {
        organizationId: owner.organizationId,
        id: { not: owner.id } // Exclude the owner
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`👥 Found ${orgUsers.length} other users in the organization:`);
    orgUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check organization's active subscriptions
    console.log('\n📋 Organization active subscriptions:');
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: owner.organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (activeSubscriptions.length === 0) {
      console.log('   ❌ No active subscriptions found for organization');
    } else {
      console.log(`   ✅ Found ${activeSubscriptions.length} active subscription(s):`);
      activeSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}`);
        console.log(`      User: ${sub.userId || 'Organization-wide'}`);
        console.log(`      Created: ${sub.createdAt.toISOString()}`);
        console.log(`      Expires: ${sub.expiresAt?.toISOString() || 'No expiry'}`);
      });
    }

    // Test what each user should see
    console.log('\n🎯 Expected Access for Each User:');
    
    // Test owner access
    const ownerAccess = activeSubscriptions.length > 0 ? '✅ Full Access' : '❌ No Access';
    console.log(`   ${owner.name} (Owner): ${ownerAccess}`);
    
    // Test other users' access (should be same as owner now)
    orgUsers.forEach(user => {
      const userAccess = activeSubscriptions.length > 0 ? '✅ Full Access' : '❌ No Access';
      console.log(`   ${user.name} (${user.role}): ${userAccess}`);
    });

    console.log('\n💡 Organization-Wide Access Logic:');
    if (activeSubscriptions.length > 0) {
      console.log('   ✅ Organization has active subscription');
      console.log('   ✅ ALL users (Owner, Managers, Workers) should have full access');
      console.log('   ✅ No role-based restrictions for premium features');
    } else {
      console.log('   ❌ Organization has no active subscription');
      console.log('   ❌ All users default to freemium access');
      console.log('   ❌ Role-based restrictions still apply');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrganizationWideAccess();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscription() {
  try {
    console.log('🔍 Checking subscription data...\n');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Organization ID: ${user.organizationId}`);

    // Check all subscriptions for this organization
    const subscriptions = await prisma.subscription.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📋 Found ${subscriptions.length} subscription(s):`);
    subscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Plan: ${sub.plan}, Status: ${sub.status}, Expires: ${sub.expiresAt}`);
    });

    // Check specifically for active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        organizationId: user.organizationId,
        status: 'active'
      }
    });

    console.log(`\n✅ Active subscription found: ${!!activeSubscription}`);
    if (activeSubscription) {
      console.log(`   Plan: ${activeSubscription.plan}`);
      console.log(`   Status: ${activeSubscription.status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscription();

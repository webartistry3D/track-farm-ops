const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upgradeSubscription() {
  try {
    console.log('🔧 Upgrading subscription for kelechi@owner.com...\n');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Update the existing subscription to premium
    const subscription = await prisma.subscription.updateMany({
      where: { organizationId: user.organizationId },
      data: {
        plan: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        price: 0,
        features: JSON.stringify({
          inventory: true,
          financial: true,
          reporting: true,
          users: true,
          assets: true
        })
      }
    });

    console.log(`✅ Updated subscription: ${subscription.count} records affected`);

    // Verify the update
    const updatedSubscription = await prisma.subscription.findFirst({
      where: { organizationId: user.organizationId }
    });

    console.log(`✅ Current subscription:`);
    console.log(`   Plan: ${updatedSubscription.plan}`);
    console.log(`   Status: ${updatedSubscription.status}`);

  } catch (error) {
    console.error('❌ Error updating subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeSubscription();

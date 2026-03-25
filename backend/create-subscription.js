const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSubscriptionForKelechi() {
  try {
    console.log('🔧 Creating subscription for kelechi@owner.com...\n');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { organizationId: user.organizationId }
    });

    if (existingSubscription) {
      console.log('✅ Subscription already exists');
      console.log(`   Plan: ${existingSubscription.plan}`);
      console.log(`   Status: ${existingSubscription.status}`);
      return;
    }

    // Create a premium subscription
    const subscription = await prisma.subscription.create({
      data: {
        organizationId: user.organizationId,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        price: 0, // Free for local development
        features: JSON.stringify({
          inventory: true,
          financial: true,
          reporting: true,
          users: true,
          assets: true
        })
      }
    });

    console.log(`✅ Created subscription:`);
    console.log(`   Plan: ${subscription.plan}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Organization ID: ${subscription.organizationId}`);

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSubscriptionForKelechi();

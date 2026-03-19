const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBothOrganizations() {
  try {
    console.log('🔍 Checking both organizations...\n');

    // Kelechi's organization
    console.log('🏢 KELECHI ORGANIZATION:');
    const kelechiOwner = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    const kelechiManager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    const kelechiWorker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    console.log(`   Owner: ${kelechiOwner?.name} - Org ID: ${kelechiOwner?.organizationId}`);
    console.log(`   Manager: ${kelechiManager?.name} - Org ID: ${kelechiManager?.organizationId}`);
    console.log(`   Worker: ${kelechiWorker?.name} - Org ID: ${kelechiWorker?.organizationId}`);

    // Nnenna's organization
    console.log('\n🏢 NNENNA ORGANIZATION:');
    const nnennaOwner = await prisma.user.findUnique({
      where: { email: 'nnenna@owner.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    const nnennaManager = await prisma.user.findUnique({
      where: { email: 'nnenna@manager.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    const nnennaWorker = await prisma.user.findUnique({
      where: { email: 'nnenna@worker.com' },
      select: { id: true, name: true, role: true, organizationId: true }
    });

    console.log(`   Owner: ${nnennaOwner?.name} - Org ID: ${nnennaOwner?.organizationId}`);
    console.log(`   Manager: ${nnennaManager?.name} - Org ID: ${nnennaManager?.organizationId}`);
    console.log(`   Worker: ${nnennaWorker?.name} - Org ID: ${nnennaWorker?.organizationId}`);

    console.log('\n🚨 ISSUES FOUND:');
    if (kelechiOwner?.organizationId !== kelechiManager?.organizationId) {
      console.log('   ❌ Kelechi: Owner and Manager are in different organizations');
    }
    if (kelechiOwner?.organizationId !== kelechiWorker?.organizationId) {
      console.log('   ❌ Kelechi: Owner and Worker are in different organizations');
    }
    if (nnennaOwner?.organizationId !== nnennaManager?.organizationId) {
      console.log('   ❌ Nnenna: Owner and Manager are in different organizations');
    }
    if (nnennaOwner?.organizationId !== nnennaWorker?.organizationId) {
      console.log('   ❌ Nnenna: Owner and Worker are in different organizations');
    }

    console.log('\n💡 SOLUTION:');
    console.log('   Need to update organization IDs so all team members are in the same organization');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBothOrganizations();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixKelechiOrganization() {
  try {
    console.log('🔧 Fixing Kelechi organization structure...\n');

    // Get current organization details
    const kelechiOwner = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { id: true, name: true, organizationId: true }
    });

    const kelechiManager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' },
      select: { id: true, name: true, organizationId: true }
    });

    const kelechiWorker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' },
      select: { id: true, name: true, organizationId: true }
    });

    console.log('📍 Current Organization IDs:');
    console.log(`   Owner: ${kelechiOwner?.name} - Org ID: ${kelechiOwner?.organizationId}`);
    console.log(`   Manager: ${kelechiManager?.name} - Org ID: ${kelechiManager?.organizationId}`);
    console.log(`   Worker: ${kelechiWorker?.name} - Org ID: ${kelechiWorker?.organizationId}`);

    // Move manager and worker to owner's organization
    const targetOrgId = kelechiOwner.organizationId;

    console.log(`\n🔄 Moving Manager and Worker to Organization ID: ${targetOrgId}`);

    // Update manager
    await prisma.user.update({
      where: { email: 'kelechi@manager.com' },
      data: { organizationId: targetOrgId }
    });

    // Update worker  
    await prisma.user.update({
      where: { email: 'kelechi@worker.com' },
      data: { organizationId: targetOrgId }
    });

    console.log('✅ Organization structure fixed!');

    // Also need to update their financial records to the new organization
    console.log('\n🔄 Updating financial records organization...');

    // Update manager's records (only tables with organizationId)
    await prisma.incomeEntry.updateMany({
      where: { userId: kelechiManager.id },
      data: { organizationId: targetOrgId }
    });

    await prisma.expenseEntry.updateMany({
      where: { userId: kelechiManager.id },
      data: { organizationId: targetOrgId }
    });

    // Update worker's records (only tables with organizationId)
    await prisma.incomeEntry.updateMany({
      where: { userId: kelechiWorker.id },
      data: { organizationId: targetOrgId }
    });

    await prisma.expenseEntry.updateMany({
      where: { userId: kelechiWorker.id },
      data: { organizationId: targetOrgId }
    });

    console.log('✅ Financial records updated! (Note: Invoice records are linked through user relationship)');

    // Verify the fix
    console.log('\n🔍 Verification:');
    const updatedManager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' },
      select: { organizationId: true }
    });

    const updatedWorker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' },
      select: { organizationId: true }
    });

    console.log(`   Manager Org ID: ${updatedManager?.organizationId} (should be ${targetOrgId})`);
    console.log(`   Worker Org ID: ${updatedWorker?.organizationId} (should be ${targetOrgId})`);

    console.log('\n🎉 RESULT:');
    console.log('✅ All Kelechi team members are now in the same organization');
    console.log('✅ Owner should now see all manager and worker records');
    console.log('✅ Manager and worker should now see owner records');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixKelechiOrganization();

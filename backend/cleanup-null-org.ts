import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupNullOrganization() {
  console.log('🧹 Cleaning up items with null organizationId...');

  try {
    // First, let's see what we're dealing with
    const nullOrgItems = await prisma.inventoryItem.findMany({
      where: { organizationId: null },
      select: { id: true, name: true, quantity: true, metadata: true }
    });

    console.log(`Found ${nullOrgItems.length} items with null organizationId`);

    if (nullOrgItems.length > 0) {
      // Delete all items with null organizationId
      const deleteResult = await prisma.inventoryItem.deleteMany({
        where: { organizationId: null }
      });

      console.log(`✅ Deleted ${deleteResult.count} items with null organizationId`);
    }

    // Verify the cleanup
    const remainingItems = await prisma.inventoryItem.findMany({
      select: { id: true, name: true, quantity: true, organizationId: true, metadata: true }
    });

    console.log(`\n📊 Remaining items: ${remainingItems.length}`);
    
    const orgGroups: { [key: string]: number } = {};
    remainingItems.forEach(item => {
      const orgId = item.organizationId?.toString() || 'null';
      orgGroups[orgId] = (orgGroups[orgId] || 0) + 1;
    });
    console.log('By organization:', orgGroups);

    return true;
  } catch (error) {
    console.error('❌ Error cleaning up null organization items:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNullOrganization();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignInventoryToOrganizations() {
  try {
    console.log('🔄 Assigning inventory items to organizations...');
    
    // Get organizations
    const kelechiFarms = await prisma.organization.findFirst({
      where: { name: 'Kelechi Farms' }
    });
    
    const nnennaFarms = await prisma.organization.findFirst({
      where: { name: 'Nnenna Farms' }
    });
    
    if (!kelechiFarms || !nnennaFarms) {
      throw new Error('Organizations not found');
    }
    
    console.log(`🏢 Kelechi Farms ID: ${kelechiFarms.id}`);
    console.log(`🏢 Nnenna Farms ID: ${nnennaFarms.id}`);
    
    // Get some inventory items to assign
    const allItems = await prisma.inventoryItem.findMany({
      take: 20, // Get first 20 items
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Found ${allItems.length} items to reassign`);
    
    // Assign first 10 items to Kelechi Farms
    const kelechiItems = allItems.slice(0, 10);
    for (const item of kelechiItems) {
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { organizationId: kelechiFarms.id }
      });
      console.log(`✅ Assigned "${item.name}" to Kelechi Farms`);
    }
    
    // Assign next 10 items to Nnenna Farms
    const nnennaItems = allItems.slice(10, 20);
    for (const item of nnennaItems) {
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { organizationId: nnennaFarms.id }
      });
      console.log(`✅ Assigned "${item.name}" to Nnenna Farms`);
    }
    
    // Verify the assignment
    const kelechiInventory = await prisma.inventoryItem.count({
      where: { organizationId: kelechiFarms.id }
    });
    
    const nnennaInventory = await prisma.inventoryItem.count({
      where: { organizationId: nnennaFarms.id }
    });
    
    console.log(`📊 Kelechi Farms now has ${kelechiInventory} inventory items`);
    console.log(`📊 Nnenna Farms now has ${nnennaInventory} inventory items`);
    
    // Show some sample items for each organization
    const kelechiSample = await prisma.inventoryItem.findMany({
      where: { organizationId: kelechiFarms.id },
      take: 5,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n🌾 Kelechi Farms Sample Items:');
    kelechiSample.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - ${item.category?.name}`);
    });
    
    const nnennaSample = await prisma.inventoryItem.findMany({
      where: { organizationId: nnennaFarms.id },
      take: 5,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n🌾 Nnenna Farms Sample Items:');
    nnennaSample.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - ${item.category?.name}`);
    });
    
    console.log('\n✅ Inventory assignment completed successfully!');
    
  } catch (error) {
    console.error('❌ Error assigning inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignInventoryToOrganizations();

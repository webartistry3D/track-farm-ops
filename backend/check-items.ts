import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkItems() {
  try {
    const items = await prisma.inventoryItem.findMany({
      select: { 
        id: true, 
        name: true, 
        quantity: true, 
        organizationId: true, 
        metadata: true 
      }
    });
    
    console.log('Total items:', items.length);
    
    console.log('\nBy organization:');
    const orgGroups: { [key: string]: number } = {};
    items.forEach(item => {
      const orgId = item.organizationId?.toString() || 'null';
      orgGroups[orgId] = (orgGroups[orgId] || 0) + 1;
    });
    console.log(orgGroups);
    
    console.log('\nItems with value > 0:');
    items.filter(item => {
      const metadata = item.metadata as any;
      const qty = Number(item.quantity);
      return qty > 0 || (metadata?.pricePerUnit && Number(metadata.pricePerUnit) > 0);
    }).forEach(item => {
      const metadata = item.metadata as any;
      console.log(`  ${item.name}: qty=${item.quantity}, price=${metadata?.pricePerUnit || 0}, org=${item.organizationId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkItems();

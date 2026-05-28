import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInventory() {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      include: {
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const items = await prisma.inventoryItem.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Inventory Categories:');
    console.log('====================');
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   Icon: ${category.icon || 'None'}`);
      console.log(`   Color: ${category.color || 'None'}`);
      console.log(`   Items: ${category._count.items}`);
      console.log('');
    });

    console.log(`Total Categories: ${categories.length}`);
    console.log('');

    console.log('Inventory Items:');
    console.log('=================');
    
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Unit: ${item.unit}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Category: ${item.category?.name || 'None'}`);
      console.log(`   Price: $${item.pricePerUnit || 0}`);
      console.log('');
    });

    console.log(`Total Items: ${items.length}`);

  } catch (error) {
    console.error('Error checking inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory();

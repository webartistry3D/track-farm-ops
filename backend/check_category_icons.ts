import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategoryIcons() {
  try {
    const categories = await prisma.inventoryCategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        color: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Inventory Categories with Icons:');
    console.log('==================================');
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   Icon: "${category.icon}"`);
      console.log(`   Color: "${category.color}"`);
      console.log('');
    });

    console.log(`Total categories: ${categories.length}`);

  } catch (error) {
    console.error('Error checking category icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryIcons();

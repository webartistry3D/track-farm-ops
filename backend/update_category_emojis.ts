import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryEmojis() {
  try {
    console.log('Updating category icons to emojis...');

    const categoryUpdates = [
      { name: 'Equipment & Tools', icon: 'ðª' },
      { name: 'Fertilizers & Nutrients', icon: 'ð¥' },
      { name: 'Irrigation Supplies', icon: 'ð§' },
      { name: 'Livestock', icon: 'ð' },
      { name: 'Pest Control', icon: 'ð«' },
      { name: 'Safety & Protective', icon: 'â' },
      { name: 'Seeds & Planting', icon: 'ð±' },
      { name: 'Storage Materials', icon: 'ð' }
    ];

    for (const update of categoryUpdates) {
      const result = await prisma.inventoryCategory.updateMany({
        where: { name: update.name },
        data: { icon: update.icon }
      });

      if (result.count > 0) {
        console.log(`â Updated "${update.name}" with icon: ${update.icon}`);
      } else {
        console.log(`â Category "${update.name}" not found`);
      }
    }

    console.log('\nâ Category icons updated successfully!');

    // Verify the updates
    const categories = await prisma.inventoryCategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\nCurrent category icons:');
    console.log('========================');
    categories.forEach((category) => {
      console.log(`${category.name}: ${category.icon}`);
    });

  } catch (error) {
    console.error('Error updating category icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryEmojis();

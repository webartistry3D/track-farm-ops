import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function useBasicEmojis() {
  try {
    console.log('Updating category icons with most basic, universal emojis...');

    const categoryUpdates = [
      { name: 'Equipment & Tools', icon: 'ð' },      // Wrench - very common
      { name: 'Fertilizers & Nutrients', icon: 'ð' },  // Leaf - simple plant
      { name: 'Irrigation Supplies', icon: 'ð' },     // Water wave - water
      { name: 'Livestock', icon: 'ð' },              // Horse face - common animal
      { name: 'Pest Control', icon: 'ð' },          // Ant - simple bug
      { name: 'Safety & Protective', icon: 'ð' },    // Construction worker - safety
      { name: 'Seeds & Planting', icon: 'ð' },        // Potted plant - planting
      { name: 'Storage Materials', icon: 'ð' }      // Package - storage
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

    console.log('\nâ Category icons updated with basic emojis!');

    // Verify the updates
    const categories = await prisma.inventoryCategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\nFinal category icons:');
    console.log('====================');
    categories.forEach((category) => {
      console.log(`${category.name}: ${category.icon}`);
    });

  } catch (error) {
    console.error('Error updating category icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

useBasicEmojis();

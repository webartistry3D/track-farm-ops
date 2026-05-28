import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCategoryEmojis() {
  try {
    console.log('Updating category icons with universally supported emojis...');

    const categoryUpdates = [
      { name: 'Equipment & Tools', icon: 'ð' },      // Hammer - more common
      { name: 'Fertilizers & Nutrients', icon: 'ð' },  // Seedling - better supported
      { name: 'Irrigation Supplies', icon: 'ð' },     // Water drop - universal
      { name: 'Livestock', icon: 'ð' },              // Cow face - very common
      { name: 'Pest Control', icon: 'ð' },          // Bug - simple and clear
      { name: 'Safety & Protective', icon: 'ð' },    // Safety vest - clear meaning
      { name: 'Seeds & Planting', icon: 'ð' },        // Seedling - perfect match
      { name: 'Storage Materials', icon: 'ð' }      // Box - simple storage icon
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

    console.log('\nâ Category icons updated with better emojis!');

    // Verify the updates
    const categories = await prisma.inventoryCategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\nUpdated category icons:');
    console.log('=======================');
    categories.forEach((category) => {
      console.log(`${category.name}: ${category.icon}`);
    });

  } catch (error) {
    console.error('Error updating category icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryEmojis();

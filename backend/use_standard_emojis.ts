import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function useStandardEmojis() {
  try {
    console.log('Using standard, basic emojis...');

    const updates = [
      { name: 'Equipment & Tools', icon: 'ð' },    // Hammer
      { name: 'Fertilizers & Nutrients', icon: 'ð' }, // Leaf
      { name: 'Irrigation Supplies', icon: 'ð' },   // Water
      { name: 'Livestock', icon: 'ð' },            // Cow
      { name: 'Pest Control', icon: 'ð' },        // Bug
      { name: 'Safety & Protective', icon: 'â' },   // Shield
      { name: 'Seeds & Planting', icon: 'ð' },      // Seedling
      { name: 'Storage Materials', icon: 'ð' }     // Box
    ];

    for (const update of updates) {
      await prisma.inventoryCategory.updateMany({
        where: { name: update.name },
        data: { icon: update.icon }
      });
      console.log(`Updated ${update.name}: ${update.icon}`);
    }

    console.log('Done!');
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
  }
}

useStandardEmojis();

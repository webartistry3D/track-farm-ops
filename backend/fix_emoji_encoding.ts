import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmojiEncoding() {
  try {
    console.log('Fixing emoji encoding with hardcoded strings...');

    const updates = [
      { name: 'Equipment & Tools', icon: 'ð' },    // Hammer - similar to tools
      { name: 'Fertilizers & Nutrients', icon: 'ð' }, // Leaf - similar to plants
      { name: 'Irrigation Supplies', icon: 'ð' },   // Water drop - water
      { name: 'Livestock', icon: 'ð' },            // Cow - livestock
      { name: 'Pest Control', icon: 'ð' },        // Spray bottle - pest control
      { name: 'Safety & Protective', icon: 'â' },   // Shield - safety
      { name: 'Seeds & Planting', icon: 'ð' },      // Seedling - planting
      { name: 'Storage Materials', icon: 'ð' }     // Package - storage
    ];

    for (const update of updates) {
      const result = await prisma.inventoryCategory.updateMany({
        where: { name: update.name },
        data: { icon: update.icon }
      });

      if (result.count > 0) {
        console.log(`â Updated "${update.name}" with: ${update.icon}`);
      }
    }

    console.log('\nâ Emoji encoding fixed!');

    // Verify the stored data
    const categories = await prisma.inventoryCategory.findMany({
      select: { name: true, icon: true },
      orderBy: { name: 'asc' }
    });

    console.log('\nStored in database:');
    console.log('===================');
    categories.forEach(cat => {
      console.log(`${cat.name}: "${cat.icon}"`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

fixEmojiEncoding();

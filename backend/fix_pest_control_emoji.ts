import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPestControlEmoji() {
  try {
    console.log('Fixing Pest Control emoji...');

    // Use a spray bottle emoji for pest control - more appropriate
    const result = await prisma.inventoryCategory.updateMany({
      where: { name: 'Pest Control' },
      data: { icon: 'ð' } // Spray bottle - better for pest control
    });

    if (result.count > 0) {
      console.log(`â Updated "Pest Control" with spray bottle emoji: ð`);
    } else {
      console.log(`â Category "Pest Control" not found`);
    }

    console.log('Done!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating emoji:', error);
    await prisma.$disconnect();
  }
}

fixPestControlEmoji();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showPresetCategories() {
  try {
    console.log('📋 Displaying newly added preset inventory categories...\n');

    // Get organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });

    // Define the preset categories we added
    const presetCategoryNames = [
      'Seeds & Planting Materials',
      'Crop Protection', 
      'Harvesting & Storage',
      'Feed & Nutrition',
      'Livestock Equipment',
      'Animal Health',
      'Farm Machinery',
      'Tools & Hand Equipment',
      'Irrigation Systems',
      'Buildings & Structures',
      'Utilities & Services',
      'Office Supplies',
      'Safety Equipment',
      'Fuel & Lubricants',
      'Packaging Materials'
    ];

    for (const organization of organizations) {
      console.log(`🏢 ${organization.name} (ID: ${organization.id})`);
      console.log('─'.repeat(50));

      // Get preset categories for this organization
      const categories = await prisma.inventoryCategory.findMany({
        where: {
          organizationId: organization.id,
          name: { in: presetCategoryNames }
        },
        select: {
          name: true,
          icon: true,
          color: true,
          description: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });

      if (categories.length > 0) {
        categories.forEach(category => {
          console.log(`${category.icon} ${category.name}`);
          console.log(`   📝 ${category.description}`);
          console.log(`   🎨 Color: ${category.color}`);
          console.log(`   📅 Added: ${category.createdAt.toLocaleDateString()}`);
          console.log('');
        });
      } else {
        console.log('   ℹ️  No preset categories found');
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }

    console.log(`🎉 Successfully displaying ${presetCategoryNames.length} preset inventory categories!`);

  } catch (error) {
    console.error('❌ Error displaying categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the display
showPresetCategories();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function displayNigerianFarmCategories() {
  try {
    console.log('🇳🇬 Comprehensive Nigerian Farm Inventory Categories\n');

    // Get organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });

    for (const organization of organizations) {
      console.log(`🏢 ${organization.name} (ID: ${organization.id})`);
      console.log('='.repeat(60));

      // Get all categories for this organization
      const categories = await prisma.inventoryCategory.findMany({
        where: { organizationId: organization.id },
        select: {
          name: true,
          icon: true,
          color: true,
          description: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });

      // Group by category type
      const categoryGroups = {
        'Crop Production': [],
        'Livestock': [],
        'Aquaculture': [],
        'Perennial Crops': [],
        'Vegetables': [],
        'Poultry': [],
        'Small Ruminants': [],
        'Farm Infrastructure': [],
        'Organic & Sustainable': [],
        'Farm Management': []
      };

      // Organize categories into groups
      categories.forEach(category => {
        if (category.name.includes('Seeds') || category.name.includes('Crop Protection') || 
            category.name.includes('Machinery') || category.name.includes('Harvesting')) {
          categoryGroups['Crop Production'].push(category);
        } else if (category.name.includes('Feed') || category.name.includes('Livestock Equipment') || 
                   category.name.includes('Animal Health')) {
          categoryGroups['Livestock'].push(category);
        } else if (category.name.includes('Fish')) {
          categoryGroups['Aquaculture'].push(category);
        } else if (category.name.includes('Tree Crops') || category.name.includes('Root')) {
          categoryGroups['Perennial Crops'].push(category);
        } else if (category.name.includes('Vegetable')) {
          categoryGroups['Vegetables'].push(category);
        } else if (category.name.includes('Poultry')) {
          categoryGroups['Poultry'].push(category);
        } else if (category.name.includes('Small Ruminant')) {
          categoryGroups['Small Ruminants'].push(category);
        } else if (category.name.includes('Buildings') || category.name.includes('Supplies') || 
                   category.name.includes('Transportation')) {
          categoryGroups['Farm Infrastructure'].push(category);
        } else if (category.name.includes('Organic') || category.name.includes('Renewable')) {
          categoryGroups['Organic & Sustainable'].push(category);
        } else if (category.name.includes('Digital') || category.name.includes('Financial')) {
          categoryGroups['Farm Management'].push(category);
        }
      });

      // Display categories by group
      Object.entries(categoryGroups).forEach(([groupName, groupCategories]) => {
        if (groupCategories.length > 0) {
          console.log(`\n📂 ${groupName} (${groupCategories.length} categories):`);
          console.log('-'.repeat(50));
          
          groupCategories.forEach(category => {
            console.log(`${category.icon} ${category.name}`);
            console.log(`   📝 ${category.description.substring(0, 100)}...`);
            console.log(`   🎨 Color: ${category.color}`);
            console.log('');
          });
        }
      });

      console.log('\n' + '='.repeat(80) + '\n');
    }

    console.log(`🎉 Successfully displayed comprehensive Nigerian farm inventory categories! 🇳🇬`);
    console.log(`📊 Total specialized categories: 20 per organization`);
    console.log(`🌱 Covers all major Nigerian farming operations from subsistence to commercial`);

  } catch (error) {
    console.error('❌ Error displaying categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the display
displayNigerianFarmCategories();

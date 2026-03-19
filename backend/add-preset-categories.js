const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPresetInventoryCategories() {
  try {
    console.log('🌱 Adding preset inventory categories...');

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });

    console.log(`📊 Found ${organizations.length} organizations`);

    // Define preset categories with appropriate icons and colors
    const presetCategories = [
      {
        name: 'Seeds & Planting Materials',
        description: 'Crop seeds, vegetable seeds, fruit tree seedlings, fertilizers, and planting supplies',
        icon: '🌱',
        color: '#10B981' // green
      },
      {
        name: 'Crop Protection',
        description: 'Pesticides, herbicides, fungicides, sprayers, and protective equipment',
        icon: '🛡️',
        color: '#EF4444' // red
      },
      {
        name: 'Harvesting & Storage',
        description: 'Harvesting tools, storage bags, containers, silos, and grain storage equipment',
        icon: '🌾',
        color: '#F59E0B' // amber
      },
      {
        name: 'Feed & Nutrition',
        description: 'Animal feed, supplements, salt licks, minerals, and feed storage containers',
        icon: '🥗',
        color: '#84CC16' // lime
      },
      {
        name: 'Livestock Equipment',
        description: 'Water troughs, feeders, animal housing, fencing, gates, and milking equipment',
        icon: '🐄',
        color: '#8B5CF6' // purple
      },
      {
        name: 'Animal Health',
        description: 'Veterinary medicines, vaccines, first aid supplies, and health monitoring devices',
        icon: '🏥',
        color: '#EC4899' // pink
      },
      {
        name: 'Farm Machinery',
        description: 'Tractors, implements, tillage equipment, planting machines, and harvesting equipment',
        icon: '🚜',
        color: '#3B82F6' // blue
      },
      {
        name: 'Tools & Hand Equipment',
        description: 'Hand tools, power tools, measuring tools, and maintenance equipment',
        icon: '🔧',
        color: '#6B7280' // gray
      },
      {
        name: 'Irrigation Systems',
        description: 'Pumps, pipes, sprinklers, drippers, water tanks, and irrigation controllers',
        icon: '💧',
        color: '#06B6D4' // cyan
      },
      {
        name: 'Buildings & Structures',
        description: 'Barn materials, greenhouse supplies, storage building materials, and fencing materials',
        icon: '🏗️',
        color: '#A16207' // brown
      },
      {
        name: 'Utilities & Services',
        description: 'Electricity supplies, water system components, waste management, and communication equipment',
        icon: '⚡',
        color: '#F97316' // orange
      },
      {
        name: 'Office Supplies',
        description: 'Record books, forms, computer supplies, printing materials, and communication devices',
        icon: '📦',
        color: '#0EA5E9' // sky blue
      },
      {
        name: 'Safety Equipment',
        description: 'First aid kits, fire safety equipment, protective clothing, and safety signs',
        icon: '⚠️',
        color: '#DC2626' // red
      },
      {
        name: 'Fuel & Lubricants',
        description: 'Diesel fuel, petrol, engine oil, grease, and lubricants',
        icon: '⛽',
        color: '#1F2937' // dark gray
      },
      {
        name: 'Packaging Materials',
        description: 'Bags, sacks, boxes, crates, labels, tags, and packaging tape',
        icon: '📋',
        color: '#7C3AED' // violet
      }
    ];

    console.log(`📝 Preparing to add ${presetCategories.length} preset categories`);

    // Add categories for each organization
    for (const organization of organizations) {
      console.log(`\n🏢 Processing organization: ${organization.name} (ID: ${organization.id})`);

      // Check existing categories for this organization
      const existingCategories = await prisma.inventoryCategory.findMany({
        where: { organizationId: organization.id },
        select: { name: true }
      });

      const existingCategoryNames = new Set(existingCategories.map(cat => cat.name));
      console.log(`  📊 Found ${existingCategories.length} existing categories`);

      // Add missing preset categories
      const categoriesToAdd = presetCategories.filter(
        preset => !existingCategoryNames.has(preset.name)
      );

      if (categoriesToAdd.length > 0) {
        console.log(`  ➕ Adding ${categoriesToAdd.length} new categories:`);
        
        for (const category of categoriesToAdd) {
          const createdCategory = await prisma.inventoryCategory.create({
            data: {
              name: category.name,
              description: category.description,
              icon: category.icon,
              color: category.color,
              organizationId: organization.id,
              isSubcategory: false,
              parentId: null
            }
          });
          
          console.log(`    ✅ Added: ${category.name} ${category.icon}`);
        }
      } else {
        console.log(`  ℹ️  All preset categories already exist for this organization`);
      }
    }

    // Summary
    console.log('\n🎯 SUMMARY:');
    
    const totalCategoriesAfter = await prisma.inventoryCategory.groupBy({
      by: ['organizationId'],
      _count: { id: true }
    });

    console.log(`📊 Categories per organization after adding presets:`);
    for (const orgCount of totalCategoriesAfter) {
      const org = organizations.find(o => o.id === orgCount.organizationId);
      console.log(`  🏢 ${org?.name || 'Unknown'}: ${orgCount._count.id} categories`);
    }

    console.log('\n🎉 Preset inventory categories added successfully!');

  } catch (error) {
    console.error('❌ Error adding preset categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addPresetInventoryCategories();

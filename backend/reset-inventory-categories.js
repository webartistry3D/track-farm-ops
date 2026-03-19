const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetInventoryWithPresetCategories() {
  try {
    console.log('🗑️ Resetting inventory and adding only preset categories...');

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });

    console.log(`📊 Found ${organizations.length} organizations`);

    // Step 1: Delete all inventory transactions
    console.log('\n📋 Step 1: Deleting all inventory transactions...');
    const deletedTransactions = await prisma.inventoryTransaction.deleteMany({});
    console.log(`  ✅ Deleted ${deletedTransactions.count} inventory transactions`);

    // Step 2: Delete all inventory items
    console.log('\n📋 Step 2: Deleting all inventory items...');
    const deletedItems = await prisma.inventoryItem.deleteMany({});
    console.log(`  ✅ Deleted ${deletedItems.count} inventory items`);

    // Step 3: Delete all inventory categories
    console.log('\n📋 Step 3: Deleting all inventory categories...');
    const deletedCategories = await prisma.inventoryCategory.deleteMany({});
    console.log(`  ✅ Deleted ${deletedCategories.count} inventory categories`);

    // Step 4: Add only the preset categories
    console.log('\n📋 Step 4: Adding preset categories...');

    const presetCategories = [
      {
        name: 'Seeds & Planting Materials',
        description: 'Crop seeds, vegetable seeds, fruit tree seedlings, fertilizers, and planting supplies',
        icon: '🌱',
        color: '#10B981'
      },
      {
        name: 'Crop Protection',
        description: 'Pesticides, herbicides, fungicides, sprayers, and protective equipment',
        icon: '🛡️',
        color: '#EF4444'
      },
      {
        name: 'Harvesting & Storage',
        description: 'Harvesting tools, storage bags, containers, silos, and grain storage equipment',
        icon: '🌾',
        color: '#F59E0B'
      },
      {
        name: 'Feed & Nutrition',
        description: 'Animal feed, supplements, salt licks, minerals, and feed storage containers',
        icon: '🥗',
        color: '#84CC16'
      },
      {
        name: 'Livestock Equipment',
        description: 'Water troughs, feeders, animal housing, fencing, gates, and milking equipment',
        icon: '🐄',
        color: '#8B5CF6'
      },
      {
        name: 'Animal Health',
        description: 'Veterinary medicines, vaccines, first aid supplies, and health monitoring devices',
        icon: '🏥',
        color: '#EC4899'
      },
      {
        name: 'Farm Machinery',
        description: 'Tractors, implements, tillage equipment, planting machines, and harvesting equipment',
        icon: '🚜',
        color: '#3B82F6'
      },
      {
        name: 'Tools & Hand Equipment',
        description: 'Hand tools, power tools, measuring tools, and maintenance equipment',
        icon: '🔧',
        color: '#6B7280'
      },
      {
        name: 'Irrigation Systems',
        description: 'Pumps, pipes, sprinklers, drippers, water tanks, and irrigation controllers',
        icon: '💧',
        color: '#06B6D4'
      },
      {
        name: 'Buildings & Structures',
        description: 'Barn materials, greenhouse supplies, storage building materials, and fencing materials',
        icon: '🏗️',
        color: '#A16207'
      },
      {
        name: 'Utilities & Services',
        description: 'Electricity supplies, water system components, waste management, and communication equipment',
        icon: '⚡',
        color: '#F97316'
      },
      {
        name: 'Office Supplies',
        description: 'Record books, forms, computer supplies, printing materials, and communication devices',
        icon: '📦',
        color: '#0EA5E9'
      },
      {
        name: 'Safety Equipment',
        description: 'First aid kits, fire safety equipment, protective clothing, and safety signs',
        icon: '⚠️',
        color: '#DC2626'
      },
      {
        name: 'Fuel & Lubricants',
        description: 'Diesel fuel, petrol, engine oil, grease, and lubricants',
        icon: '⛽',
        color: '#1F2937'
      },
      {
        name: 'Packaging Materials',
        description: 'Bags, sacks, boxes, crates, labels, tags, and packaging tape',
        icon: '📋',
        color: '#7C3AED'
      }
    ];

    let totalCategoriesAdded = 0;

    // Add categories for each organization
    for (const organization of organizations) {
      console.log(`\n🏢 Processing organization: ${organization.name} (ID: ${organization.id})`);

      for (const category of presetCategories) {
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
        totalCategoriesAdded++;
      }
    }

    // Step 5: Verification
    console.log('\n📋 Step 5: Verification...');
    
    const finalCategories = await prisma.inventoryCategory.groupBy({
      by: ['organizationId'],
      _count: { id: true }
    });

    const finalItems = await prisma.inventoryItem.count();
    const finalTransactions = await prisma.inventoryTransaction.count();

    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`📊 Categories added: ${totalCategoriesAdded}`);
    console.log(`📦 Inventory items remaining: ${finalItems}`);
    console.log(`📝 Transactions remaining: ${finalTransactions}`);
    
    console.log('\n📊 Categories per organization:');
    for (const orgCount of finalCategories) {
      const org = organizations.find(o => o.id === orgCount.organizationId);
      console.log(`  🏢 ${org?.name || 'Unknown'}: ${orgCount._count.id} categories`);
    }

    if (finalItems === 0 && finalTransactions === 0) {
      console.log('\n🎉 Inventory reset completed successfully! Only preset categories remain.');
    } else {
      console.log('\n⚠️ Warning: Some items or transactions may still exist.');
    }

  } catch (error) {
    console.error('❌ Error during inventory reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetInventoryWithPresetCategories();

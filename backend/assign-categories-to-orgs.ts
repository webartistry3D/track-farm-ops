import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignCategoriesToOrganizations() {
  try {
    console.log('🔄 Assigning inventory categories to organizations...');
    
    // Get organizations
    const kelechiFarms = await prisma.organization.findFirst({
      where: { name: 'Kelechi Farms' }
    });
    
    const nnennaFarms = await prisma.organization.findFirst({
      where: { name: 'Nnenna Farms' }
    });
    
    if (!kelechiFarms || !nnennaFarms) {
      throw new Error('Organizations not found');
    }
    
    console.log(`🏢 Kelechi Farms ID: ${kelechiFarms.id}`);
    console.log(`🏢 Nnenna Farms ID: ${nnennaFarms.id}`);
    
    // Get categories without organization (first 10)
    const unassignedCategories = await prisma.inventoryCategory.findMany({
      where: { organizationId: null },
      take: 10,
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Found ${unassignedCategories.length} unassigned categories`);
    
    // Assign first 5 categories to Kelechi Farms
    const kelechiCategories = unassignedCategories.slice(0, 5);
    for (const category of kelechiCategories) {
      await prisma.inventoryCategory.update({
        where: { id: category.id },
        data: { organizationId: kelechiFarms.id }
      });
      console.log(`✅ Assigned "${category.name}" to Kelechi Farms`);
    }
    
    // Assign next 5 categories to Nnenna Farms
    const nnennaCategories = unassignedCategories.slice(5, 10);
    for (const category of nnennaCategories) {
      await prisma.inventoryCategory.update({
        where: { id: category.id },
        data: { organizationId: nnennaFarms.id }
      });
      console.log(`✅ Assigned "${category.name}" to Nnenna Farms`);
    }
    
    // Verify the assignment
    const kelechiCategoryCount = await prisma.inventoryCategory.count({
      where: { organizationId: kelechiFarms.id }
    });
    
    const nnennaCategoryCount = await prisma.inventoryCategory.count({
      where: { organizationId: nnennaFarms.id }
    });
    
    console.log(`📊 Kelechi Farms now has ${kelechiCategoryCount} categories`);
    console.log(`📊 Nnenna Farms now has ${nnennaCategoryCount} categories`);
    
    // Show categories for each organization
    const kelechiCats = await prisma.inventoryCategory.findMany({
      where: { organizationId: kelechiFarms.id },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n🌾 Kelechi Farms Categories:');
    kelechiCats.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.icon})`);
    });
    
    const nnennaCats = await prisma.inventoryCategory.findMany({
      where: { organizationId: nnennaFarms.id },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n🌾 Nnenna Farms Categories:');
    nnennaCats.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.icon})`);
    });
    
    // Update inventory items to use the new categories
    console.log('\n🔄 Updating inventory items to use correct categories...');
    
    // Get Kelechi Farms items and categories
    const kelechiItems = await prisma.inventoryItem.findMany({
      where: { organizationId: kelechiFarms.id },
      include: { category: true }
    });
    
    // Map items to appropriate categories
    const kelechiCategoryMap = {
      'Broiler Chickens': 'Livestock',
      'Layer Chickens': 'Livestock', 
      'Turkeys': 'Livestock',
      'Goats': 'Livestock',
      'Sheep': 'Livestock',
      'Cattle': 'Livestock',
      'Pigs': 'Livestock',
      'Rabbits': 'Livestock',
      'Broiler Feed': 'Animal Feed',
      'Layer Feed': 'Animal Feed'
    };
    
    for (const item of kelechiItems) {
      const categoryName = kelechiCategoryMap[item.name as keyof typeof kelechiCategoryMap];
      if (categoryName) {
        const category = kelechiCats.find(cat => cat.name === categoryName);
        if (category && category.id !== item.categoryId) {
          await prisma.inventoryItem.update({
            where: { id: item.id },
            data: { categoryId: category.id }
          });
          console.log(`✅ Updated "${item.name}" to use category "${categoryName}"`);
        }
      }
    }
    
    // Get Nnenna Farms items and categories
    const nnennaItems = await prisma.inventoryItem.findMany({
      where: { organizationId: nnennaFarms.id },
      include: { category: true }
    });
    
    // Map items to appropriate categories
    const nnennaCategoryMap = {
      'Grower Feed': 'Animal Feed',
      'Starter Feed': 'Animal Feed',
      'Fish Meal': 'Animal Feed',
      'Bone Meal': 'Fertilizers & Soil Inputs',
      'Vitamin Supplements': 'Veterinary Supplies',
      'Mineral Blocks': 'Animal Feed',
      'Antibiotics': 'Veterinary Supplies',
      'Vaccines': 'Veterinary Supplies',
      'Dewormers': 'Veterinary Supplies',
      'Vitamin C': 'Veterinary Supplies'
    };
    
    for (const item of nnennaItems) {
      const categoryName = nnennaCategoryMap[item.name as keyof typeof nnennaCategoryMap];
      if (categoryName) {
        const category = nnennaCats.find(cat => cat.name === categoryName);
        if (category && category.id !== item.categoryId) {
          await prisma.inventoryItem.update({
            where: { id: item.id },
            data: { categoryId: category.id }
          });
          console.log(`✅ Updated "${item.name}" to use category "${categoryName}"`);
        }
      }
    }
    
    console.log('\n✅ Category assignment and item updates completed successfully!');
    
  } catch (error) {
    console.error('❌ Error assigning categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCategoriesToOrganizations();

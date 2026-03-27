import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🐄 LIVESTOCK FARM PRESETS - Specialized for livestock operations
const LIVESTOCK_CATEGORIES = [
  {
    name: 'Livestock Animals',
    description: 'Different types of livestock animals',
    icon: '🐄',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    metadata: { keywords: ['cattle', 'goats', 'sheep', 'livestock', 'animals'] }
  },
  {
    name: 'Livestock Feed',
    description: 'Feed and nutrition for livestock',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['feed', 'fodder', 'hay', 'silage', 'nutrition'] }
  },
  {
    name: 'Livestock Health',
    description: 'Veterinary medicines and health supplies',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['medicine', 'vaccines', 'dewormers', 'veterinary', 'health'] }
  },
  {
    name: 'Livestock Equipment',
    description: 'Equipment for livestock management',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['equipment', 'tools', 'handling', 'fencing', 'watering'] }
  },
  {
    name: 'Livestock Products',
    description: 'Products from livestock animals',
    icon: '🥛',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['milk', 'meat', 'cheese', 'yogurt', 'products'] }
  }
];

const LIVESTOCK_ITEMS = [
  // Livestock Animals (6 items)
  { name: 'Cattle', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 20 },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  { name: 'Sheep', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 40 },
  { name: 'Pigs', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 30 },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 60 },
  { name: 'Calves', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 15 },
  
  // Livestock Feed (5 items)
  { name: 'Hay Bales', type: 'CONSUMABLES', unit: 'bales', categoryId: 2, quantity: 100 },
  { name: 'Silage', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 500 },
  { name: 'Cattle Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 200 },
  { name: 'Goat Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 150 },
  { name: 'Salt Licks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 2, quantity: 25 },
  
  // Livestock Health (5 items)
  { name: 'Livestock Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 30 },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3, quantity: 50 },
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 20 },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 15 },
  { name: 'First Aid Kit', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3, quantity: 5 },
  
  // Livestock Equipment (6 items)
  { name: 'Water Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 15 },
  { name: 'Feeding Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 25 },
  { name: 'Halters and Leads', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 40 },
  { name: 'Milking Equipment', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 3 },
  { name: 'Fencing Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 10 },
  { name: 'Loading Ramps', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 2 },
  
  // Livestock Products (4 items)
  { name: 'Milk Containers', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 20 },
  { name: 'Meat Processing Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 8 },
  { name: 'Cheese Making Supplies', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 5 },
  { name: 'Yogurt Containers', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 30 }
];

async function seedLivestockFarmForOrganization(organizationId: number) {
  console.log(`🐄 Seeding Livestock Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create livestock categories
    const createdCategories = [];
    for (const category of LIVESTOCK_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create livestock items
    for (const item of LIVESTOCK_ITEMS) {
      const category = createdCategories.find(cat => cat.name === LIVESTOCK_CATEGORIES[item.categoryId - 1].name);
      if (category) {
        await prisma.inventoryItem.create({
          data: {
            name: item.name,
            type: item.type as any,
            unit: item.unit,
            quantity: item.quantity,
            categoryId: category.id,
            organizationId,
            metadata: {
              pricePerUnit: null,
              location: null,
              supplier: null,
              purchaseDate: null,
              expiryDate: null,
              minimumStock: null,
              notes: `Livestock Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${LIVESTOCK_CATEGORIES.length} categories and ${LIVESTOCK_ITEMS.length} items for livestock farm`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding livestock farm inventory:`, error);
    return false;
  }
}

if (require.main === module) {
  // Test with organization ID 1
  seedLivestockFarmForOrganization(1)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedLivestockFarmForOrganization };

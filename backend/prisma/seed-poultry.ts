import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🐔 POULTRY FARM PRESETS - Specialized for poultry operations
const POULTRY_CATEGORIES = [
  {
    name: 'Poultry Birds',
    description: 'Different types of poultry birds',
    icon: '🐔',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    metadata: { keywords: ['chickens', 'birds', 'poultry', 'layers', 'broilers'] }
  },
  {
    name: 'Poultry Feed',
    description: 'Specialized feed for poultry',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['feed', 'nutrition', 'starter', 'grower', 'layer', 'broiler'] }
  },
  {
    name: 'Poultry Health',
    description: 'Medicines and health supplies for poultry',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['medicine', 'vaccines', 'antibiotics', 'vitamins', 'poultry health'] }
  },
  {
    name: 'Poultry Equipment',
    description: 'Equipment for poultry farming',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['equipment', 'cages', 'feeders', 'waterers', 'incubators'] }
  },
  {
    name: 'Egg Production',
    description: 'Egg collection and handling supplies',
    icon: '🥚',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['eggs', 'crates', 'trays', 'production', 'collection'] }
  }
];

const POULTRY_ITEMS = [
  // Poultry Birds (6 items)
  { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 100 },
  { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 150 },
  { name: 'Local Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 25 },
  { name: 'Ducks', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 30 },
  { name: 'Guinea Fowls', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 20 },
  
  // Poultry Feed (5 items)
  { name: 'Broiler Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 50 },
  { name: 'Broiler Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 75 },
  { name: 'Broiler Finisher Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 100 },
  { name: 'Layer Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 40 },
  { name: 'Layer Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 60 },
  
  // Poultry Health (5 items)
  { name: 'Poultry Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 20 },
  { name: 'Poultry Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 15 },
  { name: 'Poultry Vitamins', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 10 },
  { name: 'Coccidiostats', type: 'CONSUMABLES', unit: 'packets', categoryId: 3, quantity: 12 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 8 },
  
  // Poultry Equipment (6 items)
  { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 20 },
  { name: 'Water Drinkers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 25 },
  { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 30 },
  { name: 'Egg Trays', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 50 },
  { name: 'Incubator', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 2 },
  { name: 'Brooder Guards', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 10 },
  
  // Egg Production (4 items)
  { name: 'Egg Crates', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 40 },
  { name: 'Egg Cartons', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 100 },
  { name: 'Egg Cleaning Supplies', type: 'CONSUMABLES', unit: 'liters', categoryId: 5, quantity: 5 },
  { name: 'Egg Grading Scale', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 1 }
];

async function seedPoultryFarmForOrganization(organizationId: number) {
  console.log(`🐔 Seeding Poultry Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create poultry categories
    const createdCategories = [];
    for (const category of POULTRY_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create poultry items
    for (const item of POULTRY_ITEMS) {
      const category = createdCategories.find(cat => cat.name === POULTRY_CATEGORIES[item.categoryId - 1].name);
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
              notes: `Poultry Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${POULTRY_CATEGORIES.length} categories and ${POULTRY_ITEMS.length} items for poultry farm`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding poultry farm inventory:`, error);
    return false;
  }
}

if (require.main === module) {
  // Test with organization ID 1
  seedPoultryFarmForOrganization(1)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedPoultryFarmForOrganization };

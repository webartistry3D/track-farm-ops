import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🐟 FISH FARMING PRESETS - Specialized for aquaculture operations
const FISH_CATEGORIES = [
  {
    name: 'Fish Stock',
    description: 'Different types of fish and aquatic animals',
    icon: '🐟',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['fish', 'tilapia', 'catfish', 'fingerlings', 'aquatic'] }
  },
  {
    name: 'Fish Feed',
    description: 'Specialized feed for fish and aquatic animals',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['feed', 'pellets', 'nutrition', 'fish food', 'aquaculture'] }
  },
  {
    name: 'Water Treatment',
    description: 'Water quality management and treatment',
    icon: '💧',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    metadata: { keywords: ['water', 'treatment', 'quality', 'oxygen', 'pH', 'testing'] }
  },
  {
    name: 'Fish Health',
    description: 'Medicines and health supplies for fish',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['medicine', 'treatment', 'disease', 'health', 'veterinary'] }
  },
  {
    name: 'Aquaculture Equipment',
    description: 'Equipment for fish farming operations',
    icon: '🔧',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['equipment', 'tanks', 'nets', 'pumps', 'aeration', 'harvesting'] }
  }
];

const FISH_ITEMS = [
  // Fish Stock (5 items)
  { name: 'Tilapia Fingerlings', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 500 },
  { name: 'Catfish Fingerlings', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 300 },
  { name: 'Mature Tilapia', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 100 },
  { name: 'Mature Catfish', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 80 },
  { name: 'Ornamental Fish', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  
  // Fish Feed (5 items)
  { name: 'Tilapia Feed Pellets', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 100 },
  { name: 'Catfish Feed Pellets', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 80 },
  { name: 'Starter Fish Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 50 },
  { name: 'Grower Fish Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 75 },
  { name: 'Fish Feed Supplements', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 25 },
  
  // Water Treatment (5 items)
  { name: 'Water Test Kit', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3, quantity: 3 },
  { name: 'pH Adjuster', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 10 },
  { name: 'Oxygen Tablets', type: 'CONSUMABLES', unit: 'packets', categoryId: 3, quantity: 20 },
  { name: 'Water Conditioner', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 15 },
  { name: 'Probiotics', type: 'CONSUMABLES', unit: 'kg', categoryId: 3, quantity: 5 },
  
  // Fish Health (4 items)
  { name: 'Fish Antibiotics', type: 'CONSUMABLES', unit: 'packets', categoryId: 4, quantity: 15 },
  { name: 'Anti-parasite Treatment', type: 'CONSUMABLES', unit: 'liters', categoryId: 4, quantity: 8 },
  { name: 'Fish Vitamins', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 10 },
  { name: 'Disease Prevention Kit', type: 'CONSUMABLES', unit: 'pieces', categoryId: 4, quantity: 5 },
  
  // Aquaculture Equipment (6 items)
  { name: 'Fish Tanks', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 10 },
  { name: 'Aeration Pumps', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 5 },
  { name: 'Fishing Nets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 8 },
  { name: 'Water Pumps', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 3 },
  { name: 'Feed Dispensers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 6 },
  { name: 'Harvesting Equipment', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 4 }
];

async function seedFishFarmForOrganization(organizationId: number) {
  console.log(`🐟 Seeding Fish Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create fish categories
    const createdCategories = [];
    for (const category of FISH_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create fish items
    for (const item of FISH_ITEMS) {
      const category = createdCategories.find(cat => cat.name === FISH_CATEGORIES[item.categoryId - 1].name);
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
              notes: `Fish Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${FISH_CATEGORIES.length} categories and ${FISH_ITEMS.length} items for fish farm`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding fish farm inventory:`, error);
    return false;
  }
}

if (require.main === module) {
  // Test with organization ID 1
  seedFishFarmForOrganization(1)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedFishFarmForOrganization };

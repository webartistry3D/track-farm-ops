import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🌾 CROP FARMING PRESETS - Specialized for crop cultivation
const CROP_CATEGORIES = [
  {
    name: 'Seeds & Planting',
    description: 'Seeds, seedlings, and planting materials',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    metadata: { keywords: ['seeds', 'seedlings', 'planting', 'germination', 'crops'] }
  },
  {
    name: 'Fertilizers & Soil',
    description: 'Fertilizers and soil amendments',
    icon: '🧪',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    metadata: { keywords: ['fertilizer', 'soil', 'amendments', 'nutrients', 'compost'] }
  },
  {
    name: 'Crop Protection',
    description: 'Pest control and crop protection products',
    icon: '🦟',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['pesticides', 'herbicides', 'fungicides', 'protection', 'pests'] }
  },
  {
    name: 'Farm Equipment',
    description: 'Equipment for crop farming',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['equipment', 'tools', 'machinery', 'implements', 'farming'] }
  },
  {
    name: 'Harvest & Storage',
    description: 'Harvesting and storage supplies',
    icon: '🌾',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['harvest', 'storage', 'crops', 'yield', 'drying'] }
  },
  {
    name: 'Irrigation',
    description: 'Water management and irrigation equipment',
    icon: '💧',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    metadata: { keywords: ['irrigation', 'water', 'pumps', 'sprinklers', 'drip'] }
  }
];

const CROP_ITEMS = [
  // Seeds & Planting (6 items)
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 1, quantity: 100 },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 1, quantity: 50 },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 1, quantity: 20 },
  { name: 'Pepper Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 1, quantity: 15 },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 1, quantity: 25 },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 1, quantity: 40 },
  
  // Fertilizers & Soil (5 items)
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 200 },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 150 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 300 },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 250 },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 100 },
  
  // Crop Protection (5 items)
  { name: 'Herbicides', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 20 },
  { name: 'Insecticides', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 15 },
  { name: 'Fungicides', type: 'CONSUMABLES', unit: 'kg', categoryId: 3, quantity: 25 },
  { name: 'Pesticide Sprayer', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 3 },
  { name: 'Protective Gear', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 10 },
  
  // Farm Equipment (6 items)
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 15 },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 12 },
  { name: 'Rake', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 8 },
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 5 },
  { name: 'Cutlass', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 20 },
  { name: 'Hand Trowel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 25 },
  
  // Harvest & Storage (5 items)
  { name: 'Harvest Baskets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 30 },
  { name: 'Storage Bags', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 100 },
  { name: 'Drying Racks', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 10 },
  { name: 'Grain Sacks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 50 },
  { name: 'Harvesting Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 15 },
  
  // Irrigation (4 items)
  { name: 'Water Pump', type: 'EQUIPMENT', unit: 'pieces', categoryId: 6, quantity: 2 },
  { name: 'Water Hoses', type: 'EQUIPMENT', unit: 'meters', categoryId: 6, quantity: 100 },
  { name: 'Sprinklers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 6, quantity: 20 },
  { name: 'Watering Cans', type: 'EQUIPMENT', unit: 'pieces', categoryId: 6, quantity: 15 }
];

async function seedCropFarmForOrganization(organizationId: number) {
  console.log(`🌾 Seeding Crop Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create crop categories
    const createdCategories = [];
    for (const category of CROP_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create crop items
    for (const item of CROP_ITEMS) {
      const category = createdCategories.find(cat => cat.name === CROP_CATEGORIES[item.categoryId - 1].name);
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
              notes: `Crop Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${CROP_CATEGORIES.length} categories and ${CROP_ITEMS.length} items for crop farm`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding crop farm inventory:`, error);
    return false;
  }
}

if (require.main === module) {
  // Test with organization ID 1
  seedCropFarmForOrganization(1)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedCropFarmForOrganization };

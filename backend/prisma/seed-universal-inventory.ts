import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Universal preset inventory categories for all organizations
const UNIVERSAL_CATEGORIES = [
  {
    name: 'Livestock',
    description: 'Animals raised on the farm',
    icon: '🐄',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    metadata: { keywords: ['animals', 'cattle', 'poultry', 'livestock'] }
  },
  {
    name: 'Feed & Nutrition',
    description: 'Animal feed and nutritional supplements',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['feed', 'nutrition', 'supplements', 'fodder'] }
  },
  {
    name: 'Medicine & Health',
    description: 'Veterinary medicines and health supplies',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['medicine', 'veterinary', 'health', 'treatment'] }
  },
  {
    name: 'Equipment & Tools',
    description: 'Farm equipment and tools',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['equipment', 'tools', 'machinery', 'implements'] }
  },
  {
    name: 'Seeds & Planting',
    description: 'Seeds, seedlings, and planting materials',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    metadata: { keywords: ['seeds', 'seedlings', 'planting', 'germination'] }
  },
  {
    name: 'Fertilizers & Soil',
    description: 'Fertilizers and soil amendments',
    icon: '🧪',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    metadata: { keywords: ['fertilizer', 'soil', 'amendments', 'nutrients'] }
  },
  {
    name: 'Pest Control',
    description: 'Pesticides and pest control products',
    icon: '🦟',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['pesticide', 'insecticide', 'pest control', 'protection'] }
  },
  {
    name: 'Harvest & Storage',
    description: 'Harvested crops and storage supplies',
    icon: '🌾',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['harvest', 'storage', 'crops', 'yield'] }
  },
  {
    name: 'Water & Irrigation',
    description: 'Water supply and irrigation equipment',
    icon: '💧',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    metadata: { keywords: ['water', 'irrigation', 'pumps', 'sprinklers'] }
  },
  {
    name: 'Fuel & Energy',
    description: 'Fuel, oil, and energy supplies',
    icon: '⛽',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    metadata: { keywords: ['fuel', 'diesel', 'petrol', 'energy'] }
  }
];

// Universal preset inventory items (template items that can be used by any organization)
const UNIVERSAL_ITEMS = [
  // Livestock
  { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Sheep', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Cattle', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Pigs', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryName: 'Livestock' },
  
  // Feed & Nutrition
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Fish Meal', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Bone Meal', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Feed & Nutrition' },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Feed & Nutrition' },
  { name: 'Mineral Blocks', type: 'CONSUMABLES', unit: 'pieces', categoryName: 'Feed & Nutrition' },
  
  // Medicine & Health
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryName: 'Medicine & Health' },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryName: 'Medicine & Health' },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryName: 'Medicine & Health' },
  { name: 'Vitamin C', type: 'CONSUMABLES', unit: 'bottles', categoryName: 'Medicine & Health' },
  { name: 'Electrolytes', type: 'CONSUMABLES', unit: 'packets', categoryName: 'Medicine & Health' },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Medicine & Health' },
  { name: 'Syringes', type: 'CONSUMABLES', unit: 'pieces', categoryName: 'Medicine & Health' },
  { name: 'Gloves', type: 'CONSUMABLES', unit: 'pairs', categoryName: 'Medicine & Health' },
  
  // Equipment & Tools
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Rake', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Water Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  { name: 'Incubator', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Equipment & Tools' },
  
  // Seeds & Planting
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryName: 'Seeds & Planting' },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryName: 'Seeds & Planting' },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryName: 'Seeds & Planting' },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryName: 'Seeds & Planting' },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryName: 'Seeds & Planting' },
  { name: 'Fruit Tree Seedlings', type: 'PRODUCE', unit: 'pieces', categoryName: 'Seeds & Planting' },
  { name: 'Coffee Seedlings', type: 'PRODUCE', unit: 'pieces', categoryName: 'Seeds & Planting' },
  { name: 'Tea Seedlings', type: 'PRODUCE', unit: 'pieces', categoryName: 'Seeds & Planting' },
  
  // Fertilizers & Soil
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'DAP', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Gypsum', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  { name: 'Organic Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fertilizers & Soil' },
  
  // Pest Control
  { name: 'Arisol Pesticides', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Pest Control' },
  { name: 'Insecticide', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Pest Control' },
  { name: 'Fungicide', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Pest Control' },
  { name: 'Herbicide', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Pest Control' },
  { name: 'Rodenticide', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Pest Control' },
  { name: 'Molluscicide', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Pest Control' },
  { name: 'Nematicide', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Pest Control' },
  { name: 'Bactericide', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Pest Control' },
  
  // Harvest & Storage
  { name: 'Storage Bags', type: 'CONSUMABLES', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Silage Bags', type: 'CONSUMABLES', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Harvest Baskets', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Grain Sacks', type: 'CONSUMABLES', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Cooling Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Drying Racks', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Storage Bins', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Harvest & Storage' },
  { name: 'Preservatives', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Harvest & Storage' },
  
  // Water & Irrigation
  { name: 'Water Pumps', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Water & Irrigation' },
  { name: 'Hoses', type: 'EQUIPMENT', unit: 'meters', categoryName: 'Water & Irrigation' },
  { name: 'Sprinklers', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Water & Irrigation' },
  { name: 'Drip Irrigation', type: 'EQUIPMENT', unit: 'meters', categoryName: 'Water & Irrigation' },
  { name: 'Water Tanks', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Water & Irrigation' },
  { name: 'Pipes', type: 'EQUIPMENT', unit: 'meters', categoryName: 'Water & Irrigation' },
  { name: 'Connectors', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Water & Irrigation' },
  { name: 'Water Filters', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Water & Irrigation' },
  
  // Fuel & Energy
  { name: 'Diesel', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Fuel & Energy' },
  { name: 'Petrol', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Fuel & Energy' },
  { name: 'Engine Oil', type: 'CONSUMABLES', unit: 'liters', categoryName: 'Fuel & Energy' },
  { name: 'Grease', type: 'CONSUMABLES', unit: 'kg', categoryName: 'Fuel & Energy' },
  { name: 'Battery', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Fuel & Energy' },
  { name: 'Solar Panels', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Fuel & Energy' },
  { name: 'Generator', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Fuel & Energy' },
  { name: 'Fuel Cans', type: 'EQUIPMENT', unit: 'pieces', categoryName: 'Fuel & Energy' }
];

async function seedUniversalInventoryCategories() {
  console.log('🌱 Creating universal inventory categories...');

  try {
    // Check if categories already exist
    const existingCategories = await prisma.inventoryCategory.findMany({
      where: { organizationId: null }
    });

    if (existingCategories.length > 0) {
      console.log(`✅ Found ${existingCategories.length} existing universal categories`);
      return existingCategories;
    }

    // Create universal categories (organizationId = null means they're available to all organizations)
    const createdCategories = [];
    for (const category of UNIVERSAL_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: {
          ...category,
          organizationId: null, // null means universal category
        },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created universal category: ${createdCategory.name}`);
    }

    console.log(`🎉 Successfully created ${UNIVERSAL_CATEGORIES.length} universal categories`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error creating universal categories:', error);
    return [];
  }
}

async function seedUniversalInventoryItems() {
  console.log('📦 Creating universal inventory items...');

  try {
    // Get universal categories
    const categories = await prisma.inventoryCategory.findMany({
      where: { organizationId: null }
    });

    if (categories.length === 0) {
      console.log('❌ No universal categories found. Please run seedUniversalInventoryCategories first.');
      return [];
    }

    // Check if items already exist
    const existingItems = await prisma.inventoryItem.findMany({
      where: { organizationId: null }
    });

    if (existingItems.length > 0) {
      console.log(`✅ Found ${existingItems.length} existing universal items`);
      return existingItems;
    }

    // Create universal items (organizationId = null means they're templates for all organizations)
    const createdItems = [];
    for (const item of UNIVERSAL_ITEMS) {
      const category = categories.find(cat => cat.name === item.categoryName);
      if (category) {
        const createdItem = await prisma.inventoryItem.create({
          data: {
            name: item.name,
            type: item.type as any,
            unit: item.unit,
            quantity: 0, // Start with 0 quantity for templates
            categoryId: category.id,
            organizationId: null, // null means universal item template
            metadata: {
              pricePerUnit: null,
              location: null,
              supplier: null,
              purchaseDate: null,
              expiryDate: null,
              minimumStock: null,
              notes: `Universal template item for ${category.name} category`
            }
          },
        });
        createdItems.push(createdItem);
        console.log(`  ✅ Created universal item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully created ${UNIVERSAL_ITEMS.length} universal item templates`);
    return createdItems;
  } catch (error) {
    console.error('❌ Error creating universal items:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting universal inventory seeding process...');

  try {
    // Seed universal categories
    await seedUniversalInventoryCategories();
    
    // Seed universal items
    await seedUniversalInventoryItems();

    console.log('\n🎊 Universal inventory seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Created universal categories available to all organizations');
    console.log('- Created universal item templates that can be copied by any organization');
    console.log('- Organizations can now use these as starting points for their inventory');

  } catch (error) {
    console.error('❌ Universal seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  main();
}

export { seedUniversalInventoryCategories, seedUniversalInventoryItems };

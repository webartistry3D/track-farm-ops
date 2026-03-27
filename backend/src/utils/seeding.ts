/**
 * Direct Nigerian Mixed Farm Seeding Utility
 * No external imports - everything inline
 */

import { prisma } from '../lib/prisma';

// 🌾 NIGERIAN MIXED FARM PRESETS - Complete inline definition
const NIGERIAN_MIXED_FARM_CATEGORIES = [
  {
    name: 'Livestock',
    description: 'Farm animals and livestock',
    icon: '🐄',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    metadata: { keywords: ['animals', 'livestock', 'cattle', 'goats', 'sheep'] }
  },
  {
    name: 'Feed & Nutrition',
    description: 'Animal feed and nutritional supplements',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['feed', 'nutrition', 'animal', 'supplements'] }
  },
  {
    name: 'Medicine & Health',
    description: 'Veterinary medicines and health supplies',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['medicine', 'veterinary', 'health', 'vaccines'] }
  },
  {
    name: 'Equipment & Tools',
    description: 'Farm equipment and tools',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['equipment', 'tools', 'farm', 'machinery'] }
  },
  {
    name: 'Seeds & Planting',
    description: 'Seeds, seedlings, and planting materials',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    metadata: { keywords: ['seeds', 'planting', 'seedlings', 'crops'] }
  },
  {
    name: 'Fertilizers & Soil',
    description: 'Fertilizers and soil amendments',
    icon: '🧪',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    metadata: { keywords: ['fertilizers', 'soil', 'amendments', 'nutrients'] }
  },
  {
    name: 'Harvested Produce',
    description: 'Harvested crops and produce',
    icon: '🌾',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['harvest', 'produce', 'crops', 'yield'] }
  },
  {
    name: 'Animal Products',
    description: 'Products from farm animals',
    icon: '🥛',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['products', 'milk', 'eggs', 'animal'] }
  }
];

const NIGERIAN_MIXED_FARM_ITEMS = [
  // Livestock (6 items)
  { name: 'Local Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 30 },
  { name: 'Sheep', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 25 },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 40 },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 15 },
  { name: 'Ducks', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 20 },
  
  // Feed & Nutrition (6 items)
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 100 },
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 150 },
  { name: 'Grower Mash', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 75 },
  { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 50 },
  { name: 'Finisher Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 80 },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 2, quantity: 25 },
  
  // Medicine & Health (6 items)
  { name: 'Vitamins', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 10 },
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 15 },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 20 },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3, quantity: 30 },
  { name: 'First Aid Kit', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3, quantity: 5 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 12 },
  
  // Equipment & Tools (6 items)
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 3 },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 8 },
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 10 },
  { name: 'Cutlass', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 12 },
  { name: 'Feeding Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 15 },
  { name: 'Water Drinkers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 20 },
  
  // Seeds & Planting (6 items)
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 100 },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 50 },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 25 },
  { name: 'Pepper Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 20 },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 30 },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 40 },
  
  // Fertilizers & Soil (6 items)
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 200 },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 150 },
  { name: 'Organic Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 300 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 250 },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 100 },
  { name: 'Bio-fertilizer', type: 'CONSUMABLES', unit: 'liters', categoryId: 6, quantity: 50 },
  
  // Harvested Produce (6 items)
  { name: 'Fresh Eggs', type: 'PRODUCE', unit: 'pieces', categoryId: 7, quantity: 200 },
  { name: 'Fresh Vegetables', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 75 },
  { name: 'Harvested Maize', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 150 },
  { name: 'Fresh Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 60 },
  { name: 'Fresh Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 40 },
  { name: 'Fresh Beans', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 35 },
  
  // Animal Products (6 items)
  { name: 'Fresh Milk', type: 'ANIMAL_PRODUCTS', unit: 'liters', categoryId: 8, quantity: 50 },
  { name: 'Eggs', type: 'ANIMAL_PRODUCTS', unit: 'pieces', categoryId: 8, quantity: 300 },
  { name: 'Cheese', type: 'ANIMAL_PRODUCTS', unit: 'kg', categoryId: 8, quantity: 25 },
  { name: 'Yogurt', type: 'ANIMAL_PRODUCTS', unit: 'liters', categoryId: 8, quantity: 30 },
  { name: 'Butter', type: 'ANIMAL_PRODUCTS', unit: 'kg', categoryId: 8, quantity: 15 },
  { name: 'Wool', type: 'ANIMAL_PRODUCTS', unit: 'kg', categoryId: 8, quantity: 20 }
];

export async function seedNigerianMixedFarmForOrganization(organizationId: number, organizationName: string) {
  console.log(`🌾 Seeding Nigerian Mixed Farm preset for organization: ${organizationName}`);
  
  try {
    // Check if organization already has inventory
    const existingCategories = await prisma.inventoryCategory.count({
      where: { organizationId }
    });

    if (existingCategories > 0) {
      console.log(`📋 Organization ${organizationName} already has inventory (${existingCategories} categories), skipping auto-seeding`);
      return true;
    }

    // Clear existing inventory for this organization (fresh start)
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create Nigerian Mixed Farm categories
    const createdCategories = [];
    for (const category of NIGERIAN_MIXED_FARM_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create Nigerian Mixed Farm items
    for (const item of NIGERIAN_MIXED_FARM_ITEMS) {
      const category = createdCategories.find(cat => cat.name === NIGERIAN_MIXED_FARM_CATEGORIES[item.categoryId - 1].name);
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
              notes: `Nigerian Mixed Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${NIGERIAN_MIXED_FARM_CATEGORIES.length} categories and ${NIGERIAN_MIXED_FARM_ITEMS.length} items for ${organizationName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error seeding Nigerian Mixed Farm preset for ${organizationName}:`, error);
    return false;
  }
}

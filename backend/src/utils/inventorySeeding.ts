/**
 * Inventory Seeding Utility for Production
 * Contains the Nigerian Mixed Farm preset data and seeding logic
 */

import { prisma } from '../lib/prisma';

// 🌾 SOLE SYSTEM PRESET - Nigerian Mixed Farm Inventory Categories
const SYSTEM_PRESET_CATEGORIES = [
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
    name: 'Fertilizers & Soil',
    description: 'Fertilizers and soil amendments',
    icon: '🧪',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    metadata: { keywords: ['fertilizer', 'soil', 'amendments', 'nutrients'] }
  },
  {
    name: 'Harvested Produce',
    description: 'Freshly harvested farm produce',
    icon: '🥬',
    color: 'bg-lime-100 text-lime-700 border-lime-200',
    metadata: { keywords: ['harvest', 'produce', 'crops', 'vegetables'] }
  },
  {
    name: 'Animal Products',
    description: 'Products derived from farm animals',
    icon: '🥛',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['dairy', 'eggs', 'meat', 'animal-products'] }
  }
];

// 📦 Nigerian Mixed Farm Preset Items
const SYSTEM_PRESET_ITEMS = [
  // Livestock (2 items)
  { name: 'Broilers', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0, pricePerUnit: null },
  { name: 'Layers', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0, pricePerUnit: null },

  // Feed & Nutrition (2 items)
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0, pricePerUnit: null },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0, pricePerUnit: null },

  // Medicine & Health (4 items)
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0, pricePerUnit: null },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 0, pricePerUnit: null },
  { name: 'Vitamins', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0, pricePerUnit: null },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 0, pricePerUnit: null },

  // Fertilizers & Soil (3 items)
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0, pricePerUnit: null },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0, pricePerUnit: null },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0, pricePerUnit: null },

  // Harvested Produce (3 items)
  { name: 'Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0, pricePerUnit: null },
  { name: 'Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0, pricePerUnit: null },
  { name: 'Maize', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0, pricePerUnit: null },

  // Animal Products (1 item)
  { name: 'Eggs', type: 'PRODUCE', unit: 'crates', categoryId: 6, quantity: 0, pricePerUnit: null }
];

/**
 * Seed Nigerian Mixed Farm presets for an organization
 */
export async function seedSystemInventoryForOrganization(organizationId: number) {
  console.log(`🌾 Seeding Nigerian Mixed Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization to ensure clean slate
    console.log(`🧹 Clearing existing inventory for organization ${organizationId}...`);
    await prisma.inventoryItem.deleteMany({
      where: { organizationId }
    });
    await prisma.inventoryCategory.deleteMany({
      where: { organizationId }
    });

    // Create system preset categories
    const createdCategories = [];
    for (const category of SYSTEM_PRESET_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: {
          ...category,
          organizationId,
        }
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${category.name}`);
    }

    // Create system preset items
    for (const item of SYSTEM_PRESET_ITEMS) {
      const category = createdCategories.find(cat => cat.name === SYSTEM_PRESET_CATEGORIES[item.categoryId - 1].name);
      if (category) {
        await prisma.inventoryItem.create({
          data: {
            name: item.name,
            type: item.type as any,
            unit: item.unit,
            quantity: item.quantity,
            description: `${item.name} - ${SYSTEM_PRESET_CATEGORIES[item.categoryId - 1].description}`,
            categoryId: category.id,
            organizationId,
            metadata: {
              pricePerUnit: item.pricePerUnit,
              location: 'Main Store',
              supplier: 'General Supplier',
              purchaseDate: new Date().toISOString(),
              expiryDate: null,
              minimumStock: Math.floor(item.quantity * 0.2), // 20% of current stock
              lastUpdated: new Date().toISOString(),
              batchNumber: `BATCH-${Date.now()}`,
              condition: 'Good',
              notes: `Auto-seeded Nigerian Mixed Farm preset item`
            }
          }
        });
        console.log(`  ✅ Created item: ${item.name} (${item.quantity} ${item.unit})`);
      }
    }

    console.log(`🎉 Successfully seeded ${SYSTEM_PRESET_CATEGORIES.length} categories and ${SYSTEM_PRESET_ITEMS.length} items for organization ${organizationId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding inventory for organization ${organizationId}:`, error);
    return false;
  }
}

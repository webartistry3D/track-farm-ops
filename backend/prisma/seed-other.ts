import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📝 OTHER FARM PRESETS - General purpose farming supplies
const OTHER_CATEGORIES = [
  {
    name: 'General Livestock',
    description: 'Basic livestock and animals',
    icon: '🐄',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    metadata: { keywords: ['animals', 'livestock', 'general', 'mixed'] }
  },
  {
    name: 'General Crops',
    description: 'Basic crops and produce',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['crops', 'produce', 'vegetables', 'fruits', 'general'] }
  },
  {
    name: 'Farm Supplies',
    description: 'General farm supplies and materials',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    metadata: { keywords: ['supplies', 'materials', 'general', 'equipment'] }
  },
  {
    name: 'Farm Health',
    description: 'General health and wellness products',
    icon: '💊',
    color: 'bg-red-100 text-red-700 border-red-200',
    metadata: { keywords: ['health', 'medicine', 'wellness', 'general'] }
  },
  {
    name: 'Storage & Handling',
    description: 'Storage and handling equipment',
    icon: '📦',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['storage', 'handling', 'equipment', 'general'] }
  }
];

const OTHER_ITEMS = [
  // General Livestock (4 items)
  { name: 'Mixed Poultry', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  { name: 'Small Livestock', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 30 },
  { name: 'Farm Animals', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 20 },
  { name: 'Birds', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 40 },
  
  // General Crops (4 items)
  { name: 'Mixed Vegetables', type: 'PRODUCE', unit: 'kg', categoryId: 2, quantity: 100 },
  { name: 'General Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 2, quantity: 50 },
  { name: 'Fresh Produce', type: 'PRODUCE', unit: 'kg', categoryId: 2, quantity: 75 },
  { name: 'Seasonal Crops', type: 'PRODUCE', unit: 'kg', categoryId: 2, quantity: 60 },
  
  // Farm Supplies (5 items)
  { name: 'General Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 15 },
  { name: 'Farm Equipment', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 10 },
  { name: 'Hand Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 20 },
  { name: 'Power Tools', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 5 },
  { name: 'Safety Gear', type: 'EQUIPMENT', unit: 'pieces', categoryId: 3, quantity: 12 },
  
  // Farm Health (4 items)
  { name: 'General Medicine', type: 'CONSUMABLES', unit: 'bottles', categoryId: 4, quantity: 10 },
  { name: 'Health Supplies', type: 'CONSUMABLES', unit: 'pieces', categoryId: 4, quantity: 25 },
  { name: 'First Aid', type: 'CONSUMABLES', unit: 'pieces', categoryId: 4, quantity: 5 },
  { name: 'Wellness Products', type: 'CONSUMABLES', unit: 'pieces', categoryId: 4, quantity: 15 },
  
  // Storage & Handling (4 items)
  { name: 'Storage Containers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 30 },
  { name: 'Handling Equipment', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 12 },
  { name: 'Packaging Materials', type: 'CONSUMABLES', unit: 'pieces', categoryId: 5, quantity: 50 },
  { name: 'Transport Supplies', type: 'EQUIPMENT', unit: 'pieces', categoryId: 5, quantity: 8 }
];

async function seedOtherFarmForOrganization(organizationId: number) {
  console.log(`📝 Seeding Other Farm preset inventory for organization ${organizationId}...`);

  try {
    // Clear existing inventory for this organization
    await prisma.inventoryItem.deleteMany({ where: { organizationId } });
    await prisma.inventoryCategory.deleteMany({ where: { organizationId } });

    // Create other farm categories
    const createdCategories = [];
    for (const category of OTHER_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: { ...category, organizationId },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create other farm items
    for (const item of OTHER_ITEMS) {
      const category = createdCategories.find(cat => cat.name === OTHER_CATEGORIES[item.categoryId - 1].name);
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
              notes: `Other Farm preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${OTHER_CATEGORIES.length} categories and ${OTHER_ITEMS.length} items for other farm`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding other farm inventory:`, error);
    return false;
  }
}

if (require.main === module) {
  // Test with organization ID 1
  seedOtherFarmForOrganization(1)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedOtherFarmForOrganization };

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 🌾 SOLE SYSTEM PRESET - Nigerian Mixed Farm Inventory Categories
// This is the only preset system for TrackFarmOps application
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
    description: 'Freshly harvested crops and farm produce ready for market',
    icon: '🥬',
    color: 'bg-lime-100 text-lime-700 border-lime-200',
    metadata: { keywords: ['harvest', 'crops', 'produce', 'market', 'vegetables', 'fruits', 'grains'] }
  },
  {
    name: 'Animal Products',
    description: 'Products derived from farm animals including eggs, milk, and meat',
    icon: '�',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['eggs', 'milk', 'meat', 'dairy', 'animal products', 'poultry products'] }
  }
];

// 🌾 SOLE SYSTEM PRESET - Nigerian Mixed Farm Inventory Items
// This is the only preset system for TrackFarmOps application
const SYSTEM_PRESET_ITEMS = [
  // Livestock (2 items)
  { name: 'Broilers', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0 },
  { name: 'Layers', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0 },

  // Feed & Nutrition (2 items)
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },

  // Medicine & Health (4 items)
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0 },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 0 },
  { name: 'Vitamins', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 0 },

  // Fertilizers & Soil (3 items)
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0 },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 4, quantity: 0 },

  // Harvested Produce (3 items)
  { name: 'Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },
  { name: 'Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },
  { name: 'Maize', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },

  // Animal Products (1 item)
  { name: 'Eggs', type: 'PRODUCE', unit: 'crates', categoryId: 6, quantity: 0 }
];

async function seedSystemInventoryForOrganization(organizationId: number) {
  console.log(`� Seeding Nigerian Mixed Farm preset inventory for organization ${organizationId}...`);

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
        },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
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

    console.log(`🎉 Successfully seeded ${SYSTEM_PRESET_CATEGORIES.length} categories and ${SYSTEM_PRESET_ITEMS.length} items for org ${organizationId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding inventory for organization ${organizationId}:`, error);
    return false;
  }
}

async function createTestOrganization() {
  console.log('🏢 Creating test organization...');

  try {
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Farm Organization',
        description: 'A test Nigerian mixed farm for demonstrating inventory management',
      },
    });

    console.log(`✅ Created organization: ${organization.name} (ID: ${organization.id})`);
    return organization;
  } catch (error) {
    console.error('❌ Error creating test organization:', error);
    return null;
  }
}

async function createTestUsers(organizationId: number) {
  console.log('👥 Creating test users...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 12);

    const owner = await prisma.user.create({
      data: {
        name: 'Farm Owner',
        email: 'owner@testfarm.com',
        password: hashedPassword,
        role: 'OWNER',
        organizationId,
      },
    });

    const manager = await prisma.user.create({
      data: {
        name: 'Farm Manager',
        email: 'manager@testfarm.com',
        password: hashedPassword,
        role: 'MANAGER',
        organizationId,
      },
    });

    const worker = await prisma.user.create({
      data: {
        name: 'Farm Worker',
        email: 'worker@testfarm.com',
        password: hashedPassword,
        role: 'WORKER',
        organizationId,
      },
    });

    console.log(`✅ Created test users:`);
    console.log(`   - Owner: ${owner.email} (password: password123)`);
    console.log(`   - Manager: ${manager.email} (password: password123)`);
    console.log(`   - Worker: ${worker.email} (password: password123)`);

    return { owner, manager, worker };
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    return null;
  }
}

async function seedAllOrganizations() {
  console.log(`🌾 Seeding Nigerian Mixed Farm presets for all organizations...`);

  try {
    const organizations = await prisma.organization.findMany();
    console.log(`� Found ${organizations.length} organizations to seed`);

    for (const org of organizations) {
      await seedSystemInventoryForOrganization(org.id);
    }

    console.log(`🎉 Successfully seeded all organizations with Nigerian Mixed Farm presets`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding all organizations:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Nigerian Mixed Farm preset seeding process...');

  try {
    // Seed inventory for all existing organizations
    const seedingSuccess = await seedAllOrganizations();
    if (!seedingSuccess) {
      console.error('❌ Failed to seed inventory');
      return;
    }

    console.log('\n🎊 Nigerian Mixed Farm preset seeding completed successfully!');
    console.log('\n� Note: All existing organizations have been updated with the new inventory preset.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  main();
}

export { 
  seedSystemInventoryForOrganization, 
  createTestOrganization, 
  createTestUsers,
  seedAllOrganizations
};

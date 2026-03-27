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
    name: 'Harvested Produce',
    description: 'Freshly harvested crops and farm produce ready for market',
    icon: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200',
    metadata: { keywords: ['harvest', 'crops', 'produce', 'market', 'vegetables', 'fruits', 'grains'] }
  },
  {
    name: 'Animal Products',
    description: 'Products derived from farm animals including eggs, milk, and meat',
    icon: '🥚',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    metadata: { keywords: ['eggs', 'milk', 'meat', 'dairy', 'animal products', 'poultry products'] }
  }
];

// 🌾 SOLE SYSTEM PRESET - Nigerian Mixed Farm Inventory Items
// This is the only preset system for TrackFarmOps application
const SYSTEM_PRESET_ITEMS = [
  // Livestock (8 items)
  { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 50 },
  { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 30 },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 15 },
  { name: 'Local Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 25 },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 10 },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 20 },
  { name: 'Guinea Fowls', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 12 },
  { name: 'Ducks', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 8 },
  
  // Feed & Nutrition (6 items)
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 100 },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 75 },
  { name: 'Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 50 },
  { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 25 },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 2, quantity: 10 },
  { name: 'Mineral Blocks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 2, quantity: 40 },
  
  // Medicine & Health (6 items)
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 20 },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 30 },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3, quantity: 15 },
  { name: 'Vitamins', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 25 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 12 },
  { name: 'Syringes', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3, quantity: 50 },
  
  // Equipment & Tools (8 items)
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 5 },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 8 },
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 12 },
  { name: 'Water Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 15 },
  { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 10 },
  { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 25 },
  { name: 'Watering Cans', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 10 },
  { name: 'Cutlasses', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 20 },
  
  // Seeds & Planting (6 items)
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 50 },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 25 },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 30 },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 20 },
  { name: 'Pepper Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 15 },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 10 },
  
  // Fertilizers & Soil (6 items)
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 40 },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 25 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 100 },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 75 },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 30 },
  { name: 'Organic Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 20 },
  
  // Harvested Produce (5 items)
  { name: 'Fresh Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 60 },
  { name: 'Fresh Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 40 },
  { name: 'Fresh Leafy Vegetables', type: 'PRODUCE', unit: 'bunches', categoryId: 7, quantity: 25 },
  { name: 'Fresh Maize', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 80 },
  { name: 'Fresh Eggs', type: 'PRODUCE', unit: 'pieces', categoryId: 7, quantity: 100 },
  
  // Animal Products (6 items)
  { name: 'Farm Eggs', type: 'PRODUCE', unit: 'crates', categoryId: 8, quantity: 50 },
  { name: 'Fresh Milk', type: 'PRODUCE', unit: 'liters', categoryId: 8, quantity: 20 },
  { name: 'Chicken Meat', type: 'PRODUCE', unit: 'kg', categoryId: 8, quantity: 30 },
  { name: 'Goat Meat', type: 'PRODUCE', unit: 'kg', categoryId: 8, quantity: 15 },
  { name: 'Cheese', type: 'PRODUCE', unit: 'kg', categoryId: 8, quantity: 10 },
  { name: 'Yogurt', type: 'PRODUCE', unit: 'liters', categoryId: 8, quantity: 5 }
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

    console.log(`🎉 Successfully seeded ${SYSTEM_PRESET_CATEGORIES.length} categories and ${SYSTEM_PRESET_ITEMS.length} items for organization ${organizationId}`);
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
    // Option 1: Create test organization and seed it
    const organization = await createTestOrganization();
    if (!organization) {
      console.error('❌ Failed to create organization');
      return;
    }

    // Create test users
    const users = await createTestUsers(organization.id);
    if (!users) {
      console.error('❌ Failed to create users');
      return;
    }

    // Seed Nigerian Mixed Farm inventory for the organization
    const seedingSuccess = await seedSystemInventoryForOrganization(organization.id);
    if (!seedingSuccess) {
      console.error('❌ Failed to seed inventory');
      return;
    }

    console.log('\n🎊 Nigerian Mixed Farm preset seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Organization: Test Farm Organization (Nigerian Mixed Farm)');
    console.log('Owner: owner@testfarm.com (password: password123)');
    console.log('Manager: manager@testfarm.com (password: password123)');
    console.log('Worker: worker@testfarm.com (password: password123)');
    console.log('\n📝 Note: Only Owner and Manager can access inventory. Worker will see access restricted message.');

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

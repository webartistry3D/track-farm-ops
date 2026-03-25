import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Preset inventory categories for small-scale Nigerian mixed farm
const PRESET_CATEGORIES = [
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

// Preset inventory items for small-scale Nigerian mixed farm
const PRESET_ITEMS = [
  // Livestock (8 items)
  { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Local Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Guinea Fowls', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Ducks', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  
  // Feed & Nutrition (6 items)
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 2 },
  { name: 'Mineral Blocks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 2 },
  
  // Medicine & Health (6 items)
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3 },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3 },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3 },
  { name: 'Vitamins', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3 },
  { name: 'Syringes', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3 },
  
  // Equipment & Tools (8 items)
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Water Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Watering Cans', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Cutlasses', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  
  // Seeds & Planting (6 items)
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5 },
  { name: 'Pepper Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5 },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5 },
  
  // Fertilizers & Soil (6 items)
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Organic Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  
  // Harvested Produce (6 items)
  { name: 'Fresh Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 7 },
  { name: 'Fresh Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 7 },
  { name: 'Fresh Onions', type: 'PRODUCE', unit: 'kg', categoryId: 7 },
  { name: 'Fresh Leafy Vegetables', type: 'PRODUCE', unit: 'bunches', categoryId: 7 },
  { name: 'Fresh Maize', type: 'PRODUCE', unit: 'kg', categoryId: 7 },
  { name: 'Fresh Eggs', type: 'PRODUCE', unit: 'pieces', categoryId: 7 },
  
  // Animal Products (6 items)
  { name: 'Farm Eggs', type: 'PRODUCE', unit: 'crates', categoryId: 8 },
  { name: 'Fresh Milk', type: 'PRODUCE', unit: 'liters', categoryId: 8 },
  { name: 'Chicken Meat', type: 'PRODUCE', unit: 'kg', categoryId: 8 },
  { name: 'Goat Meat', type: 'PRODUCE', unit: 'kg', categoryId: 8 },
  { name: 'Cheese', type: 'PRODUCE', unit: 'kg', categoryId: 8 },
  { name: 'Yogurt', type: 'PRODUCE', unit: 'liters', categoryId: 8 }
];

async function seedInventoryForOrganization(organizationId: number) {
  console.log(`🌱 Seeding preset inventory for organization ${organizationId}...`);

  try {
    // Create preset categories
    const createdCategories = [];
    for (const category of PRESET_CATEGORIES) {
      const createdCategory = await prisma.inventoryCategory.create({
        data: {
          ...category,
          organizationId,
        },
      });
      createdCategories.push(createdCategory);
      console.log(`  ✅ Created category: ${createdCategory.name}`);
    }

    // Create preset items
    for (const item of PRESET_ITEMS) {
      const category = createdCategories.find(cat => cat.name === PRESET_CATEGORIES[item.categoryId - 1].name);
      if (category) {
        await prisma.inventoryItem.create({
          data: {
            name: item.name,
            type: item.type as any,
            unit: item.unit,
            quantity: 0,
            categoryId: category.id,
            organizationId,
            metadata: {
              pricePerUnit: null,
              location: null,
              supplier: null,
              purchaseDate: null,
              expiryDate: null,
              minimumStock: null,
              notes: `Preset item for ${category.name} category`
            }
          },
        });
        console.log(`  ✅ Created item: ${item.name} in ${category.name}`);
      }
    }

    console.log(`🎉 Successfully seeded ${PRESET_CATEGORIES.length} categories and ${PRESET_ITEMS.length} items for organization ${organizationId}`);
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
        description: 'A test farm for demonstrating inventory management',
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

async function main() {
  console.log('🚀 Starting inventory seeding process...');

  try {
    // Create test organization
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

    // Seed inventory for the organization
    const seedingSuccess = await seedInventoryForOrganization(organization.id);
    if (!seedingSuccess) {
      console.error('❌ Failed to seed inventory');
      return;
    }

    console.log('\n🎊 Seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Organization: Test Farm Organization');
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

export { seedInventoryForOrganization, createTestOrganization, createTestUsers };

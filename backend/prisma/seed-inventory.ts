import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Preset inventory categories for farm operations
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

// Preset inventory items
const PRESET_ITEMS = [
  // Livestock
  { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Turkeys', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Sheep', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Cattle', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Pigs', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  { name: 'Rabbits', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1 },
  
  // Feed & Nutrition
  { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Fish Meal', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Bone Meal', type: 'CONSUMABLES', unit: 'kg', categoryId: 2 },
  { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 2 },
  { name: 'Mineral Blocks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 2 },
  
  // Medicine & Health
  { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3 },
  { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3 },
  { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3 },
  { name: 'Vitamin C', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3 },
  { name: 'Electrolytes', type: 'CONSUMABLES', unit: 'packets', categoryId: 3 },
  { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3 },
  { name: 'Syringes', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3 },
  { name: 'Gloves', type: 'CONSUMABLES', unit: 'pairs', categoryId: 3 },
  
  // Equipment & Tools
  { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Rake', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Water Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  { name: 'Incubator', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4 },
  
  // Seeds & Planting
  { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5 },
  { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5 },
  { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5 },
  { name: 'Fruit Tree Seedlings', type: 'PRODUCE', unit: 'pieces', categoryId: 5 },
  { name: 'Coffee Seedlings', type: 'PRODUCE', unit: 'pieces', categoryId: 5 },
  { name: 'Tea Seedlings', type: 'PRODUCE', unit: 'pieces', categoryId: 5 },
  
  // Fertilizers & Soil
  { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'DAP', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Gypsum', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  { name: 'Organic Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6 },
  
  // Pest Control
  { name: 'Arisol Pesticides', type: 'CONSUMABLES', unit: 'liters', categoryId: 7 },
  { name: 'Insecticide', type: 'CONSUMABLES', unit: 'liters', categoryId: 7 },
  { name: 'Fungicide', type: 'CONSUMABLES', unit: 'liters', categoryId: 7 },
  { name: 'Herbicide', type: 'CONSUMABLES', unit: 'liters', categoryId: 7 },
  { name: 'Rodenticide', type: 'CONSUMABLES', unit: 'kg', categoryId: 7 },
  { name: 'Molluscicide', type: 'CONSUMABLES', unit: 'kg', categoryId: 7 },
  { name: 'Nematicide', type: 'CONSUMABLES', unit: 'kg', categoryId: 7 },
  { name: 'Bactericide', type: 'CONSUMABLES', unit: 'kg', categoryId: 7 },
  
  // Harvest & Storage
  { name: 'Storage Bags', type: 'CONSUMABLES', unit: 'pieces', categoryId: 8 },
  { name: 'Silage Bags', type: 'CONSUMABLES', unit: 'pieces', categoryId: 8 },
  { name: 'Harvest Baskets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 8 },
  { name: 'Grain Sacks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 8 },
  { name: 'Cooling Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 8 },
  { name: 'Drying Racks', type: 'EQUIPMENT', unit: 'pieces', categoryId: 8 },
  { name: 'Storage Bins', type: 'EQUIPMENT', unit: 'pieces', categoryId: 8 },
  { name: 'Preservatives', type: 'CONSUMABLES', unit: 'kg', categoryId: 8 },
  
  // Water & Irrigation
  { name: 'Water Pumps', type: 'EQUIPMENT', unit: 'pieces', categoryId: 9 },
  { name: 'Hoses', type: 'EQUIPMENT', unit: 'meters', categoryId: 9 },
  { name: 'Sprinklers', type: 'EQUIPMENT', unit: 'pieces', categoryId: 9 },
  { name: 'Drip Irrigation', type: 'EQUIPMENT', unit: 'meters', categoryId: 9 },
  { name: 'Water Tanks', type: 'EQUIPMENT', unit: 'pieces', categoryId: 9 },
  { name: 'Pipes', type: 'EQUIPMENT', unit: 'meters', categoryId: 9 },
  { name: 'Connectors', type: 'EQUIPMENT', unit: 'pieces', categoryId: 9 },
  { name: 'Water Filters', type: 'EQUIPMENT', unit: 'pieces', categoryId: 9 },
  
  // Fuel & Energy
  { name: 'Diesel', type: 'CONSUMABLES', unit: 'liters', categoryId: 10 },
  { name: 'Petrol', type: 'CONSUMABLES', unit: 'liters', categoryId: 10 },
  { name: 'Engine Oil', type: 'CONSUMABLES', unit: 'liters', categoryId: 10 },
  { name: 'Grease', type: 'CONSUMABLES', unit: 'kg', categoryId: 10 },
  { name: 'Battery', type: 'EQUIPMENT', unit: 'pieces', categoryId: 10 },
  { name: 'Solar Panels', type: 'EQUIPMENT', unit: 'pieces', categoryId: 10 },
  { name: 'Generator', type: 'EQUIPMENT', unit: 'pieces', categoryId: 10 },
  { name: 'Fuel Cans', type: 'EQUIPMENT', unit: 'pieces', categoryId: 10 }
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

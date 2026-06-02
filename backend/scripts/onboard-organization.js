const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ============================================
// 🏢 CUSTOMIZE YOUR ORGANIZATION DETAILS HERE
// ============================================

const ORGANIZATION_CONFIG = {
  name: 'Egobam Agro-Allied and Farms Limited',
  description: 'Your farm description here',
};

const OWNER_CONFIG = {
  name: 'Godwin Egbufo',
  email:'godwin.e@egobam.com',
  password: 'Godwinegbufo#', // Change this to a secure password
};

const MANAGERS_CONFIG = [
  {
    name: 'Ogechi Domenica',
    email: 'ogechi.d@egobam.com',
    password: 'Ogechidomenica#', // Change this to a secure password
  },
  {
    name: 'Kehinde David Adeniyi',
    email: 'kehinde.a@egobam.com',
    password: 'Kehindeadeniyi#', // Change this to a secure password
  },
  // Add more managers as needed
{
    name: 'Ngozi Egbufo',
    email: 'ngozi.e@egobam.com',
    password: 'Ngoziegbufo#', // Change this to a secure password
  },
  {
    name: 'Godwin Beshelunim Iki',
    email: 'godwin.i@egobam.com',
    password: 'Godwiniki#', // Change this to a secure password
  },
  {
    name: 'Abdulraheem Muhammad',
    email: 'abdulraheem.m@egobam.com',
    password: 'Abdulraheemmuhammad#', // Change this to a secure password
  },
];

const WORKERS_CONFIG = [
  {
    name: 'Chika Samuel	Anoshiri',
    email: 'chika.a@egobam.com',
    password: 'Chikeanoshiri#', // Change this to a secure password
  },
  {
    name: 'Wisdom	Onwana',
    email: 'wisdom.o@egobam.com',
    password: 'Wisdomonwana#', // Change this to a secure password
  },
  {
    name: 'Geoffrey Tyolumun	Tavershima',
    email: 'geoffrey.t@egobam.com',
    password: 'Geoffreytavershima#', // Change this to a secure password
  },
  // Add more workers as needed
    {
    name: 'Obinna Matthew	Okoro',
    email: 'obinna.o@egobam.com',
    password: 'Obinnaokoro#', // Change this to a secure password
  },
    {
    name: 'Glory Ihiechi Okere',
    email: 'glory.o@egobam.com',
    password: 'Gloryokere#', // Change this to a secure password
  },
    {
    name: 'Timothy Aboga',
    email: 'timothy.a@egobam.com',
    password: 'Timothya#', // Change this to a secure password
  },
];

const ACCOUNTANTS_CONFIG = [
  {
    name: 'Accountant User',
    email: 'accountant@egobam.com',
    password: 'Accountant123#', // Change this to a secure password
  },
  // Add more accountants as needed
];

const INVENTORY_MANAGERS_CONFIG = [
  {
    name: 'Inventory Manager',
    email: 'inventory@egobam.com',
    password: 'Inventory123#', // Change this to a secure password
  },
  // Add more inventory managers as needed
];

const VETERINARIANS_CONFIG = [
  {
    name: 'Veterinarian',
    email: 'veterinarian@egobam.com',
    password: 'Veterinarian123#', // Change this to a secure password
  },
  // Add more veterinarians as needed
];

// ============================================
// 🚀 ONBOARDING SCRIPT - DO NOT MODIFY BELOW
// ============================================

async function createOrganization() {
  console.log('🏢 Creating organization...');

  try {
    const organization = await prisma.organization.create({
      data: {
        name: ORGANIZATION_CONFIG.name,
        description: ORGANIZATION_CONFIG.description,
      },
    });

    console.log(`✅ Created organization: ${organization.name} (ID: ${organization.id})`);
    return organization;
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    return null;
  }
}

async function createOwner(organizationId) {
  console.log('👤 Creating owner...');

  try {
    const hashedPassword = await bcrypt.hash(OWNER_CONFIG.password, 12);

    const owner = await prisma.user.create({
      data: {
        name: OWNER_CONFIG.name,
        email: OWNER_CONFIG.email,
        password: hashedPassword,
        role: 'OWNER',
        organizationId,
      },
    });

    console.log(`✅ Created owner: ${owner.name} (${owner.email})`);
    return owner;
  } catch (error) {
    console.error('❌ Error creating owner:', error);
    return null;
  }
}

async function createManagers(organizationId) {
  console.log(`👥 Creating ${MANAGERS_CONFIG.length} managers...`);

  const managers = [];

  for (const managerConfig of MANAGERS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(managerConfig.password, 12);

      const manager = await prisma.user.create({
        data: {
          name: managerConfig.name,
          email: managerConfig.email,
          password: hashedPassword,
          role: 'MANAGER',
          organizationId,
        },
      });

      console.log(`✅ Created manager: ${manager.name} (${manager.email})`);
      managers.push(manager);
    } catch (error) {
      console.error(`❌ Error creating manager ${managerConfig.name}:`, error);
    }
  }

  return managers;
}

async function createWorkers(organizationId) {
  console.log(`👥 Creating ${WORKERS_CONFIG.length} workers...`);

  const workers = [];

  for (const workerConfig of WORKERS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(workerConfig.password, 12);

      const worker = await prisma.user.create({
        data: {
          name: workerConfig.name,
          email: workerConfig.email,
          password: hashedPassword,
          role: 'WORKER',
          organizationId,
        },
      });

      console.log(`✅ Created worker: ${worker.name} (${worker.email})`);
      workers.push(worker);
    } catch (error) {
      console.error(`❌ Error creating worker ${workerConfig.name}:`, error);
    }
  }

  return workers;
}

async function createAccountants(organizationId) {
  console.log(`💰 Creating ${ACCOUNTANTS_CONFIG.length} accountants...`);

  const accountants = [];

  for (const accountantConfig of ACCOUNTANTS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(accountantConfig.password, 12);

      const accountant = await prisma.user.create({
        data: {
          name: accountantConfig.name,
          email: accountantConfig.email,
          password: hashedPassword,
          role: 'ACCOUNTANT',
          organizationId,
        },
      });

      console.log(`✅ Created accountant: ${accountant.name} (${accountant.email})`);
      accountants.push(accountant);
    } catch (error) {
      console.error(`❌ Error creating accountant ${accountantConfig.name}:`, error);
    }
  }

  return accountants;
}

async function createInventoryManagers(organizationId) {
  console.log(`📦 Creating ${INVENTORY_MANAGERS_CONFIG.length} inventory managers...`);

  const inventoryManagers = [];

  for (const inventoryManagerConfig of INVENTORY_MANAGERS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(inventoryManagerConfig.password, 12);

      const inventoryManager = await prisma.user.create({
        data: {
          name: inventoryManagerConfig.name,
          email: inventoryManagerConfig.email,
          password: hashedPassword,
          role: 'INVENTORY',
          organizationId,
        },
      });

      console.log(`✅ Created inventory manager: ${inventoryManager.name} (${inventoryManager.email})`);
      inventoryManagers.push(inventoryManager);
    } catch (error) {
      console.error(`❌ Error creating inventory manager ${inventoryManagerConfig.name}:`, error);
    }
  }

  return inventoryManagers;
}

async function createVeterinarians(organizationId) {
  console.log(`🏥 Creating ${VETERINARIANS_CONFIG.length} veterinarians...`);

  const veterinarians = [];

  for (const veterinarianConfig of VETERINARIANS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(veterinarianConfig.password, 12);

      const veterinarian = await prisma.user.create({
        data: {
          name: veterinarianConfig.name,
          email: veterinarianConfig.email,
          password: hashedPassword,
          role: 'VETERINARIAN',
          organizationId,
        },
      });

      console.log(`✅ Created veterinarian: ${veterinarian.name} (${veterinarian.email})`);
      veterinarians.push(veterinarian);
    } catch (error) {
      console.error(`❌ Error creating veterinarian ${veterinarianConfig.name}:`, error);
    }
  }

  return veterinarians;
}

async function seedSystemInventoryForOrganization(organizationId) {
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

    // System preset categories
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

    // System preset items
    const SYSTEM_PRESET_ITEMS = [
      // Livestock (3 items)
      { name: 'Broiler Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0 },
      { name: 'Layer Chickens', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0 },
      { name: 'Goats', type: 'LIVESTOCK', unit: 'pieces', categoryId: 1, quantity: 0 },
      
      // Feed & Nutrition (6 items)
      { name: 'Broiler Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },
      { name: 'Layer Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },
      { name: 'Grower Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },
      { name: 'Starter Feed', type: 'CONSUMABLES', unit: 'kg', categoryId: 2, quantity: 0 },
      { name: 'Vitamin Supplements', type: 'CONSUMABLES', unit: 'liters', categoryId: 2, quantity: 0 },
      { name: 'Mineral Blocks', type: 'CONSUMABLES', unit: 'pieces', categoryId: 2, quantity: 0 },
      
      // Medicine & Health (6 items)
      { name: 'Antibiotics', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0 },
      { name: 'Vaccines', type: 'CONSUMABLES', unit: 'vials', categoryId: 3, quantity: 0 },
      { name: 'Dewormers', type: 'CONSUMABLES', unit: 'tablets', categoryId: 3, quantity: 0 },
      { name: 'Vitamins', type: 'CONSUMABLES', unit: 'bottles', categoryId: 3, quantity: 0 },
      { name: 'Disinfectants', type: 'CONSUMABLES', unit: 'liters', categoryId: 3, quantity: 0 },
      { name: 'Syringes', type: 'CONSUMABLES', unit: 'pieces', categoryId: 3, quantity: 0 },
      
      // Equipment & Tools (8 items)
      { name: 'Wheelbarrow', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Shovel', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Hoe', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Water Buckets', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Feed Troughs', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Nesting Boxes', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Watering Cans', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      { name: 'Cutlasses', type: 'EQUIPMENT', unit: 'pieces', categoryId: 4, quantity: 0 },
      
      // Seeds & Planting (6 items)
      { name: 'Maize Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },
      { name: 'Rice Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },
      { name: 'Bean Seeds', type: 'PRODUCE', unit: 'kg', categoryId: 5, quantity: 0 },
      { name: 'Tomato Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 0 },
      { name: 'Pepper Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 0 },
      { name: 'Vegetable Seeds', type: 'PRODUCE', unit: 'packets', categoryId: 5, quantity: 0 },
      
      // Fertilizers & Soil (6 items)
      { name: 'NPK Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      { name: 'Urea', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      { name: 'Compost', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      { name: 'Manure', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      { name: 'Lime', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      { name: 'Organic Fertilizer', type: 'CONSUMABLES', unit: 'kg', categoryId: 6, quantity: 0 },
      
      // Harvested Produce (4 items)
      { name: 'Fresh Tomatoes', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 0 },
      { name: 'Fresh Peppers', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 0 },
      { name: 'Fresh Leafy Vegetables', type: 'PRODUCE', unit: 'bunches', categoryId: 7, quantity: 0 },
      { name: 'Fresh Maize', type: 'PRODUCE', unit: 'kg', categoryId: 7, quantity: 0 },
      
      // Animal Products (1 item)
      { name: 'Farm Eggs', type: 'PRODUCE', unit: 'crates', categoryId: 8, quantity: 0 }
    ];

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
            type: item.type,
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

async function main() {
  console.log('🚀 Starting organization onboarding process...\n');

  try {
    // Create organization
    const organization = await createOrganization();
    if (!organization) {
      console.error('❌ Failed to create organization');
      return;
    }

    // Create owner
    const owner = await createOwner(organization.id);
    if (!owner) {
      console.error('❌ Failed to create owner');
      return;
    }

    // Create managers
    const managers = await createManagers(organization.id);
    if (managers.length === 0) {
      console.error('❌ Failed to create any managers');
      return;
    }

    // Create workers
    const workers = await createWorkers(organization.id);
    if (workers.length === 0) {
      console.warn('⚠️ No workers were created (this might be intentional)');
    }

    // Create accountants
    const accountants = await createAccountants(organization.id);
    if (accountants.length === 0) {
      console.warn('⚠️ No accountants were created (this might be intentional)');
    }

    // Create inventory managers
    const inventoryManagers = await createInventoryManagers(organization.id);
    if (inventoryManagers.length === 0) {
      console.warn('⚠️ No inventory managers were created (this might be intentional)');
    }

    // Create veterinarians
    const veterinarians = await createVeterinarians(organization.id);
    if (veterinarians.length === 0) {
      console.warn('⚠️ No veterinarians were created (this might be intentional)');
    }

    // Seed inventory for the organization
    console.log('\n📦 Seeding inventory...');
    const seedingSuccess = await seedSystemInventoryForOrganization(organization.id);
    if (!seedingSuccess) {
      console.error('❌ Failed to seed inventory');
      return;
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🎊 ORGANIZATION ONBOARDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 ORGANIZATION DETAILS:');
    console.log(`   Name: ${organization.name}`);
    console.log(`   ID: ${organization.id}`);
    console.log(`   Description: ${organization.description}`);

    console.log('\n👤 OWNER CREDENTIALS:');
    console.log(`   Name: ${owner.name}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   Password: ${OWNER_CONFIG.password}`);

    console.log('\n👥 MANAGER CREDENTIALS:');
    managers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name}`);
      console.log(`      Email: ${manager.email}`);
      console.log(`      Password: ${MANAGERS_CONFIG[index].password}`);
    });

    console.log('\n👥 WORKER CREDENTIALS:');
    workers.forEach((worker, index) => {
      console.log(`   ${index + 1}. ${worker.name}`);
      console.log(`      Email: ${worker.email}`);
      console.log(`      Password: ${WORKERS_CONFIG[index].password}`);
    });

    console.log('\n💰 ACCOUNTANT CREDENTIALS:');
    accountants.forEach((accountant, index) => {
      console.log(`   ${index + 1}. ${accountant.name}`);
      console.log(`      Email: ${accountant.email}`);
      console.log(`      Password: ${ACCOUNTANTS_CONFIG[index].password}`);
    });

    console.log('\n📦 INVENTORY MANAGER CREDENTIALS:');
    inventoryManagers.forEach((inventoryManager, index) => {
      console.log(`   ${index + 1}. ${inventoryManager.name}`);
      console.log(`      Email: ${inventoryManager.email}`);
      console.log(`      Password: ${INVENTORY_MANAGERS_CONFIG[index].password}`);
    });

    console.log('\n🏥 VETERINARIAN CREDENTIALS:');
    veterinarians.forEach((veterinarian, index) => {
      console.log(`   ${index + 1}. ${veterinarian.name}`);
      console.log(`      Email: ${veterinarian.email}`);
      console.log(`      Password: ${VETERINARIANS_CONFIG[index].password}`);
    });

    console.log('\n📦 INVENTORY:');
    console.log(`   8 categories seeded`);
    console.log(`   40 items seeded`);
    console.log('\n⚠️ IMPORTANT: Change all passwords immediately after first login!\n');

  } catch (error) {
    console.error('❌ Onboarding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the onboarding
main();
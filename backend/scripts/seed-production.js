const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
    name: 'Packaging Materials',
    description: 'Packaging and storage materials',
    icon: '📦',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    metadata: { keywords: ['packaging', 'storage', 'bags', 'containers'] }
  },
  {
    name: 'Infrastructure',
    description: 'Farm buildings and structures',
    icon: '🏠',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    metadata: { keywords: ['buildings', 'structures', 'infrastructure', 'facilities'] }
  }
];

// Preset inventory items for small-scale Nigerian mixed farm
const PRESET_ITEMS = [
  // Livestock
  { name: 'Broiler Chickens', categoryId: 1, quantity: 150, unit: 'birds', pricePerUnit: 1500, minimumStock: 50, notes: 'Day-old chicks for meat production' },
  { name: 'Layer Chickens', categoryId: 1, quantity: 200, unit: 'birds', pricePerUnit: 1200, minimumStock: 100, notes: 'For egg production' },
  { name: 'Goats', categoryId: 1, quantity: 25, unit: 'animals', pricePerUnit: 15000, minimumStock: 10, notes: 'West African dwarf goats' },
  { name: 'Sheep', categoryId: 1, quantity: 15, unit: 'animals', pricePerUnit: 20000, minimumStock: 8, notes: 'West African dwarf sheep' },
  
  // Feed & Nutrition
  { name: 'Chicken Feed - Starter', categoryId: 2, quantity: 500, unit: 'kg', pricePerUnit: 120, minimumStock: 100, notes: 'For chicks 0-4 weeks' },
  { name: 'Chicken Feed - Grower', categoryId: 2, quantity: 300, unit: 'kg', pricePerUnit: 110, minimumStock: 80, notes: 'For chickens 4-8 weeks' },
  { name: 'Chicken Feed - Layer', categoryId: 2, quantity: 400, unit: 'kg', pricePerUnit: 115, minimumStock: 100, notes: 'For laying hens' },
  { name: 'Goat Feed', categoryId: 2, quantity: 200, unit: 'kg', pricePerUnit: 80, minimumStock: 50, notes: 'Concentrated goat feed' },
  { name: 'Fish Meal', categoryId: 2, quantity: 100, unit: 'kg', pricePerUnit: 250, minimumStock: 30, notes: 'Protein supplement' },
  
  // Medicine & Health
  { name: 'Vitamins - Poultry', categoryId: 3, quantity: 50, unit: 'liters', pricePerUnit: 800, minimumStock: 10, notes: 'Multivitamin supplement' },
  { name: 'Antibiotics - Broad Spectrum', categoryId: 3, quantity: 20, unit: 'bottles', pricePerUnit: 2500, minimumStock: 5, notes: 'For bacterial infections' },
  { name: 'Deworming Tablets', categoryId: 3, quantity: 100, unit: 'tablets', pricePerUnit: 50, minimumStock: 20, notes: 'For goats and sheep' },
  { name: 'Vaccines - Newcastle', categoryId: 3, quantity: 30, unit: 'doses', pricePerUnit: 150, minimumStock: 10, notes: 'For poultry vaccination' },
  
  // Equipment & Tools
  { name: 'Wheelbarrows', categoryId: 4, quantity: 3, unit: 'pieces', pricePerUnit: 15000, minimumStock: 1, notes: 'Heavy duty wheelbarrows' },
  { name: 'Shovels', categoryId: 4, quantity: 8, unit: 'pieces', pricePerUnit: 2500, minimumStock: 2, notes: 'Farm shovels' },
  { name: 'Watering Cans', categoryId: 4, quantity: 10, unit: 'pieces', pricePerUnit: 1500, minimumStock: 3, notes: '20-liter watering cans' },
  { name: 'Feed Troughs', categoryId: 4, quantity: 15, unit: 'pieces', pricePerUnit: 3000, minimumStock: 5, notes: 'For livestock feeding' },
  
  // Seeds & Planting
  { name: 'Maize Seeds', categoryId: 5, quantity: 50, unit: 'kg', pricePerUnit: 300, minimumStock: 15, notes: 'Improved hybrid maize' },
  { name: 'Tomato Seeds', categoryId: 5, quantity: 5, unit: 'kg', pricePerUnit: 8000, minimumStock: 2, notes: 'Hybrid tomato seeds' },
  { name: 'Pepper Seeds', categoryId: 5, quantity: 3, unit: 'kg', pricePerUnit: 6000, minimumStock: 1, notes: 'Hot pepper varieties' },
  { name: 'Vegetable Seeds Mix', categoryId: 5, quantity: 10, unit: 'kg', pricePerUnit: 2500, minimumStock: 3, notes: 'Assorted vegetable seeds' },
  
  // Fertilizers & Soil
  { name: 'NPK Fertilizer 15-15-15', categoryId: 6, quantity: 100, unit: 'bags', pricePerUnit: 8500, minimumStock: 20, notes: '50kg bags' },
  { name: 'Urea Fertilizer 46-0-0', categoryId: 6, quantity: 50, unit: 'bags', pricePerUnit: 7500, minimumStock: 15, notes: '50kg bags' },
  { name: 'Organic Compost', categoryId: 6, quantity: 200, unit: 'bags', pricePerUnit: 500, minimumStock: 50, notes: '50kg bags of compost' },
  { name: 'Lime', categoryId: 6, quantity: 30, unit: 'bags', pricePerUnit: 2000, minimumStock: 10, notes: 'For soil pH adjustment' },
  
  // Packaging Materials
  { name: 'Black Nylon Bags', categoryId: 7, quantity: 1000, unit: 'pieces', pricePerUnit: 25, minimumStock: 200, notes: '50kg capacity bags' },
  { name: 'Polyethylene Bags', categoryId: 7, quantity: 500, unit: 'pieces', pricePerUnit: 15, minimumStock: 100, notes: '25kg capacity bags' },
  { name: 'Cartons', categoryId: 7, quantity: 200, unit: 'pieces', pricePerUnit: 100, minimumStock: 50, notes: 'For egg packaging' },
  { name: 'Plastic Containers', categoryId: 7, quantity: 100, unit: 'pieces', pricePerUnit: 250, minimumStock: 30, notes: '10 liter containers' },
  
  // Infrastructure
  { name: 'Chicken Coop - Unit 1', categoryId: 8, quantity: 1, unit: 'structure', pricePerUnit: 50000, minimumStock: 1, notes: 'Houses 100 birds' },
  { name: 'Chicken Coop - Unit 2', categoryId: 8, quantity: 1, unit: 'structure', pricePerUnit: 45000, minimumStock: 1, notes: 'Houses 80 birds' },
  { name: 'Goat Pen', categoryId: 8, quantity: 1, unit: 'structure', pricePerUnit: 35000, minimumStock: 1, notes: 'Houses 15 goats' },
  { name: 'Feed Storage Room', categoryId: 8, quantity: 1, unit: 'structure', pricePerUnit: 25000, minimumStock: 1, notes: 'Climate controlled storage' }
];

async function seedProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Starting production database seeding...');
    
    // Step 1: Check if admin user already exists
    console.log('👤 Checking for existing admin user...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists, checking inventory data...');
    } else {
      // Step 2: Get or create default organization
      console.log('🏢 Setting up default organization...');
      let organization;
      
      try {
        // Try to find an existing organization first
        const existingOrg = await prisma.organization.findFirst();
        if (existingOrg) {
          organization = existingOrg;
          console.log(`✅ Using existing organization: ${organization.name} (ID: ${organization.id})`);
        } else {
          // Create new organization
          organization = await prisma.organization.create({
            data: {
              name: 'default',
              description: 'Default organization for TrackFarmOps'
            }
          });
          console.log(`✅ Created new organization: ${organization.name} (ID: ${organization.id})`);
        }
      } catch (orgError) {
        console.error('❌ Organization setup failed:', orgError);
        throw new Error(`Failed to setup organization: ${orgError.message}`);
      }
      
      // Step 3: Create admin user
      console.log('👑 Creating admin user...');
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const adminUser = await prisma.user.create({
          data: {
            name: 'Kelechi Owner',
            email: 'kelechi@owner.com',
            password: hashedPassword,
            role: 'OWNER',
            organizationId: organization.id
          }
        });
        
        console.log('✅ Admin user created successfully!');
        console.log(`📧 Email: ${adminUser.email}`);
        console.log(`🔑 Password: admin123`);
        console.log(`🏢 Organization: ${organization.name} (ID: ${organization.id})`);
        console.log(`👤 User ID: ${adminUser.id}`);
        
      } catch (userError) {
        console.error('❌ Admin user creation failed:', userError);
        throw new Error(`Failed to create admin user: ${userError.message}`);
      }
    }
    
    // Step 4: Get organization for inventory seeding
    const organization = await prisma.organization.findFirst();
    if (!organization) {
      throw new Error('No organization found for inventory seeding');
    }
    
    // Step 5: Seed inventory categories
    console.log('📁 Seeding inventory categories...');
    const existingCategories = await prisma.inventoryCategory.count({
      where: { organizationId: organization.id }
    });
    
    if (existingCategories === 0) {
      console.log('📂 Creating preset categories...');
      for (const category of PRESET_CATEGORIES) {
        await prisma.inventoryCategory.create({
          data: {
            ...category,
            organizationId: organization.id
          }
        });
      }
      console.log(`✅ Created ${PRESET_CATEGORIES.length} preset categories`);
    } else {
      console.log(`✅ Found ${existingCategories} existing categories, skipping category seeding`);
    }
    
    // Step 6: Get created categories for item seeding
    const categories = await prisma.inventoryCategory.findMany({
      where: { organizationId: organization.id },
      orderBy: { id: 'asc' }
    });
    
    // Step 7: Seed inventory items
    console.log('📦 Seeding inventory items...');
    const existingItems = await prisma.inventoryItem.count({
      where: { organizationId: organization.id }
    });
    
    if (existingItems === 0) {
      console.log('📋 Creating preset inventory items...');
      for (const item of PRESET_ITEMS) {
        const category = categories[item.categoryId - 1]; // Adjust for 0-based index
        if (category) {
          await prisma.inventoryItem.create({
            data: {
              name: item.name,
              categoryId: category.id,
              quantity: item.quantity,
              unit: item.unit,
              pricePerUnit: item.pricePerUnit,
              minimumStock: item.minimumStock,
              notes: item.notes,
              organizationId: organization.id
            }
          });
        }
      }
      console.log(`✅ Created ${PRESET_ITEMS.length} preset inventory items`);
    } else {
      console.log(`✅ Found ${existingItems} existing inventory items, skipping item seeding`);
    }
    
    // Step 8: Final verification
    console.log('🔍 Verifying setup...');
    const verification = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    const categoryCount = await prisma.inventoryCategory.count({
      where: { organizationId: organization.id }
    });
    const itemCount = await prisma.inventoryItem.count({
      where: { organizationId: organization.id }
    });
    
    if (verification) {
      console.log('✅ Setup verification successful!');
      console.log(`📊 Total users: ${await prisma.user.count()}`);
      console.log(`📊 Total organizations: ${await prisma.organization.count()}`);
      console.log(`📊 Total categories: ${categoryCount}`);
      console.log(`📊 Total inventory items: ${itemCount}`);
    } else {
      throw new Error('Verification failed - admin user not found after creation');
    }
    
    console.log('🎉 Production database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedProduction()
    .then(() => {
      console.log('✅ Seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProduction };

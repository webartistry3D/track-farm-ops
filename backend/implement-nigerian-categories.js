const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function implementNigerianFarmCategories() {
  try {
    console.log('🇳🇬 Implementing comprehensive Nigerian farm inventory categories...');

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });

    console.log(`📊 Found ${organizations.length} organizations`);

    // Step 1: Clear existing categories
    console.log('\n📋 Step 1: Clearing existing categories...');
    const deletedCategories = await prisma.inventoryCategory.deleteMany({});
    console.log(`  ✅ Deleted ${deletedCategories.count} existing categories`);

    // Step 2: Define comprehensive Nigerian farm categories
    console.log('\n📋 Step 2: Adding Nigerian farm categories...');

    const nigerianFarmCategories = [
      // Crop Production Categories
      {
        name: 'Seeds & Planting Materials',
        description: 'Crop seeds (maize, rice, beans), vegetable seeds (tomatoes, peppers), tree seedlings (oil palm, cocoa), fertilizers (NPK, urea), organic manure',
        icon: '🌱',
        color: '#10B981'
      },
      {
        name: 'Crop Protection',
        description: 'Pesticides, insecticides, herbicides, fungicides, neem oil, organic pesticides, sprayers, knapsack sprayers, protective gear (gloves, masks, boots)',
        icon: '🛡️',
        color: '#EF4444'
      },
      {
        name: 'Farm Machinery & Equipment',
        description: 'Tractors & implements (ploughs, harrows, ridgers), power tillers, processing equipment (milling machines, threshers), irrigation systems',
        icon: '🚜',
        color: '#3B82F6'
      },
      {
        name: 'Harvesting & Storage',
        description: 'Harvesting tools (cutlasses, sickles), storage equipment (silos, bags, crates), post-harvest equipment (dryers, threshers), preservation materials',
        icon: '🌾',
        color: '#F59E0B'
      },

      // Livestock Categories
      {
        name: 'Animal Feed & Nutrition',
        description: 'Poultry feed (broiler, layer), livestock feed (cattle, goat), feed supplements (vitamin premixes, mineral blocks), feed storage equipment',
        icon: '🥗',
        color: '#84CC16'
      },
      {
        name: 'Livestock Equipment',
        description: 'Housing (cages, coops, pens, fencing), water & feed systems (troughs, feeders, drinkers), handling equipment (loading ramps, crushes, scales)',
        icon: '🐄',
        color: '#8B5CF6'
      },
      {
        name: 'Animal Health & Veterinary',
        description: 'Medicines (antibiotics, anti-parasitics), vaccines (Newcastle disease, fowlpox), first aid supplies, diagnostic equipment (test kits, syringes)',
        icon: '🏥',
        color: '#EC4899'
      },

      // Aquaculture
      {
        name: 'Fish Farming',
        description: 'Fish stock (fingerlings, catfish, tilapia), fish feed (floating, sinking), pond equipment (nets, aerators, pumps), water treatment supplies',
        icon: '🐟',
        color: '#06B6D4'
      },

      // Perennial Crops
      {
        name: 'Tree Crops & Plantations',
        description: 'Oil palm (seedlings, fertilizers), cocoa (seedlings, fungicides), cashew (seedlings, processing), rubber (seedlings, tapping equipment)',
        icon: '🌳',
        color: '#059669'
      },
      {
        name: 'Root & Tuber Crops',
        description: 'Yam (seed yams, fertilizers), cassava (stem cuttings, processors), potato (seed potatoes), sweet potato (vines, curing equipment)',
        icon: '🥔',
        color: '#A16207'
      },

      // Vegetables
      {
        name: 'Vegetable Production',
        description: 'Leafy vegetables (ugu, waterleaf, scent leaf), fruit vegetables (tomato, pepper), root vegetables (carrot, radish), protected cultivation materials',
        icon: '🥬',
        color: '#16A34A'
      },

      // Poultry Specialized
      {
        name: 'Poultry Production',
        description: 'Day-old chicks (broilers, layers), equipment (brooders, incubators), processing equipment, waste management systems, packaging materials',
        icon: '🐓',
        color: '#DC2626'
      },

      // Small Ruminants
      {
        name: 'Small Ruminant Farming',
        description: 'Breeding stock (goats, sheep), feeding (concentrates, forage), housing (pens, fencing), health supplies (dewormers, vaccines)',
        icon: '🐐',
        color: '#92400E'
      },

      // Farm Infrastructure
      {
        name: 'Farm Buildings & Structures',
        description: 'Storage (warehouses, cold rooms), processing facilities, staff housing, utilities (solar systems, generators, water tanks)',
        icon: '🏗️',
        color: '#6B7280'
      },
      {
        name: 'Farm Supplies & Consumables',
        description: 'Office supplies (record books, stationery), fuel & energy (diesel, petrol), packaging materials (bags, boxes), safety equipment',
        icon: '📦',
        color: '#0EA5E9'
      },
      {
        name: 'Transportation & Logistics',
        description: 'Vehicles (pickup trucks, motorcycles), loading equipment (wheelbarrows, carts), market preparation (crates, scales), communication devices',
        icon: '🚚',
        color: '#EA580C'
      },

      // Organic & Sustainable
      {
        name: 'Organic Inputs',
        description: 'Biofertilizers (mycorrhiza, rhizobium), biopesticides (neem products), soil amendments (biochar, compost), water conservation equipment',
        icon: '🍃',
        color: '#22C55E'
      },
      {
        name: 'Renewable Energy',
        description: 'Solar equipment (pumps, lights), biogas (digesters, stoves), wind energy (pumps, turbines), energy storage (batteries, inverters)',
        icon: '⚡',
        color: '#F97316'
      },

      // Farm Management
      {
        name: 'Digital & Technology',
        description: 'Farm management software, measurement tools (soil test kits, pH meters), communication devices, data storage equipment (computers, tablets)',
        icon: '💻',
        color: '#7C3AED'
      },
      {
        name: 'Financial & Legal',
        description: 'Banking materials (receipt books, cash boxes), documentation (land papers, permits), insurance papers, marketing materials (labels, branding)',
        icon: '💰',
        color: '#1F2937'
      }
    ];

    let totalCategoriesAdded = 0;

    // Add categories for each organization
    for (const organization of organizations) {
      console.log(`\n🏢 Processing organization: ${organization.name} (ID: ${organization.id})`);

      for (const category of nigerianFarmCategories) {
        const createdCategory = await prisma.inventoryCategory.create({
          data: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            organizationId: organization.id,
            isSubcategory: false,
            parentId: null
          }
        });
        
        console.log(`    ✅ Added: ${category.name} ${category.icon}`);
        totalCategoriesAdded++;
      }
    }

    // Step 3: Verification
    console.log('\n📋 Step 3: Verification...');
    
    const finalCategories = await prisma.inventoryCategory.groupBy({
      by: ['organizationId'],
      _count: { id: true }
    });

    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`📊 Total Nigerian farm categories added: ${totalCategoriesAdded}`);
    console.log(`📊 Categories per organization: ${nigerianFarmCategories.length}`);
    
    console.log('\n📊 Categories per organization:');
    for (const orgCount of finalCategories) {
      const org = organizations.find(o => o.id === orgCount.organizationId);
      console.log(`  🏢 ${org?.name || 'Unknown'}: ${orgCount._count.id} categories`);
    }

    console.log('\n🌱 Nigerian Farm Categories Implemented:');
    console.log('✅ Crop Production (4 categories)');
    console.log('✅ Livestock (3 categories)');
    console.log('✅ Aquaculture (1 category)');
    console.log('✅ Perennial Crops (2 categories)');
    console.log('✅ Vegetables (1 category)');
    console.log('✅ Poultry (1 category)');
    console.log('✅ Small Ruminants (1 category)');
    console.log('✅ Farm Infrastructure (3 categories)');
    console.log('✅ Organic & Sustainable (2 categories)');
    console.log('✅ Farm Management (2 categories)');
    console.log(`✅ Total: ${nigerianFarmCategories.length} specialized categories`);

    console.log('\n🎉 Comprehensive Nigerian farm inventory categories implemented successfully! 🇳🇬');

  } catch (error) {
    console.error('❌ Error implementing Nigerian farm categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the implementation
implementNigerianFarmCategories();

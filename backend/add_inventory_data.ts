import { PrismaClient, InventoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function addInventoryData() {
  console.log('Adding comprehensive inventory data...');

  try {
    // Get the organization
    const organization = await prisma.organization.findFirst({
      where: { name: 'Default Farm Organization' }
    });

    if (!organization) {
      console.error('Organization not found');
      return;
    }

    console.log('Using organization:', organization.id);

    // Add inventory categories
    const categories = await prisma.inventoryCategory.createMany({
      data: [
        { name: 'Seeds & Planting', description: 'Planting materials, seeds, and seedlings for crop production', icon: 'seed', color: 'green', organizationId: organization.id },
        { name: 'Fertilizers & Nutrients', description: 'Soil amendments, fertilizers, and nutrient supplements', icon: 'package', color: 'blue', organizationId: organization.id },
        { name: 'Pest Control', description: 'Crop protection chemicals and pest management supplies', icon: 'shield', color: 'red', organizationId: organization.id },
        { name: 'Livestock', description: 'Animals, animal feed, and livestock care supplies', icon: 'cow', color: 'brown', organizationId: organization.id },
        { name: 'Equipment & Tools', description: 'Farm machinery, tools, and maintenance supplies', icon: 'wrench', color: 'gray', organizationId: organization.id },
        { name: 'Irrigation Supplies', description: 'Water management, irrigation systems, and components', icon: 'droplet', color: 'cyan', organizationId: organization.id },
        { name: 'Storage Materials', description: 'Containers, packaging, and storage solutions', icon: 'archive', color: 'orange', organizationId: organization.id },
        { name: 'Safety & Protective', description: 'Personal protective equipment and safety supplies', icon: 'shield-check', color: 'purple', organizationId: organization.id }
      ],
      skipDuplicates: true
    });

    console.log('Created inventory categories:', categories.count);

    // Get the created categories
    const createdCategories = await prisma.inventoryCategory.findMany({
      where: { organizationId: organization.id },
      orderBy: { id: 'asc' }
    });

    // Add inventory items
    const items = await prisma.inventoryItem.createMany({
      data: [
        // Seeds & Planting (4 items)
        { name: 'Corn Seeds', type: InventoryType.PRODUCE, unit: 'kg', quantity: 0, initialQuantity: 0, categoryId: createdCategories[0]?.id, organizationId: organization.id, description: 'High-quality hybrid corn seeds for planting', minimumStock: 100, pricePerUnit: 45.00 },
        { name: 'Wheat Seeds', type: InventoryType.PRODUCE, unit: 'kg', quantity: 0, initialQuantity: 0, categoryId: createdCategories[0]?.id, organizationId: organization.id, description: 'Premium wheat seeds for grain production', minimumStock: 80, pricePerUnit: 38.00 },
        { name: 'Tomato Seeds', type: InventoryType.PRODUCE, unit: 'packets', quantity: 0, initialQuantity: 0, categoryId: createdCategories[0]?.id, organizationId: organization.id, description: 'Hybrid tomato seeds for greenhouse and field', minimumStock: 20, pricePerUnit: 15.00 },
        { name: 'Vegetable Seedlings', type: InventoryType.PRODUCE, unit: 'trays', quantity: 0, initialQuantity: 0, categoryId: createdCategories[0]?.id, organizationId: organization.id, description: 'Mixed vegetable seedlings ready for transplant', minimumStock: 10, pricePerUnit: 25.00 },

        // Fertilizers & Nutrients (4 items)
        { name: 'NPK Fertilizer', type: InventoryType.CONSUMABLES, unit: 'bags', quantity: 0, initialQuantity: 0, categoryId: createdCategories[1]?.id, organizationId: organization.id, description: 'Balanced NPK fertilizer 20-20-20 for general use', minimumStock: 15, pricePerUnit: 120.00 },
        { name: 'Urea', type: InventoryType.CONSUMABLES, unit: 'bags', quantity: 0, initialQuantity: 0, categoryId: createdCategories[1]?.id, organizationId: organization.id, description: 'Urea fertilizer 46-0-0 for nitrogen boost', minimumStock: 12, pricePerUnit: 95.00 },
        { name: 'Compost', type: InventoryType.CONSUMABLES, unit: 'cubic_meters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[1]?.id, organizationId: organization.id, description: 'Organic compost for soil improvement', minimumStock: 5, pricePerUnit: 60.00 },
        { name: 'Agricultural Lime', type: InventoryType.CONSUMABLES, unit: 'tons', quantity: 0, initialQuantity: 0, categoryId: createdCategories[1]?.id, organizationId: organization.id, description: 'Agricultural lime for soil pH adjustment', minimumStock: 2, pricePerUnit: 180.00 },

        // Pest Control (3 items)
        { name: 'Insecticide', type: InventoryType.CONSUMABLES, unit: 'liters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[2]?.id, organizationId: organization.id, description: 'Broad-spectrum insecticide for crop protection', minimumStock: 8, pricePerUnit: 150.00 },
        { name: 'Fungicide', type: InventoryType.CONSUMABLES, unit: 'liters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[2]?.id, organizationId: organization.id, description: 'Systemic fungicide for disease control', minimumStock: 6, pricePerUnit: 180.00 },
        { name: 'Herbicide', type: InventoryType.CONSUMABLES, unit: 'liters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[2]?.id, organizationId: organization.id, description: 'Selective herbicide for weed management', minimumStock: 10, pricePerUnit: 120.00 },

        // Livestock (4 items)
        { name: 'Chicken Feed', type: InventoryType.CONSUMABLES, unit: 'bags', quantity: 0, initialQuantity: 0, categoryId: createdCategories[3]?.id, organizationId: organization.id, description: 'Complete feed formula for broiler chickens', minimumStock: 20, pricePerUnit: 35.00 },
        { name: 'Cattle Feed', type: InventoryType.CONSUMABLES, unit: 'bags', quantity: 0, initialQuantity: 0, categoryId: createdCategories[3]?.id, organizationId: organization.id, description: 'Nutritional feed for dairy and beef cattle', minimumStock: 15, pricePerUnit: 55.00 },
        { name: 'Veterinary Medicine', type: InventoryType.CONSUMABLES, unit: 'bottles', quantity: 0, initialQuantity: 0, categoryId: createdCategories[3]?.id, organizationId: organization.id, description: 'Essential veterinary medicines for livestock', minimumStock: 5, pricePerUnit: 85.00 },
        { name: 'Vaccines', type: InventoryType.CONSUMABLES, unit: 'doses', quantity: 0, initialQuantity: 0, categoryId: createdCategories[3]?.id, organizationId: organization.id, description: 'Livestock vaccines for disease prevention', minimumStock: 10, pricePerUnit: 12.00 },

        // Equipment & Tools (4 items)
        { name: 'Tractor Fuel', type: InventoryType.CONSUMABLES, unit: 'liters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[4]?.id, organizationId: organization.id, description: 'Diesel fuel for farm tractors and equipment', minimumStock: 200, pricePerUnit: 1.20 },
        { name: 'Oil Lubricant', type: InventoryType.CONSUMABLES, unit: 'liters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[4]?.id, organizationId: organization.id, description: 'Engine oil for machinery maintenance', minimumStock: 25, pricePerUnit: 15.00 },
        { name: 'Spare Parts', type: InventoryType.EQUIPMENT, unit: 'units', quantity: 0, initialQuantity: 0, categoryId: createdCategories[4]?.id, organizationId: organization.id, description: 'Common spare parts for farm equipment', minimumStock: 30, pricePerUnit: 45.00 },
        { name: 'Hand Tools', type: InventoryType.EQUIPMENT, unit: 'sets', quantity: 0, initialQuantity: 0, categoryId: createdCategories[4]?.id, organizationId: organization.id, description: 'Essential hand tools for farm work', minimumStock: 8, pricePerUnit: 75.00 },

        // Irrigation Supplies (3 items)
        { name: 'Water Pipes', type: InventoryType.EQUIPMENT, unit: 'meters', quantity: 0, initialQuantity: 0, categoryId: createdCategories[5]?.id, organizationId: organization.id, description: 'PVC water pipes for irrigation systems', minimumStock: 50, pricePerUnit: 8.50 },
        { name: 'Sprinkler Nozzles', type: InventoryType.EQUIPMENT, unit: 'units', quantity: 0, initialQuantity: 0, categoryId: createdCategories[5]?.id, organizationId: organization.id, description: 'Adjustable sprinkler nozzles for irrigation', minimumStock: 40, pricePerUnit: 12.00 },
        { name: 'Water Pump Parts', type: InventoryType.EQUIPMENT, unit: 'kits', quantity: 0, initialQuantity: 0, categoryId: createdCategories[5]?.id, organizationId: organization.id, description: 'Maintenance kits for water pumps', minimumStock: 6, pricePerUnit: 120.00 },

        // Storage Materials (2 items)
        { name: 'Storage Bags', type: InventoryType.CONSUMABLES, unit: 'bundles', quantity: 0, initialQuantity: 0, categoryId: createdCategories[6]?.id, organizationId: organization.id, description: 'Durable bags for grain and produce storage', minimumStock: 100, pricePerUnit: 3.50 },
        { name: 'Plastic Containers', type: InventoryType.EQUIPMENT, unit: 'units', quantity: 0, initialQuantity: 0, categoryId: createdCategories[6]?.id, organizationId: organization.id, description: 'Food-grade plastic containers for storage', minimumStock: 25, pricePerUnit: 18.00 },

        // Safety & Protective (1 item)
        { name: 'Safety Gloves', type: InventoryType.CONSUMABLES, unit: 'pairs', quantity: 0, initialQuantity: 0, categoryId: createdCategories[7]?.id, organizationId: organization.id, description: 'Heavy-duty safety gloves for farm work', minimumStock: 15, pricePerUnit: 8.00 }
      ],
      skipDuplicates: true
    });

    console.log('Created inventory items:', items.count);

    // Verify the data
    const finalCategories = await prisma.inventoryCategory.count();
    const finalItems = await prisma.inventoryItem.count();

    console.log('Final inventory data:');
    console.log(`- Categories: ${finalCategories}`);
    console.log(`- Items: ${finalItems}`);
    console.log('Inventory data added successfully!');

  } catch (error) {
    console.error('Error adding inventory data:', error);
    throw error;
  }
}

addInventoryData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

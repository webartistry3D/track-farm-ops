#!/usr/bin/env node

/**
 * Seed All Organizations with Nigerian Mixed Farm Presets
 * This script applies the Nigerian Mixed Farm preset to all existing organizations
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAllOrganizationsWithNigerianPresets() {
  console.log('🌾 Starting Nigerian Mixed Farm preset seeding for all organizations...');

  try {
    // Get all existing organizations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true
      }
    });

    if (organizations.length === 0) {
      console.log('❌ No organizations found. Please create an organization first.');
      return;
    }

    console.log(`📊 Found ${organizations.length} organizations to seed:`);
    organizations.forEach(org => {
      console.log(`   - ${org.name} (ID: ${org.id})`);
    });

    // Import the seeding function
    const { seedSystemInventoryForOrganization } = require('./seed-inventory.js');

    // Seed each organization
    let successCount = 0;
    let failureCount = 0;

    for (const org of organizations) {
      console.log(`\n🏢 Processing organization: ${org.name}...`);
      
      try {
        const success = await seedSystemInventoryForOrganization(org.id);
        if (success) {
          successCount++;
          console.log(`✅ Successfully seeded ${org.name}`);
        } else {
          failureCount++;
          console.log(`❌ Failed to seed ${org.name}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`❌ Error seeding ${org.name}:`, error.message);
      }
    }

    console.log(`\n🎊 Seeding completed!`);
    console.log(`✅ Successfully seeded: ${successCount} organizations`);
    console.log(`❌ Failed to seed: ${failureCount} organizations`);
    
    if (successCount > 0) {
      console.log('\n📋 Nigerian Mixed Farm Presets Applied:');
      console.log('🌾 8 Categories: Livestock, Feed & Nutrition, Medicine & Health, Equipment & Tools, Seeds & Planting, Fertilizers & Soil, Harvested Produce, Animal Products');
      console.log('📦 48 Items: Complete Nigerian mixed farm inventory setup');
      console.log('🎨 Professional Design: Icons, colors, and metadata for each category');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAllOrganizationsWithNigerianPresets()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAllOrganizationsWithNigerianPresets };

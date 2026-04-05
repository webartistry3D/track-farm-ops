/**
 * Manual Seeding Utility for Production
 * Use this to manually seed inventory for existing organizations
 */

import { prisma } from '../lib/prisma';
import { seedSystemInventoryForOrganization } from './inventorySeeding';

/**
 * Manually seed inventory for a specific organization
 */
export async function manuallySeedOrganization(organizationId: number, organizationName?: string) {
  console.log(`🔧 Manual seeding for organization ${organizationId} (${organizationName || 'Unknown'})...`);
  
  try {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!organization) {
      console.error(`❌ Organization with ID ${organizationId} not found`);
      return false;
    }

    console.log(`📋 Found organization: ${organization.name} (${organization._count.users} users)`);

    // Check if already has inventory
    const existingCategories = await prisma.inventoryCategory.count({
      where: { organizationId }
    });

    if (existingCategories > 0) {
      console.log(`⚠️ Organization already has ${existingCategories} inventory categories`);
      console.log('🔄 Clearing existing inventory before reseeding...');
      
      // Clear existing inventory
      await prisma.inventoryItem.deleteMany({
        where: { organizationId }
      });
      await prisma.inventoryCategory.deleteMany({
        where: { organizationId }
      });
    }

    // Seed the organization
    const success = await seedSystemInventoryForOrganization(organizationId);
    
    if (success) {
      console.log(`🎉 Successfully seeded inventory for ${organization.name}`);
      
      // Verify the seeding
      const categoryCount = await prisma.inventoryCategory.count({
        where: { organizationId }
      });
      const itemCount = await prisma.inventoryItem.count({
        where: { organizationId }
      });
      
      console.log(`✅ Verification: ${categoryCount} categories and ${itemCount} items created`);
      return true;
    } else {
      console.error(`❌ Failed to seed inventory for ${organization.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error manually seeding organization ${organizationId}:`, error);
    return false;
  }
}

/**
 * Seed all organizations that don't have inventory yet
 */
export async function seedAllEmptyOrganizations() {
  console.log(`🔍 Finding organizations without inventory...`);
  
  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            inventoryCategories: true,
            users: true
          }
        }
      }
    });

    console.log(`📊 Found ${organizations.length} total organizations`);

    // Filter organizations without inventory
    const emptyOrganizations = organizations.filter(
      org => org._count.inventoryCategories === 0
    );

    console.log(`🎯 Found ${emptyOrganizations.length} organizations without inventory`);

    if (emptyOrganizations.length === 0) {
      console.log('✅ All organizations already have inventory!');
      return true;
    }

    // Seed each empty organization
    let successCount = 0;
    for (const org of emptyOrganizations) {
      console.log(`\n🏢 Processing: ${org.name} (${org._count.users} users)...`);
      
      const success = await seedSystemInventoryForOrganization(org.id);
      if (success) {
        successCount++;
        console.log(`✅ Successfully seeded ${org.name}`);
      } else {
        console.error(`❌ Failed to seed ${org.name}`);
      }
    }

    console.log(`\n🎉 Summary: ${successCount}/${emptyOrganizations.length} organizations seeded successfully`);
    return successCount === emptyOrganizations.length;
  } catch (error) {
    console.error('❌ Error seeding empty organizations:', error);
    return false;
  }
}

/**
 * Get list of all organizations with their inventory status
 */
export async function getOrganizationInventoryStatus() {
  console.log(`📊 Getting inventory status for all organizations...`);
  
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            inventoryCategories: true,
            inventoryItems: true,
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n📋 Organization Inventory Status:');
    console.log('=====================================');
    
    organizations.forEach(org => {
      const status = org._count.inventoryCategories > 0 ? '✅ Seeded' : '❌ Empty';
      console.log(`${status} ${org.name}`);
      console.log(`   Users: ${org._count.users}, Categories: ${org._count.inventoryCategories}, Items: ${org._count.inventoryItems}`);
    });

    return organizations;
  } catch (error) {
    console.error('❌ Error getting organization status:', error);
    return [];
  }
}

/**
 * Automatic Nigerian Mixed Farm Preset Seeding Utility
 * This utility automatically applies Nigerian Mixed Farm presets to new organizations
 */

import { prisma } from '../lib/prisma';

/**
 * Automatically seed Nigerian Mixed Farm presets for a new organization
 * This function should be called whenever a new organization is created
 */
export async function autoSeedNigerianFarmPresets(organizationId: number, organizationName: string) {
  console.log(`🌾 Automatically seeding Nigerian Mixed Farm presets for new organization: ${organizationName}...`);
  
  try {
    // Import the seeding function
    const { seedSystemInventoryForOrganization } = require('../../prisma/seed-inventory.js');
    
    // Apply Nigerian Mixed Farm presets to the new organization
    const seedingSuccess = await seedSystemInventoryForOrganization(organizationId);
    
    if (seedingSuccess) {
      console.log(`🎉 Successfully seeded Nigerian Mixed Farm presets for ${organizationName}`);
      console.log(`📦 8 Categories and 48 Items applied automatically`);
      return true;
    } else {
      console.error(`❌ Failed to seed presets for ${organizationName}`);
      return false;
    }
  } catch (seedingError) {
    console.error(`❌ Error seeding presets for ${organizationName}:`, seedingError);
    // Don't throw the error, just log it and return false
    return false;
  }
}

/**
 * Check if an organization already has inventory categories
 * Used to avoid double-seeding
 */
export async function hasExistingInventory(organizationId: number): Promise<boolean> {
  try {
    const categoryCount = await prisma.inventoryCategory.count({
      where: { organizationId }
    });
    
    return categoryCount > 0;
  } catch (error) {
    console.error('Error checking existing inventory:', error);
    return false;
  }
}

/**
 * Seed presets only if organization doesn't already have inventory
 */
export async function autoSeedIfEmpty(organizationId: number, organizationName: string) {
  const hasInventory = await hasExistingInventory(organizationId);
  
  if (hasInventory) {
    console.log(`📋 Organization ${organizationName} already has inventory, skipping auto-seeding`);
    return true; // Not an error, just already seeded
  }
  
  return await autoSeedNigerianFarmPresets(organizationId, organizationName);
}

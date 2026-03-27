/**
 * Smart Farm Type Seeding Utility
 * Automatically selects and applies the appropriate preset based on farm type
 */

import { prisma } from '../lib/prisma';

// Import all seeding functions
const { seedSystemInventoryForOrganization } = require('../../prisma/seed-inventory.js');
const { seedPoultryFarmForOrganization } = require('../../prisma/seed-poultry.js');
const { seedLivestockFarmForOrganization } = require('../../prisma/seed-livestock.js');
const { seedCropFarmForOrganization } = require('../../prisma/seed-crop.js');
const { seedFishFarmForOrganization } = require('../../prisma/seed-fish.js');
const { seedOtherFarmForOrganization } = require('../../prisma/seed-other.js');

/**
 * Map farm types to their corresponding seeding functions
 */
const FARM_TYPE_SEEDERS = {
  'Poultry': seedPoultryFarmForOrganization,
  'Livestock': seedLivestockFarmForOrganization,
  'Crop Farming': seedCropFarmForOrganization,
  'Mixed Farm': seedSystemInventoryForOrganization, // Nigerian Mixed Farm
  'Fish Farming': seedFishFarmForOrganization,
  'Other': seedOtherFarmForOrganization
};

/**
 * Get preset information for each farm type
 */
export function getFarmTypePresetInfo(farmType: string) {
  const presetInfo = {
    'Poultry': {
      name: 'Poultry Farm Preset',
      categories: 5,
      items: 26,
      icon: '🐔',
      description: 'Specialized for chicken and bird farming operations'
    },
    'Livestock': {
      name: 'Livestock Farm Preset',
      categories: 5,
      items: 26,
      icon: '🐄',
      description: 'Specialized for cattle, goats, sheep, and other animals'
    },
    'Crop Farming': {
      name: 'Crop Farm Preset',
      categories: 6,
      items: 31,
      icon: '🌾',
      description: 'Specialized for crop cultivation and farming'
    },
    'Mixed Farm': {
      name: 'Nigerian Mixed Farm Preset',
      categories: 8,
      items: 48,
      icon: '🌱',
      description: 'Comprehensive mixed farming operations'
    },
    'Fish Farming': {
      name: 'Fish Farm Preset',
      categories: 5,
      items: 25,
      icon: '🐟',
      description: 'Specialized for aquaculture and fish production'
    },
    'Other': {
      name: 'General Farm Preset',
      categories: 5,
      items: 21,
      icon: '📝',
      description: 'General purpose farming supplies'
    }
  };

  return presetInfo[farmType] || presetInfo['Other'];
}

/**
 * Automatically seed the appropriate preset based on farm type
 */
export async function autoSeedByFarmType(organizationId: number, farmType: string, organizationName: string) {
  console.log(`🌾 Auto-seeding based on farm type: "${farmType}" for organization: ${organizationName}`);
  
  // Get preset info
  const presetInfo = getFarmTypePresetInfo(farmType);
  console.log(`📋 Applying ${presetInfo.name}: ${presetInfo.categories} categories, ${presetInfo.items} items`);
  
  try {
    // Check if organization already has inventory
    const existingCategories = await prisma.inventoryCategory.count({
      where: { organizationId }
    });

    if (existingCategories > 0) {
      console.log(`📋 Organization ${organizationName} already has inventory (${existingCategories} categories), skipping auto-seeding`);
      return true;
    }

    // Get the appropriate seeding function
    const seedingFunction = FARM_TYPE_SEEDERS[farmType];
    
    if (!seedingFunction) {
      console.log(`⚠️ Unknown farm type: "${farmType}", using default preset`);
      return await seedSystemInventoryForOrganization(organizationId);
    }

    // Apply the appropriate preset
    const success = await seedingFunction(organizationId);
    
    if (success) {
      console.log(`🎉 Successfully applied ${presetInfo.name} to ${organizationName}`);
      console.log(`📦 ${presetInfo.categories} Categories and ${presetInfo.items} Items created`);
      console.log(`🎨 ${presetInfo.icon} ${presetInfo.description}`);
    } else {
      console.error(`❌ Failed to apply ${presetInfo.name} to ${organizationName}`);
    }

    return success;
    
  } catch (error) {
    console.error(`❌ Error auto-seeding for ${organizationName}:`, error);
    return false;
  }
}

/**
 * Get all available farm type presets
 */
export function getAllFarmTypePresets() {
  return Object.keys(FARM_TYPE_SEEDERS).map(farmType => ({
    farmType,
    ...getFarmTypePresetInfo(farmType)
  }));
}

/**
 * Validate farm type
 */
export function isValidFarmType(farmType: string): boolean {
  return farmType in FARM_TYPE_SEEDERS;
}

/**
 * Get default farm type (fallback)
 */
export function getDefaultFarmType(): string {
  return 'Mixed Farm';
}

/**
 * Smart Farm Type Seeding Utility
 * Automatically selects and applies the appropriate preset based on farm type
 */

import { prisma } from '../lib/prisma';

/**
 * Map farm types to their corresponding seed file paths
 */
const FARM_TYPE_SEEDERS = {
  'Poultry': '../../prisma/seed-poultry.ts',
  'Livestock': '../../prisma/seed-livestock.ts',
  'Crop Farming': '../../prisma/seed-crop.ts',
  'Mixed Farm': '../../prisma/seed-inventory.ts', // Nigerian Mixed Farm
  'Fish Farming': '../../prisma/seed-fish.ts',
  'Other': '../../prisma/seed-other.ts'
};

/**
 * Dynamic import function for seed scripts
 */
async function importSeedScript(seedPath: string) {
  try {
    // Use dynamic import to avoid TypeScript compilation issues
    const module = await import(seedPath);
    return module;
  } catch (error) {
    console.error(`Failed to import seed script: ${seedPath}`, error);
    return null;
  }
}

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

    // Get seed file path
    const seedPath = FARM_TYPE_SEEDERS[farmType];
    
    if (!seedPath) {
      console.log(`⚠️ Unknown farm type: "${farmType}", using default preset`);
      // Fallback to Nigerian Mixed Farm preset
      const fallbackModule = await importSeedScript(FARM_TYPE_SEEDERS['Mixed Farm']);
      if (fallbackModule && fallbackModule.seedSystemInventoryForOrganization) {
        return await fallbackModule.seedSystemInventoryForOrganization(organizationId);
      }
      return false;
    }

    // Dynamically import and execute the appropriate seed function
    const seedModule = await importSeedScript(seedPath);
    
    // Get the appropriate seeding function based on farm type
    let seedingFunction;
    switch (farmType) {
      case 'Poultry':
        seedingFunction = seedModule?.seedPoultryFarmForOrganization;
        break;
      case 'Livestock':
        seedingFunction = seedModule?.seedLivestockFarmForOrganization;
        break;
      case 'Crop Farming':
        seedingFunction = seedModule?.seedCropFarmForOrganization;
        break;
      case 'Mixed Farm':
        seedingFunction = seedModule?.seedSystemInventoryForOrganization;
        break;
      case 'Fish Farming':
        seedingFunction = seedModule?.seedFishFarmForOrganization;
        break;
      case 'Other':
        seedingFunction = seedModule?.seedOtherFarmForOrganization;
        break;
      default:
        seedingFunction = seedModule?.seedSystemInventoryForOrganization;
    }

    if (!seedingFunction) {
      console.error(`❌ Could not find seeding function for farm type: ${farmType}`);
      return false;
    }

    // Execute the seeding function
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

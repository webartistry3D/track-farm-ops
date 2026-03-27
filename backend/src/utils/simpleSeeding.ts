/**
 * Simple Farm Type Seeding Utility
 * Uses direct function calls to avoid import issues
 */

import { prisma } from '../lib/prisma';

/**
 * Simple farm type seeding without dynamic imports
 * Each function directly calls the appropriate seed script using require
 */
export async function autoSeedByFarmTypeSimple(organizationId: number, farmType: string, organizationName: string) {
  console.log(`🌾 Auto-seeding based on farm type: "${farmType}" for organization: ${organizationName}`);
  
  try {
    // Check if organization already has inventory
    const existingCategories = await prisma.inventoryCategory.count({
      where: { organizationId }
    });

    if (existingCategories > 0) {
      console.log(`📋 Organization ${organizationName} already has inventory (${existingCategories} categories), skipping auto-seeding`);
      return true;
    }

    let success = false;

    // Use require to load seed scripts (works in production)
    switch (farmType) {
      case 'Poultry':
        console.log('🐔 Applying Poultry Farm preset...');
        const poultryModule = require('../../prisma/seed-poultry.js');
        success = await poultryModule.seedPoultryFarmForOrganization(organizationId);
        break;
        
      case 'Livestock':
        console.log('🐄 Applying Livestock Farm preset...');
        const livestockModule = require('../../prisma/seed-livestock.js');
        success = await livestockModule.seedLivestockFarmForOrganization(organizationId);
        break;
        
      case 'Crop Farming':
        console.log('🌾 Applying Crop Farm preset...');
        const cropModule = require('../../prisma/seed-crop.js');
        success = await cropModule.seedCropFarmForOrganization(organizationId);
        break;
        
      case 'Fish Farming':
        console.log('🐟 Applying Fish Farm preset...');
        const fishModule = require('../../prisma/seed-fish.js');
        success = await fishModule.seedFishFarmForOrganization(organizationId);
        break;
        
      case 'Other':
        console.log('📝 Applying Other Farm preset...');
        const otherModule = require('../../prisma/seed-other.js');
        success = await otherModule.seedOtherFarmForOrganization(organizationId);
        break;
        
      case 'Mixed Farm':
      default:
        console.log('🌱 Applying Nigerian Mixed Farm preset...');
        const mixedModule = require('../../prisma/seed-inventory.js');
        success = await mixedModule.seedSystemInventoryForOrganization(organizationId);
        break;
    }

    if (success) {
      console.log(`🎉 Successfully applied ${farmType} preset to ${organizationName}`);
    } else {
      console.error(`❌ Failed to apply ${farmType} preset to ${organizationName}`);
    }

    return success;
    
  } catch (error) {
    console.error(`❌ Error auto-seeding for ${organizationName}:`, error);
    return false;
  }
}

/**
 * Get preset information for each farm type
 */
export function getFarmTypePresetInfoSimple(farmType: string) {
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

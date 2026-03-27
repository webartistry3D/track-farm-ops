/**
 * Organization Auto-Seeding Middleware
 * This middleware automatically applies Nigerian Mixed Farm presets to new organizations
 */

import { Request, Response, NextFunction } from 'express';
import { autoSeedIfEmpty } from '../utils/autoSeeding';

/**
 * Middleware to automatically seed Nigerian Mixed Farm presets
 * when a new organization is created via any route
 */
export const autoSeedOrganizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override res.json to intercept organization creation responses
  res.json = function(data: any) {
    // Check if this is a successful organization creation response
    if (res.statusCode === 201 && data && data.organization) {
      const organization = data.organization;
      
      // Auto-seed presets asynchronously (don't block the response)
      autoSeedIfEmpty(organization.id, organization.name).catch(error => {
        console.error('Auto-seeding failed:', error);
      });
    }
    
    // Call the original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Hook to automatically seed presets after organization creation
 * This can be called directly after creating an organization
 */
export const seedOrganizationAfterCreation = async (organizationId: number, organizationName: string) => {
  try {
    await autoSeedIfEmpty(organizationId, organizationName);
    console.log(`🎉 Auto-seeding completed for organization: ${organizationName}`);
  } catch (error) {
    console.error(`❌ Auto-seeding failed for organization: ${organizationName}`, error);
  }
};

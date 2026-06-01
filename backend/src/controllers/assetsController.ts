import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { canUserAccessRecord } from '../utils/roleAccess';
import { createActivityNotification, NotificationActivityType, formatNotificationMessage } from '../utils/notificationHelper';

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, location } = req.query;
    const currentUser = req.user!;

    console.log(`📄 Fetching assets for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for assets');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`🏢 User belongs to organization: ${currentUserOrg.organization?.name || 'Unknown'} (ID: ${currentUserOrg.organizationId})`);

    // Build where clause with organization filtering
    const whereClause: any = {
      organizationId: currentUserOrg.organizationId
    };
    
    if (category) {
      whereClause.category = category;
    }
    if (status) {
      whereClause.status = status;
    }
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Build organization-based where clause for database-level filtering
    const organizationWhereClause = {
      ...whereClause,
      organizationId: currentUserOrg.organizationId
    };

    // Get assets with organization-based filtering at database level
    const assets = await prisma.asset.findMany({
      where: organizationWhereClause,
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${assets.length} assets for organization ${currentUserOrg.organization?.name}`);
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAsset = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(`📝 Creating asset for ${currentUser.role} ${currentUser.name}`);

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for asset creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    const {
      name,
      description,
      category,
      subcategory,
      purchaseDate,
      supplier,
      cost,
      warrantyPeriod,
      expectedLifespan,
      depreciationMethod,
      currentCondition,
      location,
      assignedWorker,
      status,
      model,
      serialNumber,
      powerRating,
      capacity,
      fuelType,
      maintenanceInterval
    } = req.body;

    if (!name || !category || !location) {
      return res.status(400).json({ error: 'Name, category, and location are required' });
    }

    // Check if user has permission to create assets
    if (currentUser.role === 'WORKER') {
      return res.status(403).json({ error: 'Workers cannot create assets' });
    }

    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        name,
        description: description || null,
        category,
        subcategory: subcategory || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        supplier: supplier || null,
        cost: cost || 0,
        warrantyPeriod: warrantyPeriod || null,
        expectedLifespan: expectedLifespan || 10,
        depreciationMethod: depreciationMethod || 'straight_line',
        currentCondition: currentCondition || 'good',
        location,
        assignedWorker: assignedWorker || null,
        status: status || 'planned',
        model: model || null,
        serialNumber: serialNumber || null,
        powerRating: powerRating || null,
        capacity: capacity || null,
        fuelType: fuelType || null,
        maintenanceInterval: maintenanceInterval || null,
        organizationId: currentUserOrg.organizationId,
        createdBy: currentUser.id
      }
    });

    console.log(`✅ Asset created successfully: ${asset.name} (ID: ${asset.id}) in organization ${currentUserOrg.organizationId}`);

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.ASSET_CREATED,
      currentUser.id,
      currentUserOrg.organizationId,
      {
        title: 'New Asset Added',
        message: formatNotificationMessage(
          NotificationActivityType.ASSET_CREATED,
          currentUser.name,
          name
        ),
        relatedEntity: 'Asset',
        relatedEntityId: asset.id,
        metadata: {
          name,
          category,
          cost,
          location
        }
      }
    );

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`📝 Updating asset ${id} by ${currentUser.role} ${currentUser.name}`);

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for asset update');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Check if asset exists and belongs to user's organization
    const existingAsset = await prisma.asset.findFirst({
      where: { 
        id: parseInt(Array.isArray(id) ? id[0] : id),
        organizationId: currentUserOrg.organizationId
      }
    });

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found or access denied' });
    }

    // Check if user has permission to update this asset
    if (currentUser.role === 'WORKER') {
      return res.status(403).json({ error: 'Workers cannot update assets' });
    }

    const {
      name,
      description,
      category,
      subcategory,
      purchaseDate,
      supplier,
      cost,
      warrantyPeriod,
      expectedLifespan,
      depreciationMethod,
      currentCondition,
      location,
      assignedWorker,
      status,
      model,
      serialNumber,
      powerRating,
      capacity,
      fuelType,
      maintenanceInterval
    } = req.body;

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: { id: parseInt(Array.isArray(id) ? id[0] : id) },
      data: {
        name: name || existingAsset.name,
        description: description !== undefined ? description : existingAsset.description,
        category: category || existingAsset.category,
        subcategory: subcategory !== undefined ? subcategory : existingAsset.subcategory,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existingAsset.purchaseDate,
        supplier: supplier !== undefined ? supplier : existingAsset.supplier,
        cost: cost !== undefined ? cost : existingAsset.cost,
        warrantyPeriod: warrantyPeriod !== undefined ? warrantyPeriod : existingAsset.warrantyPeriod,
        expectedLifespan: expectedLifespan !== undefined ? expectedLifespan : existingAsset.expectedLifespan,
        depreciationMethod: depreciationMethod || existingAsset.depreciationMethod,
        currentCondition: currentCondition || existingAsset.currentCondition,
        location: location || existingAsset.location,
        assignedWorker: assignedWorker !== undefined ? assignedWorker : existingAsset.assignedWorker,
        status: status || existingAsset.status,
        model: model !== undefined ? model : existingAsset.model,
        serialNumber: serialNumber !== undefined ? serialNumber : existingAsset.serialNumber,
        powerRating: powerRating !== undefined ? powerRating : existingAsset.powerRating,
        capacity: capacity !== undefined ? capacity : existingAsset.capacity,
        fuelType: fuelType !== undefined ? fuelType : existingAsset.fuelType,
        maintenanceInterval: maintenanceInterval !== undefined ? maintenanceInterval : existingAsset.maintenanceInterval
      }
    });

    console.log('✅ Asset updated successfully:', updatedAsset);

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.ASSET_UPDATED,
      currentUser.id,
      currentUserOrg.organizationId,
      {
        title: 'Asset Updated',
        message: formatNotificationMessage(
          NotificationActivityType.ASSET_UPDATED,
          currentUser.name,
          name || existingAsset.name
        ),
        relatedEntity: 'Asset',
        relatedEntityId: updatedAsset.id,
        metadata: {
          name: name || existingAsset.name,
          category: category || existingAsset.category,
          location: location || existingAsset.location
        }
      }
    );

    res.json(updatedAsset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`🗑️ Deleting asset ${id} by ${currentUser.role} ${currentUser.name}`);

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for asset deletion');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Check if asset exists and belongs to user's organization
    const existingAsset = await prisma.asset.findFirst({
      where: { 
        id: parseInt(Array.isArray(id) ? id[0] : id),
        organizationId: currentUserOrg.organizationId
      }
    });

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found or access denied' });
    }

    // Check if user has permission to delete this asset
    if (currentUser.role === 'WORKER') {
      return res.status(403).json({ error: 'Workers cannot delete assets' });
    }

    if (currentUser.role === 'MANAGER') {
      // Managers can only delete assets they created or that are assigned to them
      const asset = existingAsset;
      if (asset.createdBy !== currentUser.id && asset.assignedWorker !== currentUser.name) {
        return res.status(403).json({ error: 'Managers can only delete assets they created or are assigned to' });
      }
    }

    // Delete the asset
    await prisma.asset.delete({
      where: { id: parseInt(Array.isArray(id) ? id[0] : id) }
    });

    console.log('✅ Asset deleted successfully');

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`📄 Fetching asset ${id} for ${currentUser.role} ${currentUser.name}`);

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for asset details');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Get the asset within user's organization
    const asset = await prisma.asset.findFirst({
      where: { 
        id: parseInt(Array.isArray(id) ? id[0] : id),
        organizationId: currentUserOrg.organizationId
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found or access denied' });
    }

    // Check if user has permission to view this asset
    // For now, all authenticated users can view assets
    // More complex logic can be added later if needed

    res.json(asset);
  } catch (error) {
    console.error('Get asset by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

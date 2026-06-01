import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { buildRoleBasedWhereClause, canUserAccessRecord } from '../utils/roleAccess';
import { createActivityNotification, NotificationActivityType, formatNotificationMessage } from '../utils/notificationHelper';

export const getInventorySettings = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(`⚙️ Fetching inventory settings for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);
    
    // For now, return default settings
    // In the future, this could be stored in a settings table
    const settings = {
      lowStockThreshold: 10,
      mediumStockThreshold: 50,
      pricingEnabled: false
    };
    
    console.log('  ✅ Settings returned:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Get inventory settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryUnits = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(`📏 Fetching inventory units for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);
    
    // Return standard units
    const units = [
      'kg', 'g', 'liters', 'ml', 'pieces', 'bags', 'boxes', 'crates', 'bottles',
      'tons', 'quintals', 'dozens', 'pairs', 'sets', 'meters', 'cm', 'units'
    ];
    
    console.log('  ✅ Units returned:', units);
    res.json(units);
  } catch (error) {
    console.error('Get inventory units error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    
    console.log(`📝 Updating inventory item ${id} by ${currentUser.role} ${currentUser.name}`);
    
    const { 
      name, 
      type, 
      unit, 
      quantity, 
      description, 
      categoryId, 
      location,
      supplier,
      purchaseDate,
      expiryDate,
      minimumStock,
      pricePerUnit,
      metadata 
    } = req.body;
    
    console.log('🔍 DEBUG - Update request body:', {
      name, 
      type, 
      unit, 
      quantity, 
      description, 
      categoryId, 
      location,
      supplier,
      purchaseDate,
      expiryDate,
      minimumStock,
      pricePerUnit,
      metadata 
    });
    
    if (!name || !type || !unit) {
      console.log('❌ VALIDATION FAILED: Missing required fields');
      return res.status(400).json({ error: 'Name, type, and unit are required' });
    }
    
    // Check if item exists and user has permission
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        transactions: {
          select: {
            userId: true,
            user: {
              select: {
                createdBy: true
              }
            }
          }
        }
      }
    });
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Check if user has permission to update this item
    let hasAccess = false;
    if (existingItem.transactions.length === 0) {
      hasAccess = true;
    } else {
      for (const transaction of existingItem.transactions) {
        const accessGranted = await canUserAccessRecord(currentUser, transaction.userId, transaction.user.createdBy || undefined);
        if (accessGranted) {
          hasAccess = true;
          break;
        }
      }
    }
    
    if (!hasAccess) {
      console.log(`🚫 Update denied: ${currentUser.role} ${currentUser.name} cannot update inventory item`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to update this inventory item' });
    }
    
    const parsedQuantity = parseFloat(quantity);
    
    console.log('🔍 DEBUG - Parsed values:', {
      originalQuantity: quantity,
      parsedQuantity,
      originalMinimumStock: minimumStock,
      parsedMinimumStock: minimumStock ? parseFloat(minimumStock) : null,
      originalPricePerUnit: pricePerUnit,
      parsedPricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null
    });
    
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        type,
        unit,
        quantity: parsedQuantity,
        description: description?.trim() || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        // New direct fields
        location: location?.trim() || null,
        supplier: supplier?.trim() || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        minimumStock: minimumStock ? parseFloat(minimumStock) : null,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        // Keep remaining metadata for flexibility
        metadata: metadata || null
      }
    });

    // Get organization ID for notification
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true }
    });

    // Send notification to owner/managers
    if (currentUserOrg?.organizationId) {
      await createActivityNotification(
        NotificationActivityType.INVENTORY_UPDATED,
        currentUser.id,
        currentUserOrg.organizationId,
        {
          title: 'Inventory Item Updated',
          message: formatNotificationMessage(
            NotificationActivityType.INVENTORY_UPDATED,
            currentUser.name,
            name
          ),
          relatedEntity: 'InventoryItem',
          relatedEntityId: updatedItem.id,
          metadata: {
            name,
            type,
            quantity: parsedQuantity,
            unit
          }
        }
      );
    }

    console.log('  ✅ Item updated successfully:', updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryCategories = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(`📂 Fetching inventory categories for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

    // Get both universal categories (organizationId: null) and organization-specific categories
    let whereClause: any = {
      OR: [
        { organizationId: null }, // Universal categories available to all
        ...(currentUser.organizationId ? [{ organizationId: currentUser.organizationId }] : []) // Organization-specific categories
      ]
    };

    const categories = await prisma.inventoryCategory.findMany({
      where: whereClause,
      include: {
        subcategories: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${categories.length} categories for ${currentUser.role} ${currentUser.name}`);

    res.json(categories);
  } catch (error) {
    console.error('Get inventory categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInventoryCategory = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    console.log('🔍 BACKEND CREATE INVENTORY CATEGORY DEBUG:');
    console.log('  Request body:', req.body);
    
    // Get user's organization for data protection
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('🔍 User organization data for category creation:', currentUserOrg);
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for category creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization to create inventory categories.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    console.log(`🏢 Creating category for organization: ${currentUserOrg.organization?.name || 'Unknown'} (ID: ${currentUserOrg.organizationId})`);
    
    const { name, description, icon, color, parentId, isSubcategory, metadata } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.inventoryCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null,
        color: color || null,
        parentId: parentId || null,
        isSubcategory: isSubcategory || false,
        organizationId: currentUserOrg.organizationId, // ✅ CRITICAL: Link to organization
        metadata: metadata || null
      }
    });
    
    console.log('  ✅ Category created:', category);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create inventory category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInventoryCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    console.log('ð BACKEND UPDATE INVENTORY CATEGORY DEBUG:');
    console.log('  Category ID:', id);
    console.log('  Request body:', req.body);
    
    // Get user's organization for data protection
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('ð User organization data for category update:', currentUserOrg);
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('â User not assigned to any organization - access denied for category update');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization to update inventory categories.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    // First check if category exists and user has access
    const categoryId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const existingCategory = await prisma.inventoryCategory.findFirst({
      where: {
        id: categoryId,
        organizationId: currentUserOrg.organizationId
      }
    });
    
    if (!existingCategory) {
      console.log('â Category not found or access denied');
      return res.status(404).json({ 
        error: 'Category not found or access denied',
        code: 'CATEGORY_NOT_FOUND'
      });
    }
    
    console.log(`ð Updating category for organization: ${currentUserOrg.organization?.name || 'Unknown'} (ID: ${currentUserOrg.organizationId})`);
    
    const { name, description, icon, color, parentId, isSubcategory, metadata } = req.body;
    
    const category = await prisma.inventoryCategory.update({
      where: { id: categoryId },
      data: {
        name: name?.trim() || existingCategory.name,
        description: description?.trim() || existingCategory.description,
        icon: icon !== undefined ? icon : existingCategory.icon,
        color: color !== undefined ? color : existingCategory.color,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
        isSubcategory: isSubcategory !== undefined ? isSubcategory : existingCategory.isSubcategory,
        metadata: metadata !== undefined ? metadata : existingCategory.metadata
      }
    });
    
    console.log('  â Category updated:', category);
    res.json(category);
  } catch (error) {
    console.error('Update inventory category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryItems = async (req: AuthRequest, res: Response) => {
  try {
    const { type, categoryId, search } = req.query;
    const currentUser = req.user!;

    console.log(`📄 Fetching inventory items for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);
    console.log('  Query params:', { type, categoryId, search });

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
    
    console.log('🔍 User organization data:', currentUserOrg);
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for inventory');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    console.log(`🏢 User belongs to organization: ${currentUserOrg.organization?.name || 'Unknown'} (ID: ${currentUserOrg.organizationId})`);
    
    // Build where clause based on organizational hierarchy and role
    let whereClause: any = {
      OR: [
        { organizationId: null }, // Universal item templates available to all
        ...(currentUserOrg.organizationId ? [{ organizationId: currentUserOrg.organizationId }] : []) // Organization-specific items
      ]
    };
    
    // Apply additional filters
    if (type) {
      whereClause.OR = whereClause.OR.map(condition => ({
        ...condition,
        type: type as 'LIVESTOCK' | 'PRODUCE' | 'CONSUMABLES'
      }));
    }
    
    if (categoryId) {
      whereClause.OR = whereClause.OR.map(condition => ({
        ...condition,
        categoryId: Number(categoryId)
      }));
    }
    
    if (search) {
      whereClause.OR = whereClause.OR.map(condition => ({
        ...condition,
        name: {
          contains: search as string,
          mode: 'insensitive'
        }
      }));
    }

    // Get all inventory items with category relationship
    const allItems = await prisma.inventoryItem.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add pricePerUnit from direct database field (not metadata)
    const itemsWithPrice = allItems.map(item => ({
      ...item,
      pricePerUnit: item.pricePerUnit  // ✅ Direct field access
    }));

    console.log(`📊 Found ${allItems.length} inventory items from database`);
    
    res.json(itemsWithPrice);
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 BACKEND CREATE INVENTORY ITEM DEBUG:');
    console.log('  Request body:', req.body);
    console.log('  Raw initialQuantity:', req.body.initialQuantity);
    console.log('  Type of initialQuantity:', typeof req.body.initialQuantity);
    
    // Get user's organization for data protection
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log('🔍 User organization data for item creation:', currentUserOrg);
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for item creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization to create inventory items.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    console.log(`🏢 Creating item for organization: ${currentUserOrg.organization?.name || 'Unknown'} (ID: ${currentUserOrg.organizationId})`);
    
    const { 
      name, 
      type, 
      unit, 
      initialQuantity = 0, 
      categoryId, 
      description,
      location,
      supplier,
      purchaseDate,
      expiryDate,
      minimumStock,
      pricePerUnit,
      metadata 
    } = req.body;
    
    console.log('  Extracted values:');
    console.log('    name:', name);
    console.log('    type:', type);
    console.log('    unit:', unit);
    console.log('    description:', description);
    console.log('    location:', location);
    console.log('    supplier:', supplier);
    console.log('    purchaseDate:', purchaseDate);
    console.log('    expiryDate:', expiryDate);
    console.log('    minimumStock:', minimumStock);
    console.log('    pricePerUnit:', pricePerUnit);
    console.log('    categoryId:', categoryId);
    console.log('    initialQuantity:', initialQuantity);
    console.log('    metadata:', metadata);

    if (!name || !type || !unit) {
      console.log('❌ VALIDATION FAILED: Missing required fields');
      return res.status(400).json({ error: 'Name, type, and unit are required' });
    }

    // Validate quantity is reasonable before creating
    const parsedQuantity = parseFloat(initialQuantity);
    console.log('  Parsed quantity:', parsedQuantity);
    console.log('  Type of parsedQuantity:', typeof parsedQuantity);
    
    if (parsedQuantity > 999999) {
      console.log('❌ VALIDATION FAILED: Quantity too large');
      return res.status(400).json({ error: 'Quantity cannot exceed 999,999. Please contact administrator for bulk orders.' });
    }

    console.log('  Creating database item with data:');
    console.log('    name:', name);
    console.log('    type:', type);
    console.log('    unit:', unit);
    console.log('    categoryId:', categoryId);
    console.log('    quantity (to save):', parsedQuantity);
    
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        type,
        unit,
        quantity: parsedQuantity,
        initialQuantity: parsedQuantity,
        description: description?.trim() || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        organizationId: currentUserOrg.organizationId, // ✅ CRITICAL: Link to organization
        // New direct fields
        location: location?.trim() || null,
        supplier: supplier?.trim() || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        minimumStock: minimumStock ? parseFloat(minimumStock) : null,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        // Keep remaining metadata for flexibility
        metadata: metadata || null
      }
    });
    
    console.log('  ✅ Database item created:');
    console.log('    Created item:', item);

    // Log initial quantity as a transaction if provided
    if (parseFloat(initialQuantity) > 0) {
      console.log('  Creating initial transaction...');
      await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: item.id,
          quantityChange: parseFloat(initialQuantity),
          reason: 'Initial stock',
          usageType: 'INITIAL_STOCK',
          costPerUnit: item.pricePerUnit ? Number(item.pricePerUnit) : null,
          totalCost: item.pricePerUnit ? parseFloat(initialQuantity) * Number(item.pricePerUnit) : null,
          userId: req.user!.id,
          date: new Date()
        }
      });
      console.log('  ✅ Initial transaction created');
    }

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.INVENTORY_CREATED,
      req.user!.id,
      currentUserOrg.organizationId,
      {
        title: 'New Inventory Item Added',
        message: formatNotificationMessage(
          NotificationActivityType.INVENTORY_CREATED,
          req.user!.name,
          name
        ),
        relatedEntity: 'InventoryItem',
        relatedEntityId: item.id,
        metadata: {
          name,
          type,
          quantity: parsedQuantity,
          unit
        }
      }
    );

    console.log('  📤 Sending response:', item);
    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInventoryQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantityChange, reason, usageType, relatedEntity, relatedEntityId } = req.body;

    if (!quantityChange || !reason) {
      return res.status(400).json({ error: 'Quantity change and reason are required' });
    }

    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!item) {
      return res.status(400).json({ error: 'Inventory item not found' });
    }

    // Calculate new quantity
    const newQuantity = Number(item.quantity) + parseFloat(quantityChange);

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Calculate costs if applicable
    const parsedQuantityChange = parseFloat(quantityChange);
    const costPerUnit = item.pricePerUnit ? Number(item.pricePerUnit) : null;
    const totalCost = costPerUnit ? Math.abs(parsedQuantityChange) * costPerUnit : null;

    // Update item quantity
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: parseInt(id as string) },
      data: { quantity: newQuantity }
    });

    // Log transaction with enhanced tracking
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: parseInt(id as string),
        quantityChange: parsedQuantityChange,
        reason,
        usageType: usageType || 'OTHER',
        costPerUnit: costPerUnit ? parseFloat(costPerUnit.toString()) : null,
        totalCost: totalCost ? parseFloat(totalCost.toString()) : null,
        relatedEntity: relatedEntity || null,
        relatedEntityId: relatedEntityId ? parseInt(relatedEntityId.toString()) : null,
        userId: req.user!.id,
        date: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            unit: true
          }
        }
      }
    });

    console.log(`📊 Usage tracked: ${parsedQuantityChange} ${item.unit} for ${item.name} (${usageType || 'OTHER'})`);

    res.json({
      item: updatedItem,
      transaction
    });
  } catch (error) {
    console.error('Update inventory quantity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    const currentUser = req.user!;

    console.log(`📄 Fetching inventory transactions for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

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
      console.log('⚠️ User not assigned to any organization - access denied for inventory transactions');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Get accessible user IDs based on role within organization
    let accessibleUserIds: number[] = [];
    
    if (currentUser.role === 'OWNER') {
      // OWNER can see all transactions in organization
      const orgUsers = await prisma.user.findMany({
        where: { organizationId: currentUserOrg.organizationId },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    } else if (currentUser.role === 'MANAGER' || currentUser.role === 'WORKER') {
      // MANAGER and WORKER can see all transactions in organization
      const orgUsers = await prisma.user.findMany({
        where: { 
          organizationId: currentUserOrg.organizationId,
          role: { in: ['OWNER', 'MANAGER', 'WORKER'] }
        },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    } else {
      // Default to user's own transactions
      accessibleUserIds = [currentUser.id];
    }

    // Build where clause with proper organization filtering
    const whereClause: any = {
      userId: { in: accessibleUserIds },
      ...(itemId && { inventoryItemId: parseInt(itemId as string) }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      })
    };

    const transactions = await prisma.inventoryTransaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    console.log(`✅ Found ${transactions.length} inventory transactions for organization ${currentUserOrg.organization?.name}`);
    res.json(transactions);
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`🗑️ Deleting inventory item ${id} by ${currentUser.role} ${currentUser.name}`);

    // Check if item exists and get related transactions
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        transactions: {
          select: {
            userId: true,
            user: {
              select: {
                createdBy: true
              }
            }
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if user has permission to delete this item
    // User can delete if they can access any transaction for this item
    let hasAccess = false;
    if (item.transactions.length === 0) {
      // If no transactions, allow deletion (new item)
      hasAccess = true;
    } else {
      // Check if user can access any transaction
      for (const transaction of item.transactions) {
        const accessGranted = await canUserAccessRecord(currentUser, transaction.userId, transaction.user.createdBy || undefined);
        if (accessGranted) {
          hasAccess = true;
          break;
        }
      }
    }

    if (!hasAccess) {
      console.log(`🚫 Delete denied: ${currentUser.role} ${currentUser.name} cannot delete inventory item`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to delete this inventory item' });
    }

    console.log(`✅ Delete granted: ${currentUser.role} ${currentUser.name} deleting inventory item`);

    // Delete the item (this will also delete related transactions due to cascade delete)
    await prisma.inventoryItem.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventorySummary = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    console.log(`📊 Fetching inventory summary for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

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
      console.log('⚠️ User not assigned to any organization - access denied for inventory summary');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        organizationId: currentUserOrg.organizationId
      },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    const summary = {
      totalItems: items.length,
      livestock: items.filter((item: any) => item.type === 'LIVESTOCK').length,
      produce: items.filter((item: any) => item.type === 'PRODUCE').length,
      consumables: items.filter((item: any) => item.type === 'CONSUMABLES').length,
      totalTransactions: items.reduce((sum: number, item: any) => sum + item._count.transactions, 0),
      itemsByType: {
        LIVESTOCK: items.filter((item: any) => item.type === 'LIVESTOCK'),
        PRODUCE: items.filter((item: any) => item.type === 'PRODUCE'),
        CONSUMABLES: items.filter((item: any) => item.type === 'CONSUMABLES')
      }
    };

    console.log(`✅ Inventory summary for organization ${currentUserOrg.organization?.name}: ${summary.totalItems} items`);
    res.json(summary);
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

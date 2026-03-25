import { Request, Response } from 'express';
import { PrismaClient, UsageType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
  };
}

export class InventoryTransactionController {
  // Record inventory usage
  static async recordUsage(req: AuthenticatedRequest, res: Response) {
    try {
      const { inventoryItemId, quantityChange, reason, usageType, costPerUnit, totalCost, relatedEntity, relatedEntityId, date } = req.body;
      const userId = req.user!.id;
      const organizationId = req.user!.organizationId;

      // Validate required fields
      if (!inventoryItemId || !quantityChange || !reason) {
        return res.status(400).json({ 
          error: 'Missing required fields: inventoryItemId, quantityChange, reason' 
        });
      }

      // Validate item exists and belongs to organization
      const item = await prisma.inventoryItem.findFirst({
        where: {
          id: Number(inventoryItemId),
          organizationId
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const usageQuantity = Number(quantityChange);
      
      // Validate quantity (negative for usage)
      if (isNaN(usageQuantity) || usageQuantity >= 0) {
        return res.status(400).json({ error: 'Quantity must be negative for usage (e.g., -5)' });
      }

      // Check sufficient quantity for usage
      if (Math.abs(usageQuantity) > Number(item.quantity)) {
        return res.status(400).json({ 
          error: `Insufficient inventory. Available: ${item.quantity} ${item.unit || 'units'}, Requested: ${Math.abs(usageQuantity)} ${item.unit || 'units'}` 
        });
      }

      // Calculate cost if not provided
      const calculatedCostPerUnit = costPerUnit || Number(item.pricePerUnit) || 0;
      const calculatedTotalCost = totalCost || Math.abs(usageQuantity) * calculatedCostPerUnit;

      // Record transaction
      const transaction = await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: Number(inventoryItemId),
          quantityChange: usageQuantity, // Negative for usage
          reason: reason.trim(),
          usageType: usageType || UsageType.OTHER,
          costPerUnit: calculatedCostPerUnit,
          totalCost: calculatedTotalCost,
          relatedEntity: relatedEntity || null,
          relatedEntityId: relatedEntityId ? Number(relatedEntityId) : null,
          date: date ? new Date(date) : new Date(),
          userId
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update item quantity
      await prisma.inventoryItem.update({
        where: { id: Number(inventoryItemId) },
        data: {
          quantity: Number(item.quantity) + usageQuantity, // usageQuantity is negative
          updatedAt: new Date()
        }
      });

      res.status(201).json({
        success: true,
        message: `Successfully recorded usage of ${Math.abs(usageQuantity)} ${item.unit || 'pieces'} of ${item.name}`,
        transaction
      });

    } catch (error: any) {
      console.error('Error recording inventory usage:', error);
      res.status(500).json({ 
        error: 'Failed to record inventory usage',
        details: error.message 
      });
    }
  }

  // Add inventory (restock)
  static async addInventory(req: AuthenticatedRequest, res: Response) {
    try {
      const { inventoryItemId, quantityChange, reason, usageType, costPerUnit, totalCost, relatedEntity, relatedEntityId, date } = req.body;
      const userId = req.user!.id;
      const organizationId = req.user!.organizationId;

      // Validate required fields
      if (!inventoryItemId || !quantityChange || !reason) {
        return res.status(400).json({ 
          error: 'Missing required fields: inventoryItemId, quantityChange, reason' 
        });
      }

      // Validate item exists and belongs to organization
      const item = await prisma.inventoryItem.findFirst({
        where: {
          id: Number(inventoryItemId),
          organizationId
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const addQuantity = Number(quantityChange);
      
      // Validate quantity (positive for addition)
      if (isNaN(addQuantity) || addQuantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be positive for addition (e.g., 5)' });
      }

      // Calculate cost if not provided
      const calculatedCostPerUnit = costPerUnit || Number(item.pricePerUnit) || 0;
      const calculatedTotalCost = totalCost || addQuantity * calculatedCostPerUnit;

      // Record transaction
      const transaction = await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: Number(inventoryItemId),
          quantityChange: addQuantity, // Positive for addition
          reason: reason.trim(),
          usageType: usageType || UsageType.RESTOCK,
          costPerUnit: calculatedCostPerUnit,
          totalCost: calculatedTotalCost,
          relatedEntity: relatedEntity || null,
          relatedEntityId: relatedEntityId ? Number(relatedEntityId) : null,
          date: date ? new Date(date) : new Date(),
          userId
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update item quantity
      await prisma.inventoryItem.update({
        where: { id: Number(inventoryItemId) },
        data: {
          quantity: Number(item.quantity) + addQuantity,
          updatedAt: new Date()
        }
      });

      res.status(201).json({
        success: true,
        message: `Successfully added ${addQuantity} ${item.unit || 'pieces'} of ${item.name}`,
        transaction
      });

    } catch (error: any) {
      console.error('Error adding inventory:', error);
      res.status(500).json({ 
        error: 'Failed to add inventory',
        details: error.message 
      });
    }
  }

  // Get inventory usage history
  static async getUsageHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { inventoryItemId, startDate, endDate, usageType, page = 1, limit = 50 } = req.query;
      const organizationId = req.user!.organizationId;

      const whereClause: any = {
        inventoryItem: {
          organizationId
        },
        ...(inventoryItemId && { inventoryItemId: Number(inventoryItemId) }),
        ...(usageType && { usageType }),
        ...(startDate && {
          date: {
            gte: new Date(startDate as string)
          }
        }),
        ...(endDate && {
          date: {
            lte: new Date(endDate as string)
          }
        })
      };

      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, total] = await Promise.all([
        prisma.inventoryTransaction.findMany({
          where: whereClause,
          include: {
            inventoryItem: {
              select: {
                id: true,
                name: true,
                categoryId: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { date: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.inventoryTransaction.count({ where: whereClause })
      ]);

      // Format transactions
      const formattedTransactions = transactions.map(transaction => ({
        ...transaction,
        quantity: Math.abs(Number(transaction.quantityChange)), // Show absolute value
        isUsage: Number(transaction.quantityChange) < 0,
        formattedDate: transaction.date.toLocaleDateString(),
        formattedTime: transaction.date.toLocaleTimeString()
      }));

      res.json({
        transactions: formattedTransactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('Error fetching usage history:', error);
      res.status(500).json({ 
        error: 'Failed to fetch usage history',
        details: error.message 
      });
    }
  }

  // Get inventory analytics
  static async getUsageAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate, inventoryItemId } = req.query;
      const organizationId = req.user!.organizationId;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);

      const whereClause: any = {
        inventoryItem: {
          organizationId
        },
        ...(inventoryItemId && { inventoryItemId: Number(inventoryItemId) }),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      };

      // Get usage by transaction type
      const usageByType = await prisma.inventoryTransaction.groupBy({
        by: ['usageType'],
        where: whereClause,
        _sum: {
          quantityChange: true
        },
        _count: {
          id: true
        }
      });

      // Get usage by item
      const usageByItem = await prisma.inventoryTransaction.groupBy({
        by: ['inventoryItemId'],
        where: {
          ...whereClause,
          quantityChange: {
            lt: 0 // Usage only (negative quantities)
          }
        },
        _sum: {
          quantityChange: true
        },
        _count: {
          id: true
        }
      });

      // Get item details for usage by item
      const itemIds = usageByItem.map(ub => ub.inventoryItemId);
      const items = await prisma.inventoryItem.findMany({
        where: {
          id: { in: itemIds },
          organizationId
        },
        select: {
          id: true,
          name: true,
          unit: true
        }
      });

      // Combine usage data with item details
      const usageByItemWithDetails = usageByItem.map(usage => {
        const item = items.find(i => i.id === usage.inventoryItemId);
        return {
          inventoryItemId: usage.inventoryItemId,
          itemName: item?.name || 'Unknown',
          unit: item?.unit || 'pieces',
          totalUsed: Math.abs(Number(usage._sum.quantityChange) || 0),
          usageCount: usage._count.id
        };
      }).sort((a, b) => b.totalUsed - a.totalUsed);

      // Get daily usage trend
      const dailyUsage = await prisma.$queryRaw`
        SELECT 
          DATE(date) as date,
          SUM(CASE WHEN quantity_change < 0 THEN ABS(quantity_change) ELSE 0 END) as used,
          SUM(CASE WHEN quantity_change > 0 THEN quantity_change ELSE 0 END) as added
        FROM inventory_transactions it
        INNER JOIN inventory_items ii ON it.inventory_item_id = ii.id
        WHERE ii.organization_id = ${organizationId}
          ${startDate ? `AND it.date >= ${startDate}` : ''}
          ${endDate ? `AND it.date <= ${endDate}` : ''}
        GROUP BY DATE(it.date)
        ORDER BY date DESC
        LIMIT 30
      `;

      // Format usage by type
      const formattedUsageByType = usageByType.map(ub => ({
        usageType: ub.usageType,
        totalQuantity: Math.abs(Number(ub._sum.quantityChange) || 0),
        transactionCount: ub._count.id
      }));

      res.json({
        usageByType: formattedUsageByType,
        usageByItem: usageByItemWithDetails,
        dailyUsage: (dailyUsage as any[]).map((day: any) => ({
          date: day.date,
          used: Number(day.used),
          added: Number(day.added)
        }))
      });

    } catch (error: any) {
      console.error('Error fetching usage analytics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch usage analytics',
        details: error.message 
      });
    }
  }

  // Get low stock alerts based on usage patterns
  static async getLowStockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const organizationId = req.user!.organizationId;

      // Get items with low stock
      const lowStockItems = await prisma.inventoryItem.findMany({
        where: {
          organizationId,
          quantity: {
            lte: prisma.inventoryItem.fields.minimumStock
          }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              transactions: {
                where: {
                  date: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                      },
                      quantityChange: {
                        lt: 0 // Usage only
                      }
                }
              }
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        }
      });

      // Calculate days of stock remaining based on recent usage
      const itemsWithDaysRemaining = await Promise.all(
        lowStockItems.map(async (item) => {
          // Get average daily usage over last 30 days
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const usageStats = await prisma.inventoryTransaction.aggregate({
            where: {
              inventoryItemId: item.id,
              quantityChange: {
                lt: 0 // Usage only
              },
              date: {
                gte: thirtyDaysAgo
              }
            },
            _sum: {
              quantityChange: true
            }
          });

          const totalUsed = Math.abs(Number(usageStats._sum.quantityChange) || 0);
          const avgDailyUsage = totalUsed / 30;
          const daysRemaining = avgDailyUsage > 0 ? Math.floor(Number(item.quantity) / avgDailyUsage) : null;

          return {
            ...item,
            avgDailyUsage,
            daysRemaining,
            recentUsageCount: item._count.transactions
          };
        })
      );

      // Get category names
      const categoryIds = itemsWithDaysRemaining.map(item => item.categoryId).filter(Boolean);
      const categories = await prisma.inventoryCategory.findMany({
        where: {
          id: { in: categoryIds as number[] }
        },
        select: {
          id: true,
          name: true
        }
      });

      res.json({
        alerts: itemsWithDaysRemaining.map(item => {
          const category = categories.find(c => c.id === item.categoryId);
          return {
            id: item.id,
            name: item.name,
            category: category?.name || 'Uncategorized',
            currentQuantity: Number(item.quantity),
            minimumStock: Number(item.minimumStock),
            unit: item.unit || 'pieces',
            avgDailyUsage: item.avgDailyUsage,
            daysRemaining: item.daysRemaining,
            recentUsageCount: item.recentUsageCount,
            urgency: item.daysRemaining !== null && item.daysRemaining <= 7 ? 'HIGH' : 
                     item.daysRemaining !== null && item.daysRemaining <= 14 ? 'MEDIUM' : 'LOW'
          };
        })
      });

    } catch (error: any) {
      console.error('Error fetching low stock alerts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch low stock alerts',
        details: error.message 
      });
    }
  }
}

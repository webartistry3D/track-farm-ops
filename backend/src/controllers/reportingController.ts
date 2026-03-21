import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { startDate, endDate } = req.query;
    const requestId = `financial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📊 [${requestId}] Generating financial report for ${currentUser.role} ${currentUser.name}`);

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
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Get accessible user IDs based on role
    let accessibleUserIds: number[] = [];
    
    if (currentUser.role === 'OWNER') {
      const orgUsers = await prisma.user.findMany({
        where: { organizationId: currentUserOrg.organizationId },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    } else if (currentUser.role === 'MANAGER' || currentUser.role === 'WORKER') {
      const orgUsers = await prisma.user.findMany({
        where: { 
          organizationId: currentUserOrg.organizationId,
          role: { in: ['OWNER', 'MANAGER', 'WORKER'] }
        },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Get summary data
    const [
      totalIncome,
      totalExpenses,
      invoiceStats,
      subscriptionStats
    ] = await Promise.all([
      // Total income
      prisma.incomeEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Total expenses
      prisma.expenseEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Invoice statistics
      prisma.invoice.aggregate({
        where: {
          user: {
            organizationId: currentUserOrg.organizationId
          },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        },
        _sum: { total: true },
        _count: true
      }),
      
      // Subscription statistics
      prisma.subscription.aggregate({
        where: {
          organizationId: currentUserOrg.organizationId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        },
        _sum: { price: true },
        _count: true
      })
    ]);

    const totalIncomeNum = Number(totalIncome._sum.amount || 0);
    const totalExpensesNum = Number(totalExpenses._sum.amount || 0);
    const netIncome = totalIncomeNum - totalExpensesNum;
    const totalInvoicesNum = Number(invoiceStats._sum.total || 0);
    const totalSubscriptionsNum = Number(subscriptionStats._sum.price || 0);

    const report = {
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        reportType: 'financial',
        generatedAt: new Date().toISOString(),
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        requestId
      },
      summary: {
        totalIncome: totalIncomeNum,
        totalExpenses: totalExpensesNum,
        netIncome,
        profitMargin: totalIncomeNum > 0 ? Math.round((netIncome / totalIncomeNum) * 100) : 0,
        incomeTransactions: totalIncome._count,
        expenseTransactions: totalExpenses._count,
        totalInvoices: totalInvoicesNum,
        totalSubscriptions: totalSubscriptionsNum,
        invoiceCount: invoiceStats._count,
        subscriptionCount: subscriptionStats._count
      }
    };

    console.log(`✅ [${requestId}] Financial report generated successfully`);
    res.json(report);

  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryReport = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { lowStockOnly = 'false' } = req.query;
    const requestId = `inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📦 [${requestId}] Generating inventory report for ${currentUser.role} ${currentUser.name}`);

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
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Build filters
    const whereClause: any = {
      organizationId: currentUserOrg.organizationId
    };
    
    if (lowStockOnly === 'true') {
      whereClause.quantity = { lt: 10 };
    }

    // Get inventory summary
    const [
      totalItems,
      lowStockCount,
      outOfStockCount,
      totalQuantity
    ] = await Promise.all([
      // Total items count
      prisma.inventoryItem.count({
        where: whereClause
      }),
      
      // Low stock count
      prisma.inventoryItem.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          quantity: { lt: 10 }
        }
      }),
      
      // Out of stock count
      prisma.inventoryItem.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          quantity: 0
        }
      }),
      
      // Total quantity
      prisma.inventoryItem.aggregate({
        where: whereClause,
        _sum: { quantity: true }
      })
    ]);

    const stockHealth = totalItems > 0 ? Math.round(((totalItems - lowStockCount) / totalItems) * 100) : 0;

    const report = {
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        reportType: 'inventory',
        generatedAt: new Date().toISOString(),
        filters: {
          lowStockOnly: lowStockOnly === 'true'
        },
        requestId
      },
      summary: {
        totalItems,
        totalQuantity: Number(totalQuantity._sum.quantity || 0),
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        healthyStockItems: totalItems - lowStockCount,
        stockHealth
      }
    };

    console.log(`✅ [${requestId}] Inventory report generated successfully`);
    res.json(report);

  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOperationalReport = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const requestId = `operational_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`⚙️ [${requestId}] Generating operational report for ${currentUser.role} ${currentUser.name}`);

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
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    // Get operational summary
    const [
      userStats,
      assetCount,
      subscriptionCount,
      recentActivity
    ] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        where: {
          organizationId: currentUserOrg.organizationId
        },
        _count: true
      }),
      
      // Asset count
      prisma.asset.count({
        where: {
          organizationId: currentUserOrg.organizationId
        }
      }),
      
      // Subscription count
      prisma.subscription.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          status: { in: ['active', 'trial'] }
        }
      }),
      
      // Recent activity (simplified)
      prisma.incomeEntry.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    const report = {
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        reportType: 'operational',
        generatedAt: new Date().toISOString(),
        requestId
      },
      summary: {
        users: {
          total: userStats.reduce((sum, stat) => sum + stat._count, 0),
          byRole: userStats.reduce((acc, stat) => {
            acc[stat.role] = stat._count;
            return acc;
          }, {} as Record<string, number>)
        },
        assets: {
          total: assetCount
        },
        subscriptions: {
          active: subscriptionCount
        },
        recentActivity: {
          last30DaysTransactions: recentActivity
        }
      }
    };

    console.log(`✅ [${requestId}] Operational report generated successfully`);
    res.json(report);

  } catch (error) {
    console.error('Get operational report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

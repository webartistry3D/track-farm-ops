import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getOrganizationKPIs = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const requestId = `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📊 [${requestId}] Fetching organization KPIs for ${currentUser.role} ${currentUser.name}`);

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
      console.log(`❌ [${requestId}] User not assigned to organization - KPI access denied`);
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION',
        requestId
      });
    }

    console.log(`📊 [${requestId}] Calculating KPIs for organization ${currentUserOrg.organization?.name}`);

    // Get accessible user IDs based on role
    let accessibleUserIds: number[] = [];
    
    if (currentUser.role === 'OWNER') {
      // Owners see all data in organization
      const orgUsers = await prisma.user.findMany({
        where: { organizationId: currentUserOrg.organizationId },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    } else if (currentUser.role === 'MANAGER' || currentUser.role === 'WORKER') {
      // Managers and Workers see all data in organization (organization-wide access)
      const orgUsers = await prisma.user.findMany({
        where: { 
          organizationId: currentUserOrg.organizationId,
          role: { in: ['OWNER', 'MANAGER', 'WORKER'] }
        },
        select: { id: true }
      });
      accessibleUserIds = orgUsers.map(u => u.id);
    }

    // Calculate KPIs in parallel
    const [
      totalIncome,
      totalExpenses,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalInventoryItems,
      lowStockItems,
      totalAssets,
      activeSubscriptions,
      userCount
    ] = await Promise.all([
      // Total Income
      prisma.incomeEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId
        },
        _sum: { amount: true }
      }),
      
      // Total Expenses
      prisma.expenseEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId
        },
        _sum: { amount: true }
      }),
      
      // Total Invoices
      prisma.invoice.count({
        where: {
          user: {
            organizationId: currentUserOrg.organizationId
          }
        }
      }),
      
      // Paid Invoices
      prisma.invoice.count({
        where: {
          user: {
            organizationId: currentUserOrg.organizationId
          },
          status: 'PAID'
        }
      }),
      
      // Pending Invoices
      prisma.invoice.count({
        where: {
          user: {
            organizationId: currentUserOrg.organizationId
          },
          status: 'PENDING'
        }
      }),
      
      // Total Inventory Items
      prisma.inventoryItem.aggregate({
        where: {
          organizationId: currentUserOrg.organizationId
        },
        _sum: { quantity: true },
        _count: true
      }),
      
      // Low Stock Items
      prisma.inventoryItem.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          quantity: { lt: 10 }
        }
      }),
      
      // Total Assets
      prisma.asset.count({
        where: {
          organizationId: currentUserOrg.organizationId
        }
      }),
      
      // Active Subscriptions
      prisma.subscription.count({
        where: {
          organizationId: currentUserOrg.organizationId,
          status: { in: ['active', 'trial'] }
        }
      }),
      
      // User Count
      prisma.user.count({
        where: {
          organizationId: currentUserOrg.organizationId
        }
      })
    ]);

    // Calculate derived metrics
    const totalIncomeNum = Number(totalIncome._sum.amount || 0);
    const totalExpensesNum = Number(totalExpenses._sum.amount || 0);
    const netIncome = totalIncomeNum - totalExpensesNum;
    const profitMargin = totalIncomeNum > 0 ? (netIncome / totalIncomeNum) * 100 : 0;
    const invoicePaymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    const kpis = {
      financial: {
        totalIncome: totalIncomeNum,
        totalExpenses: totalExpensesNum,
        netIncome,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        paymentRate: Math.round(invoicePaymentRate * 100) / 100
      },
      inventory: {
        totalItems: totalInventoryItems._count || 0,
        totalQuantity: Number(totalInventoryItems._sum.quantity || 0),
        lowStockItems,
        stockHealth: totalInventoryItems._count ? Math.round(((totalInventoryItems._count - lowStockItems) / totalInventoryItems._count) * 100) : 100
      },
      operations: {
        totalAssets,
        activeSubscriptions,
        userCount,
        assetPerUser: userCount > 0 ? Math.round((totalAssets / userCount) * 100) / 100 : 0
      },
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        calculatedAt: new Date().toISOString(),
        requestId
      }
    };

    console.log(`✅ [${requestId}] KPIs calculated successfully for ${currentUserOrg.organization?.name}`);
    res.json(kpis);

  } catch (error) {
    console.error('Get organization KPIs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRevenueAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { period = '30' } = req.query;
    const requestId = `revenue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`💰 [${requestId}] Fetching revenue analytics for ${currentUser.role} ${currentUser.name}, period: ${period} days`);

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

    // Get accessible user IDs
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

    // Calculate date range
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get revenue data
    const revenueData = await prisma.incomeEntry.groupBy({
      by: ['date'],
      where: {
        userId: { in: accessibleUserIds },
        organizationId: currentUserOrg.organizationId,
        date: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get expense data for comparison
    const expenseData = await prisma.expenseEntry.groupBy({
      by: ['date'],
      where: {
        userId: { in: accessibleUserIds },
        organizationId: currentUserOrg.organizationId,
        date: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Combine data
    const analytics = revenueData.map(day => {
      const dayRevenue = Number(day._sum.amount || 0);
      const matchingExpense = expenseData.find(exp => exp.date.toISOString().split('T')[0] === day.date.toISOString().split('T')[0]);
      const dayExpenses = Number(matchingExpense?._sum.amount || 0);
      
      return {
        date: day.date,
        revenue: dayRevenue,
        expenses: dayExpenses,
        net: dayRevenue - dayExpenses
      };
    });

    // Calculate totals
    const totalRevenue = analytics.reduce((sum, day) => sum + day.revenue, 0);
    const totalExpenses = analytics.reduce((sum, day) => sum + day.expenses, 0);
    const totalNet = totalRevenue - totalExpenses;

    console.log(`✅ [${requestId}] Revenue analytics calculated for ${analytics.length} days`);
    
    res.json({
      period: `${days} days`,
      analytics,
      summary: {
        totalRevenue,
        totalExpenses,
        totalNet,
        averageDailyRevenue: analytics.length > 0 ? Math.round((totalRevenue / analytics.length) * 100) / 100 : 0,
        averageDailyExpenses: analytics.length > 0 ? Math.round((totalExpenses / analytics.length) * 100) / 100 : 0
      },
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        calculatedAt: new Date().toISOString(),
        requestId
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const requestId = `inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📦 [${requestId}] Fetching inventory analytics for ${currentUser.role} ${currentUser.name}`);

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

    // Get basic inventory analytics
    const [
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalItems
    ] = await Promise.all([
      // Total inventory value
      prisma.inventoryItem.aggregate({
        where: {
          organizationId: currentUserOrg.organizationId
        },
        _sum: { quantity: true },
        _count: true
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
      
      // Total items count
      prisma.inventoryItem.count({
        where: {
          organizationId: currentUserOrg.organizationId
        }
      })
    ]);

    // Calculate stock health
    const healthyStockItems = totalItems - lowStockCount;
    const stockHealthPercentage = totalItems > 0 ? Math.round((healthyStockItems / totalItems) * 100) : 0;

    const analytics = {
      overview: {
        totalItems,
        totalQuantity: Number(totalValue._sum.quantity || 0),
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        healthyStockItems,
        stockHealthPercentage
      },
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        calculatedAt: new Date().toISOString(),
        requestId
      }
    };

    console.log(`✅ [${requestId}] Inventory analytics calculated for ${currentUserOrg.organization?.name}`);
    res.json(analytics);

  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

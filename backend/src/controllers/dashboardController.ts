import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const requestId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📊 [${requestId}] Fetching dashboard data for ${currentUser.role} ${currentUser.name}`);

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

    // Get dashboard data in parallel
    const [
      totalIncome,
      totalExpenses,
      recentInvoices,
      inventoryStats,
      recentActivity,
      alerts
    ] = await Promise.all([
      // Total income (last 30 days)
      prisma.incomeEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Total expenses (last 30 days)
      prisma.expenseEntry.aggregate({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      
      // Recent invoices (last 5)
      prisma.invoice.findMany({
        where: {
          user: {
            organizationId: currentUserOrg.organizationId
          }
        },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Inventory statistics
      prisma.inventoryItem.aggregate({
        where: {
          organizationId: currentUserOrg.organizationId
        },
        _sum: { quantity: true },
        _count: true
      }),
      
      // Recent activity (last 7 days)
      prisma.incomeEntry.findMany({
        where: {
          userId: { in: accessibleUserIds },
          organizationId: currentUserOrg.organizationId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      
      // Alerts (low stock, pending invoices, etc.)
      prisma.$queryRaw`
        SELECT 'low_stock' as type, COUNT(*) as count
        FROM "inventory_items" 
        WHERE "organizationId" = ${currentUserOrg.organizationId} 
          AND "quantity" < 10
        UNION ALL
        SELECT 'pending_invoices' as type, COUNT(*) as count
        FROM "invoices" 
        WHERE "userId" IN (${accessibleUserIds.join(',')})
          AND "status" = 'PENDING'
        UNION ALL
        SELECT 'overdue_invoices' as type, COUNT(*) as count
        FROM "invoices" 
        WHERE "userId" IN (${accessibleUserIds.join(',')})
          AND "status" = 'PENDING'
          AND "dueDate" < NOW()
      `
    ]);

    const totalIncomeNum = Number(totalIncome._sum.amount || 0);
    const totalExpensesNum = Number(totalExpenses._sum.amount || 0);
    const netIncome = totalIncomeNum - totalExpensesNum;
    const profitMargin = totalIncomeNum > 0 ? Math.round((netIncome / totalIncomeNum) * 100) : 0;

    const dashboardData = {
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        generatedAt: new Date().toISOString(),
        requestId
      },
      kpis: {
        financial: {
          totalIncome: totalIncomeNum,
          totalExpenses: totalExpensesNum,
          netIncome,
          profitMargin,
          incomeTransactions: totalIncome._count,
          expenseTransactions: totalExpenses._count
        },
        inventory: {
          totalItems: inventoryStats._count || 0,
          totalQuantity: Number(inventoryStats._sum.quantity || 0)
        },
        alerts: (alerts as any[]).map((alert: any) => ({
          type: alert.type,
          count: Number(alert.count)
        }))
      },
      widgets: {
        recentInvoices: recentInvoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          total: Number(invoice.total),
          status: invoice.status,
          createdAt: invoice.createdAt,
          createdBy: invoice.user.name
        })),
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          type: 'income',
          amount: Number(activity.amount),
          category: activity.category,
          date: activity.date,
          description: activity.description,
          user: activity.user.name
        }))
      }
    };

    console.log(`✅ [${requestId}] Dashboard data fetched successfully`);
    res.json(dashboardData);

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardCharts = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { chartType = 'revenue', period = '30' } = req.query;
    const requestId = `charts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📈 [${requestId}] Fetching dashboard charts for ${currentUser.role} ${currentUser.name}, chart: ${chartType}, period: ${period} days`);

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

    // Calculate date range
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let chartData: any[] = [];

    if (chartType === 'revenue') {
      // Revenue chart data
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

      chartData = revenueData.map(day => {
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
    } else if (chartType === 'categories') {
      // Category breakdown
      const categoryData = await prisma.incomeEntry.groupBy({
        by: ['category'],
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
        _count: true,
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        }
      });

      chartData = categoryData.map(cat => ({
        category: cat.category,
        amount: Number(cat._sum.amount || 0),
        count: cat._count
      }));
    }

    const chartsData = {
      metadata: {
        organizationId: currentUserOrg.organizationId,
        organizationName: currentUserOrg.organization?.name,
        userRole: currentUser.role,
        chartType: chartType as string,
        period: `${days} days`,
        generatedAt: new Date().toISOString(),
        requestId
      },
      data: chartData
    };

    console.log(`✅ [${requestId}] Dashboard charts fetched successfully`);
    res.json(chartsData);

  } catch (error) {
    console.error('Get dashboard charts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

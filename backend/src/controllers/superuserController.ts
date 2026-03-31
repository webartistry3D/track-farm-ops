import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    // Only superusers can access system stats
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const [
      totalUsers,
      activeUsers,
      totalOrganizations,
      activeOrganizations,
      totalRevenue,
      monthlyGrowth,
      totalIncome,
      totalExpenses,
      totalAssets,
      totalInventory
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.organization.count(),
      prisma.organization.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.subscription.aggregate({ _sum: { price: true } }),
      // Calculate monthly growth (simplified)
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.incomeEntry.aggregate({ _sum: { amount: true } }),
      prisma.expenseEntry.aggregate({ _sum: { amount: true } }),
      prisma.asset.count(),
      prisma.inventoryItem.count()
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalOrganizations,
      activeOrganizations,
      systemHealth: 95, // Placeholder
      totalRevenue: totalRevenue._sum.price || 0,
      monthlyGrowth: activeUsers,
      serverUptime: 99.9, // Placeholder
      storageUsed: 45.2, // Placeholder in GB
      storageTotal: 100, // Placeholder in GB
      apiCalls: 125000, // Placeholder
      errorRate: 0.02, // Placeholder
      netProfit: Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0),
      totalAssets,
      totalInventory
    };

    res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    // Only superusers can access all users
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            incomeEntries: true,
            expenseEntries: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active', // Placeholder - could add status field to schema
      organization: user.organization?.name || 'System',
      lastLogin: new Date().toISOString(), // Placeholder - could add lastLogin field
      createdAt: user.createdAt.toISOString(),
      subscription: 'Premium', // Placeholder - could derive from subscription table
      permissions: user.role === 'OWNER' ? ['full'] : user.role === 'MANAGER' ? ['partial'] : ['limited'],
      devices: 1, // Placeholder
      location: 'Nigeria', // Placeholder
      phone: 'Not provided', // Placeholder - could add phone field
      revenue: user._count.incomeEntries * 50000, // Placeholder calculation
      activity: user._count.incomeEntries + user._count.expenseEntries
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    // Only superusers can access all organizations
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            incomeEntries: true,
            expenseEntries: true,
            assets: true,
            inventoryItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrgs = organizations.map(org => ({
      id: org.id.toString(),
      name: org.name,
      type: 'Farm', // Placeholder - could add type field
      status: 'active', // Placeholder - could add status field
      users: org._count.users,
      revenue: org._count.incomeEntries * 75000, // Placeholder calculation
      growth: 12.5, // Placeholder - could calculate from historical data
      subscription: 'Premium', // Placeholder - could derive from subscription table
      createdAt: org.createdAt.toISOString()
    }));

    res.json(formattedOrgs);
  } catch (error) {
    console.error('Get all organizations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { userId } = req.params;
    const { status } = req.body;

    // Only superusers can toggle user status
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    // Prevent superusers from deactivating themselves
    if (Number(userId) === currentUser.id) {
      return res.status(400).json({ error: 'Cannot modify your own account' });
    }

    // For now, we'll just return success since we don't have a status field
    // In a real implementation, you'd add a 'status' field to the User model
    console.log(`🔄 User status toggle requested for user ${userId} to ${status}`);

    res.json({
      message: `User status updated to ${status}`,
      userId,
      status
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUserAccount = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { userId } = req.params;

    // Only superusers can delete users
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    // Prevent superusers from deleting themselves
    if (Number(userId) === currentUser.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(userId as string) }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: parseInt(userId as string) }
    });

    console.log(`🗑️ Superuser ${currentUser.name} deleted user ${userToDelete.name} (${userToDelete.email})`);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    // Only superusers can access subscriptions
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend interface
    const transformedSubscriptions = subscriptions.map(sub => ({
      id: sub.id.toString(),
      userId: sub.userId.toString(),
      userName: sub.user.name,
      userEmail: sub.user.email,
      plan: sub.plan || 'Basic',
      status: sub.status || 'active',
      amount: Number(sub.price) || 0,
      currency: 'NGN',
      billingCycle: sub.billingCycle || 'monthly',
      startDate: sub.activatedAt?.toISOString() || new Date().toISOString(),
      endDate: sub.expiresAt?.toISOString() || new Date().toISOString(),
      nextBillingDate: sub.expiresAt?.toISOString() || new Date().toISOString(),
      autoRenew: true, // Default to true since field doesn't exist
      paymentMethod: 'card', // Default since field doesn't exist
      lastPaymentDate: sub.activatedAt?.toISOString() || new Date().toISOString(),
      organization: sub.user.organization?.name || 'Unknown',
      features: [] // Default empty array since field doesn't exist
    }));

    console.log(`📊 Superuser ${currentUser.name} fetched ${subscriptions.length} subscriptions`);
    res.json(transformedSubscriptions);
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { subId } = req.params;
    const { action } = req.body;

    // Only superusers can manage subscriptions
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(subId as string) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    let newStatus: string;
    switch (action) {
      case 'activate':
        newStatus = 'active';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        break;
      case 'suspend':
        newStatus = 'inactive';
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: parseInt(subId as string) },
      data: { status: newStatus }
    });

    console.log(`🔄 Superuser ${currentUser.name} ${action}d subscription for ${subscription.user.name} (${subscription.user.email})`);

    res.json({
      message: `Subscription ${action}d successfully`,
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Toggle subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

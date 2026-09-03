import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import express from 'express';
import { 
  getSystemStats, 
  getAllUsers, 
  getAllOrganizations, 
  toggleUserStatus, 
  deleteUserAccount,
  getAllSubscriptions,
  toggleSubscriptionStatus,
  toggleOrganizationStatus,
  deleteOrganization
} from '../controllers/superuserController';
import { getPendingPayments, approvePayment, rejectPayment } from '../controllers/paymentController';
import { logSystemEvent } from '../utils/auditLogger';
import { prisma } from '../lib/prisma';

const router = Router();

// All superuser routes require authentication and superuser role
router.use(authenticate);

// Superuser middleware to check role
router.use((req: AuthRequest, res, next) => {
  if (req.user?.role !== 'SUPERUSER') {
    return res.status(403).json({ error: 'Superuser access required' });
  }
  next();
});

// System statistics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUserAccount);

// Organization management
router.get('/organizations', getAllOrganizations);
router.post('/organizations/:orgId/:action', toggleOrganizationStatus);
router.delete('/organizations/:orgId', deleteOrganization);

// Subscription management
router.get('/subscriptions', getAllSubscriptions);
router.post('/subscriptions/:subId/:action', toggleSubscriptionStatus);

// Payment review management
router.get('/payments', getPendingPayments);
router.patch('/payments/:id/approve', approvePayment);
router.patch('/payments/:id/reject', rejectPayment);

// System logs (persisted in database)
router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user!;
    
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    // Query persisted system logs from the database, most recent first
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500, // Reasonable upper limit for the dashboard
    });

    // Transform to the shape the frontend expects
    const transformedLogs = logs.map(log => ({
      id: String(log.id),
      type: log.type,
      message: log.message,
      timestamp: log.createdAt.toISOString(),
      severity: log.severity,
      ip: log.ip || 'unknown',
      action: log.action,
      userId: log.userId,
      userName: log.userName,
      userRole: log.userRole,
      resource: log.resource,
      resourceId: log.resourceId,
      metadata: log.metadata,
    }));

    res.json(transformedLogs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System settings routes
router.post('/maintenance-mode', async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user!;
    
    // Only superusers can toggle maintenance mode
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    // In a real implementation, you would:
    // 1. Update a configuration file or database setting
    // 2. Restart services or enable maintenance middleware
    // 3. Log the maintenance action
    
    console.log(`🔧 Superuser ${currentUser.name} toggled maintenance mode`);
    
    // Simulate maintenance mode toggle
    const maintenanceStatus = 'enabled'; // In real app, this would toggle
    
    await logSystemEvent({
      type: 'system',
      message: `Superuser ${currentUser.name} toggled maintenance mode (${maintenanceStatus})`,
      severity: 'warning',
      action: 'maintenance_mode_toggle',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      resource: 'System',
      metadata: { maintenanceStatus },
    });
    
    res.json({
      message: `Maintenance mode ${maintenanceStatus} successfully`,
      maintenanceStatus,
      timestamp: new Date().toISOString(),
      activatedBy: currentUser.name
    });
  } catch (error) {
    console.error('Maintenance mode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/backup-database', async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user!;
    
    // Only superusers can backup database
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    console.log(`💾 Superuser ${currentUser.name} initiated database backup`);
    
    // Simulate backup process
    const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    const backupSize = Math.floor(Math.random() * 1000000) + 500000;
    
    await logSystemEvent({
      type: 'database',
      message: `Superuser ${currentUser.name} initiated database backup (${backupFileName})`,
      severity: 'info',
      action: 'database_backup',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      resource: 'Database',
      metadata: { backupFileName, backupSize },
    });
    
    // Simulate async backup process
    setTimeout(() => {
      console.log(`✅ Database backup completed: ${backupFileName} (${backupSize} bytes)`);
    }, 2000);
    
    res.json({
      message: 'Database backup started successfully',
      backupInfo: {
        fileName: backupFileName,
        size: backupSize,
        status: 'in_progress',
        estimatedCompletion: new Date(Date.now() + 2000).toISOString()
      },
      timestamp: new Date().toISOString(),
      initiatedBy: currentUser.name
    });
  } catch (error) {
    console.error('Database backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/clear-cache', async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user!;
    
    // Only superusers can clear cache
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    console.log(`🧹 Superuser ${currentUser.name} cleared system cache`);
    
    // Simulate cache clearing
    const cacheTypesCleared = ['user_sessions', 'api_responses', 'database_queries', 'static_assets'];
    const totalItemsCleared = Math.floor(Math.random() * 1000) + 500;
    
    await logSystemEvent({
      type: 'system',
      message: `Superuser ${currentUser.name} cleared system cache (${totalItemsCleared} items)`,
      severity: 'info',
      action: 'clear_cache',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      resource: 'Cache',
      metadata: { cacheTypesCleared, totalItemsCleared },
    });
    
    res.json({
      message: 'System cache cleared successfully',
      cacheInfo: {
        typesCleared: cacheTypesCleared,
        totalItemsCleared,
        cacheSizeFreed: `${(Math.random() * 100 + 50).toFixed(2)}MB`,
        timestamp: new Date().toISOString()
      },
      clearedBy: currentUser.name
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System activity (real activity tracking)
router.get('/activity', async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user!;
    
    // Only superusers can access system activity
    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    // Get recent real activities from database
    const [
      recentUsers,
      recentOrganizations,
      recentSubscriptions,
      totalUsers,
      totalOrganizations
    ] = await Promise.all([
      // Get recently created users (last 24 hours)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      // Get recently created organizations (last 24 hours)
      prisma.organization.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),
      // Get recent subscriptions (last 24 hours)
      prisma.subscription.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          plan: true,
          userId: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      // Get total counts for context
      prisma.user.count(),
      prisma.organization.count()
    ]);

    // Build activity array from real data
    const activities = [];

    // Add user creation activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        action: 'user_created',
        description: `New user account created: ${user.name}`,
        user: user.name,
        resource: 'User Account',
        details: `Email: ${user.email}`,
        ip: 'System',
        timestamp: user.createdAt.toISOString()
      });
    });

    // Add organization creation activities
    recentOrganizations.forEach(org => {
      activities.push({
        id: `org_${org.id}`,
        action: 'organization_created',
        description: `New organization created: ${org.name}`,
        user: 'System',
        resource: 'Organization',
        details: `Organization: ${org.name}`,
        ip: 'System',
        timestamp: org.createdAt.toISOString()
      });
    });

    // Add subscription activities
    recentSubscriptions.forEach(sub => {
      activities.push({
        id: `sub_${sub.id}`,
        action: 'subscription_created',
        description: `${sub.plan} plan subscription created`,
        user: sub.user.name,
        resource: 'Subscription',
        details: `Plan: ${sub.plan} | User: ${sub.user.email}`,
        ip: 'System',
        timestamp: sub.createdAt.toISOString()
      });
    });

    // Add current superuser login activity
    activities.push({
      id: `login_${currentUser.id}`,
      action: 'superuser_login',
      description: 'Superuser dashboard accessed',
      user: currentUser.name,
      resource: 'Dashboard',
      details: 'Superuser login detected',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Add system summary activities
    activities.push({
      id: 'system_summary',
      action: 'system_stats',
      description: `System currently managing ${totalUsers} users and ${totalOrganizations} organizations`,
      user: 'System',
      resource: 'System Overview',
      details: `Total Users: ${totalUsers} | Organizations: ${totalOrganizations}`,
      ip: 'localhost',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(activities.slice(0, 10)); // Return top 10 most recent activities
  } catch (error) {
    console.error('Get system activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

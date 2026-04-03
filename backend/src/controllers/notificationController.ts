import { Request, Response } from 'express';
import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';
import { prisma } from '../lib/prisma';
import '../types/express';

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      userId,
      organizationId,
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    if (type) {
      where.type = type as NotificationType;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
    });

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await prisma.notification.updateMany({
      where: {
        id: Number(id),
        userId,
        organizationId,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    res.json({ 
      message: 'All notifications marked as read',
      count: result.count 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await prisma.notification.deleteMany({
      where: {
        id: Number(id),
        userId,
        organizationId,
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Create a new notification
export const createNotification = async (
  userId: number,
  organizationId: number,
  title: string,
  message: string,
  type: NotificationType,
  priority: NotificationPriority = NotificationPriority.MEDIUM,
  metadata?: any,
  actionUrl?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        organizationId,
        title,
        message,
        type,
        priority,
        metadata,
        actionUrl,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({
        where: { userId, organizationId },
      }),
      prisma.notification.count({
        where: { userId, organizationId, isRead: false },
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId, organizationId },
        _count: { type: true },
      }),
    ]);

    res.json({
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};

// Cleanup old notifications (older than 30 days)
export const cleanupOldNotifications = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isRead: true, // Only delete read notifications
      },
    });

    res.json({ 
      message: 'Old notifications cleaned up',
      count: result.count 
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ error: 'Failed to cleanup notifications' });
  }
};

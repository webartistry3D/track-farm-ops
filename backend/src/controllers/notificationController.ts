import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// Get all notifications for the authenticated user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { unread, type, limit = 20, offset = 0 } = req.query;
    
    const whereClause: any = { userId };
    
    if (unread === 'true') {
      whereClause.read = false;
    }
    
    if (type) {
      whereClause.type = type as string;
    }
    
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });
    
    const total = await prisma.notification.count({ where: whereClause });
    const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
    
    res.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        time: formatTimeAgo(n.createdAt),
        relatedEntity: n.relatedEntity,
        relatedEntityId: n.relatedEntityId,
        metadata: n.metadata
      })),
      stats: {
        total,
        unread: unreadCount
      },
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const total = await prisma.notification.count({ where: { userId } });
    const unread = await prisma.notification.count({ where: { userId, read: false } });
    
    res.json({
      stats: {
        total,
        unread
      },
      summary: {
        totalNotifications: total,
        unreadNotifications: unread,
        readNotifications: total - unread
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notificationId } = req.params;
    const id = Array.isArray(notificationId) ? parseInt(notificationId[0]) : parseInt(notificationId);
    
    await prisma.notification.updateMany({
      where: {
        id: id,
        userId
      },
      data: { read: true }
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Create a new notification
export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, message, type, relatedEntity, relatedEntityId, metadata } = req.body;
    
    const notification = await prisma.notification.create({
      data: {
        title: title || 'New Notification',
        message: message || 'You have a new notification',
        type: type || 'INFO',
        userId,
        organizationId,
        relatedEntity,
        relatedEntityId,
        metadata
      }
    });
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notificationId } = req.params;
    const id = Array.isArray(notificationId) ? parseInt(notificationId[0]) : parseInt(notificationId);
    
    await prisma.notification.deleteMany({
      where: {
        id: id,
        userId
      }
    });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

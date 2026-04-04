import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: 'Low Stock Alert',
    message: 'Your inventory for "Fertilizer" is running low. Current stock: 5 units',
    type: 'warning',
    priority: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    category: 'inventory',
    actionUrl: '/inventory'
  },
  {
    id: 2,
    title: 'New Sale Recorded',
    message: 'A new sale of ₦50,000 has been recorded for "Tomatoes"',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    category: 'sales',
    actionUrl: '/sales'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'System maintenance scheduled for tonight at 11:00 PM',
    type: 'info',
    priority: 'low',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    category: 'system',
    actionUrl: null
  },
  {
    id: 4,
    title: 'Payment Reminder',
    message: 'Your subscription payment is due in 3 days',
    type: 'warning',
    priority: 'medium',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    category: 'billing',
    actionUrl: '/billing'
  },
  {
    id: 5,
    title: 'New Employee Added',
    message: 'John Doe has been added to your organization',
    type: 'success',
    priority: 'low',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: true,
    category: 'hr',
    actionUrl: '/employees'
  }
];

// Mock notification preferences
const mockPreferences = {
  emailNotifications: true,
  lowStockAlerts: true,
  dailyReports: false,
  weeklyReports: true
};

// Utility function to get notification statistics
const calculateNotificationStats = () => {
  const total = mockNotifications.length;
  const unread = mockNotifications.filter(n => !n.read).length;
  const byPriority = {
    high: mockNotifications.filter(n => n.priority === 'high' && !n.read).length,
    medium: mockNotifications.filter(n => n.priority === 'medium' && !n.read).length,
    low: mockNotifications.filter(n => n.priority === 'low' && !n.read).length
  };
  const byCategory = {
    inventory: mockNotifications.filter(n => n.category === 'inventory' && !n.read).length,
    sales: mockNotifications.filter(n => n.category === 'sales' && !n.read).length,
    system: mockNotifications.filter(n => n.category === 'system' && !n.read).length,
    billing: mockNotifications.filter(n => n.category === 'billing' && !n.read).length,
    hr: mockNotifications.filter(n => n.category === 'hr' && !n.read).length
  };
  
  return { total, unread, byPriority, byCategory };
};

// Get all notifications for the authenticated user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    // Get query parameters for filtering
    const { unread, type, priority, category, limit = 20, offset = 0 } = req.query;
    
    let filteredNotifications = [...mockNotifications];
    
    // Apply filters
    if (unread === 'true') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }
    
    if (category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === category);
    }
    
    // Apply pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    
    const stats = calculateNotificationStats();
    
    res.json({
      notifications: paginatedNotifications,
      stats,
      pagination: {
        total: filteredNotifications.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: endIndex < filteredNotifications.length
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
    const stats = calculateNotificationStats();
    
    res.json({
      stats,
      summary: {
        totalNotifications: stats.total,
        unreadNotifications: stats.unread,
        readNotifications: stats.total - stats.unread,
        highPriorityUnread: stats.byPriority.high,
        needsAttention: stats.byPriority.high + stats.byPriority.medium
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would fetch preferences from database
    res.json({
      preferences: mockPreferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { emailNotifications, lowStockAlerts, dailyReports, weeklyReports } = req.body;
    
    // In a real app, you would update preferences in database
    // For now, just return success
    console.log('Updated notification preferences:', {
      emailNotifications,
      lowStockAlerts,
      dailyReports,
      weeklyReports
    });
    
    res.json({
      message: 'Notification preferences updated successfully',
      preferences: {
        emailNotifications,
        lowStockAlerts,
        dailyReports,
        weeklyReports
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    // In a real app, you would update the notification in database
    // For now, just return success
    console.log(`Marked notification ${notificationId} as read`);
    
    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would update all notifications for the user in database
    // For now, just return success
    console.log('Marked all notifications as read');
    
    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Create a new notification
export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type, priority, actionUrl } = req.body;
    
    // In a real app, you would create notification in database
    // For now, create a mock notification
    const newNotification = {
      id: mockNotifications.length + 1,
      title: title || 'New Notification',
      message: message || 'You have a new notification',
      type: type || 'info',
      priority: priority || 'medium',
      timestamp: new Date(),
      read: false,
      category: type || 'general',
      actionUrl: actionUrl || null
    };
    
    // Add to mock data (in real app, this would be saved to database)
    mockNotifications.push(newNotification);
    
    console.log('Created notification:', newNotification);
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    // In a real app, you would delete the notification from database
    // For now, just return success
    console.log(`Deleted notification ${notificationId}`);
    
    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

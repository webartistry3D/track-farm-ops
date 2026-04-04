import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: 'Low Stock Alert',
    message: 'Your inventory for "Fertilizer" is running low. Current stock: 5 units',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    category: 'inventory'
  },
  {
    id: 2,
    title: 'New Sale Recorded',
    message: 'A new sale of ₦50,000 has been recorded for "Tomatoes"',
    type: 'success',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    category: 'sales'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'System maintenance scheduled for tonight at 11:00 PM',
    type: 'info',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    category: 'system'
  },
  {
    id: 4,
    title: 'Payment Reminder',
    message: 'Your subscription payment is due in 3 days',
    type: 'warning',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    category: 'billing'
  }
];

// Mock notification preferences
const mockPreferences = {
  emailNotifications: true,
  lowStockAlerts: true,
  dailyReports: false,
  weeklyReports: true
};

// Get all notifications for the authenticated user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would fetch notifications for the specific user
    // For now, return mock data
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    
    res.json({
      notifications: mockNotifications,
      unreadCount,
      total: mockNotifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
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

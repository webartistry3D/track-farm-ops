import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get all notifications for the user
router.get('/', getNotifications);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.put('/preferences', updateNotificationPreferences);

// Mark a specific notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router;

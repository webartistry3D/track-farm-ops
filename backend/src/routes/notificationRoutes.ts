import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats
} from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get all notifications for the user
router.get('/', getNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Create a new notification
router.post('/', createNotification);

// Mark a specific notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router;

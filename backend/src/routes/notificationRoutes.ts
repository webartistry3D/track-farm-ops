import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  cleanupOldNotifications,
} from '../controllers/notificationController';
import { notificationSSE } from '../services/notificationSSE';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// SSE endpoint for real-time notifications
router.get('/stream', (req, res) => {
  try {
    notificationSSE.addClient(req, res);
  } catch (error) {
    console.error('SSE connection error:', error);
    res.status(500).json({ error: 'Failed to establish SSE connection' });
  }
});

// GET /api/notifications - Get user notifications with pagination and filtering
router.get('/', getUserNotifications);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', getNotificationStats);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications/cleanup - Cleanup old notifications (admin only)
router.delete('/cleanup', cleanupOldNotifications);

export default router;

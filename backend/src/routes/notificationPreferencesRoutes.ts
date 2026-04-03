import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserNotificationPreferences,
  updateNotificationPreference,
  updateMultiplePreferences,
  resetPreferencesToDefaults,
  isNotificationEnabled,
} from '../controllers/notificationPreferencesController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/notification-preferences - Get user's notification preferences
router.get('/', getUserNotificationPreferences);

// PUT /api/notification-preferences - Update single notification preference
router.put('/', updateNotificationPreference);

// PUT /api/notification-preferences/batch - Update multiple notification preferences
router.put('/batch', updateMultiplePreferences);

// POST /api/notification-preferences/reset - Reset preferences to defaults
router.post('/reset', resetPreferencesToDefaults);

export default router;

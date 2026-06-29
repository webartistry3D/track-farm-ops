import { Request, Response } from 'express';
import { NotificationType } from '@prisma/client';

// NOTE: The NotificationPreference model is not yet in schema.prisma.
// Until it is added and migrated, all preference endpoints return in-memory
// defaults (all notifications enabled). No data is persisted.

const buildDefaultPreferences = (
  userId: number,
  organizationId: number
) =>
  Object.values(NotificationType).map(type => ({
    userId,
    organizationId,
    notificationType: type,
    enabled: true,
    emailEnabled: false,
    pushEnabled: true,
  }));

// Get user's notification preferences
export const getUserNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = buildDefaultPreferences(userId, organizationId);
    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

// Update notification preference
export const updateNotificationPreference = async (req: Request, res: Response) => {
  try {
    const { notificationType, enabled, emailEnabled, pushEnabled } = req.body;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!Object.values(NotificationType).includes(notificationType)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const preference = {
      userId,
      organizationId,
      notificationType,
      enabled: enabled !== undefined ? enabled : true,
      emailEnabled: emailEnabled !== undefined ? emailEnabled : false,
      pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
    };

    res.json({ preference });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    res.status(500).json({ error: 'Failed to update notification preference' });
  }
};

// Update multiple notification preferences
export const updateMultiplePreferences = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences must be an array' });
    }

    for (const pref of preferences) {
      if (!Object.values(NotificationType).includes(pref.notificationType)) {
        return res.status(400).json({ error: `Invalid notification type: ${pref.notificationType}` });
      }
    }

    const results = preferences.map((pref: any) => ({
      userId,
      organizationId,
      notificationType: pref.notificationType,
      enabled: pref.enabled !== undefined ? pref.enabled : true,
      emailEnabled: pref.emailEnabled !== undefined ? pref.emailEnabled : false,
      pushEnabled: pref.pushEnabled !== undefined ? pref.pushEnabled : true,
    }));

    res.json({ preferences: results });
  } catch (error) {
    console.error('Error updating multiple notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Reset preferences to defaults
export const resetPreferencesToDefaults = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = buildDefaultPreferences(userId, organizationId);

    res.json({
      message: 'Preferences reset to defaults',
      preferences,
    });
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    res.status(500).json({ error: 'Failed to reset notification preferences' });
  }
};

// Check if notification type is enabled for user
export const isNotificationEnabled = async (
  userId: number,
  organizationId: number,
  notificationType: NotificationType
): Promise<boolean> => {
  return true; // Default to enabled until NotificationPreference model is added to schema
};

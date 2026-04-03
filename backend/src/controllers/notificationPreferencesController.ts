import { Request, Response } from 'express';
import { PrismaClient, NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import '../types/express';

// Get user's notification preferences
export const getUserNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        userId,
        organizationId,
      },
      orderBy: {
        notificationType: 'asc',
      },
    });

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

    const preference = await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
      update: {
        enabled: enabled !== undefined ? enabled : undefined,
        emailEnabled: emailEnabled !== undefined ? emailEnabled : undefined,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        organizationId,
        notificationType,
        enabled: enabled !== undefined ? enabled : true,
        emailEnabled: emailEnabled !== undefined ? emailEnabled : false,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
      },
    });

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

    const updatePromises = preferences.map(async (pref: any) => {
      if (!Object.values(NotificationType).includes(pref.notificationType)) {
        throw new Error(`Invalid notification type: ${pref.notificationType}`);
      }

      return prisma.notificationPreference.upsert({
        where: {
          userId_notificationType: {
            userId,
            notificationType: pref.notificationType,
          },
        },
        update: {
          enabled: pref.enabled !== undefined ? pref.enabled : undefined,
          emailEnabled: pref.emailEnabled !== undefined ? pref.emailEnabled : undefined,
          pushEnabled: pref.pushEnabled !== undefined ? pref.pushEnabled : undefined,
          updatedAt: new Date(),
        },
        create: {
          userId,
          organizationId,
          notificationType: pref.notificationType,
          enabled: pref.enabled !== undefined ? pref.enabled : true,
          emailEnabled: pref.emailEnabled !== undefined ? pref.emailEnabled : false,
          pushEnabled: pref.pushEnabled !== undefined ? pref.pushEnabled : true,
        },
      });
    });

    const results = await Promise.all(updatePromises);

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

    // Delete existing preferences
    await prisma.notificationPreference.deleteMany({
      where: {
        userId,
        organizationId,
      },
    });

    // Create default preferences
    const defaultPreferences = Object.values(NotificationType).map(type => ({
      userId,
      organizationId,
      notificationType: type,
      enabled: true,
      emailEnabled: false,
      pushEnabled: true,
    }));

    const results = await prisma.notificationPreference.createMany({
      data: defaultPreferences,
    });

    res.json({ 
      message: 'Preferences reset to defaults',
      preferences: results 
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
  try {
    const preference = await prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
    });

    // If no preference exists, default to enabled
    return preference ? preference.enabled : true;
  } catch (error) {
    console.error('Error checking notification preference:', error);
    return true; // Default to enabled on error
  }
};

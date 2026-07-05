import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// Get user's notification preferences
export const getUserNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let preference = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Create default preferences if not exists
    if (!preference) {
      preference = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    // Return in frontend format
    const preferences = {
      emailNotifications: preference.emailNotifications,
      lowStockAlerts: preference.lowStockAlerts,
      dailyReports: preference.dailyReports,
      weeklyReports: preference.weeklyReports
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { emailNotifications, lowStockAlerts, dailyReports, weeklyReports } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Upsert preferences
    const preference = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        lowStockAlerts: lowStockAlerts !== undefined ? lowStockAlerts : undefined,
        dailyReports: dailyReports !== undefined ? dailyReports : undefined,
        weeklyReports: weeklyReports !== undefined ? weeklyReports : undefined
      },
      create: {
        userId,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : false,
        lowStockAlerts: lowStockAlerts !== undefined ? lowStockAlerts : true,
        dailyReports: dailyReports !== undefined ? dailyReports : false,
        weeklyReports: weeklyReports !== undefined ? weeklyReports : false
      }
    });

    const preferences = {
      emailNotifications: preference.emailNotifications,
      lowStockAlerts: preference.lowStockAlerts,
      dailyReports: preference.dailyReports,
      weeklyReports: preference.weeklyReports
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Check if a specific preference is enabled
export const isPreferenceEnabled = async (
  userId: number,
  preferenceKey: 'emailNotifications' | 'lowStockAlerts' | 'dailyReports' | 'weeklyReports'
): Promise<boolean> => {
  try {
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      // Default values for new users
      const defaults = {
        emailNotifications: false,
        lowStockAlerts: true,
        dailyReports: false,
        weeklyReports: false
      };
      return defaults[preferenceKey];
    }

    return preference[preferenceKey];
  } catch (error) {
    console.error('Error checking preference:', error);
    return true; // Default to enabled on error
  }
};

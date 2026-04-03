import { api } from '../lib/api';

export interface NotificationPreference {
  id: number;
  userId: number;
  organizationId: number;
  notificationType: string;
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

// Get user's notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferencesResponse> => {
  const response = await api.get('/notification-preferences');
  return response.data;
};

// Update single notification preference
export const updateNotificationPreference = async (
  notificationType: string,
  preferences: Partial<{
    enabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
  }>
): Promise<NotificationPreference> => {
  const response = await api.put('/notification-preferences', {
    notificationType,
    ...preferences
  });
  return response.data;
};

// Update multiple notification preferences
export const updateMultiplePreferences = async (
  preferences: Array<{
    notificationType: string;
    enabled?: boolean;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
  }>
): Promise<NotificationPreferencesResponse> => {
  const response = await api.put('/notification-preferences/batch', { preferences });
  return response.data;
};

// Reset preferences to defaults
export const resetPreferencesToDefaults = async (): Promise<NotificationPreferencesResponse> => {
  const response = await api.post('/notification-preferences/reset');
  return response.data;
};

// Default notification preferences for all types
export const getDefaultPreferences = () => {
  const notificationTypes = [
    'LOW_STOCK',
    'HIGH_STOCK',
    'EXPIRY_WARNING',
    'INCOME_RECORDED',
    'EXPENSE_RECORDED',
    'BUDGET_ALERT',
    'SYSTEM_UPDATE',
    'SECURITY_ALERT',
    'MAINTENANCE_DUE',
    'CAMERA_OFFLINE',
    'MOTION_DETECTED',
    'SUBSCRIPTION_EXPIRING',
    'PAYMENT_RECEIVED',
    'INVOICE_OVERDUE',
    'ASSET_MAINTENANCE',
    'WEATHER_ALERT',
    'PRICE_ALERT',
    'USER_INVITED',
    'ROLE_CHANGED',
    'BACKUP_COMPLETED',
    'SYNC_COMPLETED'
  ];

  return notificationTypes.map(type => ({
    notificationType: type,
    enabled: true,
    emailEnabled: false,
    pushEnabled: true
  }));
};

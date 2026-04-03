import { api } from '../lib/api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  actionUrl?: string;
  expiresAt?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// Real-time notification service
class NotificationRealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const token = localStorage.getItem('trackfarmops_token');
    if (!token) {
      console.warn('No auth token found for SSE connection');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/notifications/stream`;
    // Note: EventSource doesn't support custom headers in all browsers
    // Token will be sent via cookies or query parameter in production
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private handleMessage(data: any): void {
    const { type, data: messageData } = data;
    
    // Notify all listeners for this message type
    const listeners = this.listeners.get(type) || [];
    listeners.forEach((listener: (data: any) => void) => {
      try {
        listener(messageData);
      } catch (error) {
        console.error('Error in SSE listener:', error);
      }
    });

    // Also notify general message listeners
    const generalListeners = this.listeners.get('*') || [];
    generalListeners.forEach((listener: (data: any) => void) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in SSE general listener:', error);
      }
    });
  }

  // Subscribe to specific message types
  subscribe(type: string, callback: (data: any) => void): () => void {
    const currentListeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...currentListeners, callback]);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          const updatedListeners = [...listeners];
          updatedListeners.splice(index, 1);
          this.listeners.set(type, updatedListeners);
        }
      }
    };
  }
}

export const notificationRealtime = new NotificationRealtimeService();

// Get all notifications for current user
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Promise<NotificationResponse> => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

// Get paginated notifications with advanced filtering
export const getFilteredNotifications = async (filters: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  types?: string[];
  priorities?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}): Promise<NotificationResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.unreadOnly) params.append('unreadOnly', 'true');
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  
  // Add multiple types
  if (filters.types && filters.types.length > 0) {
    filters.types.forEach(type => params.append('type', type));
  }
  
  // Add multiple priorities
  if (filters.priorities && filters.priorities.length > 0) {
    filters.priorities.forEach(priority => params.append('priority', priority));
  }

  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

// Search notifications
export const searchNotifications = async (
  query: string,
  options?: {
    page?: number;
    limit?: number;
    types?: string[];
    priorities?: string[];
  }
): Promise<NotificationResponse> => {
  return getFilteredNotifications({
    ...options,
    search: query
  });
};

// Get notifications by type
export const getNotificationsByType = async (
  type: string,
  options?: {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<NotificationResponse> => {
  return getFilteredNotifications({
    ...options,
    types: [type]
  });
};

// Get notifications by priority
export const getNotificationsByPriority = async (
  priority: string,
  options?: {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<NotificationResponse> => {
  return getFilteredNotifications({
    ...options,
    priorities: [priority]
  });
};

// Get notifications within date range
export const getNotificationsByDateRange = async (
  dateFrom: string,
  dateTo: string,
  options?: {
    page?: number;
    limit?: number;
    types?: string[];
  }
): Promise<NotificationResponse> => {
  return getFilteredNotifications({
    ...options,
    dateFrom,
    dateTo
  });
};

// Infinite scroll pagination
export const getMoreNotifications = async (
  lastNotificationId: number,
  limit: number = 20
): Promise<NotificationResponse> => {
  const response = await api.get('/notifications', {
    params: {
      lastId: lastNotificationId,
      limit,
      infinite: true
    }
  });
  return response.data;
};

// Get notification statistics
export const getNotificationStats = async (): Promise<NotificationStats> => {
  const response = await api.get('/notifications/stats');
  return response.data;
};

// Mark a notification as read
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ count: number }> => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

// Format notification time for display
export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Get notification icon based on type
export const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    LOW_STOCK: '📉',
    HIGH_STOCK: '📈',
    EXPIRY_WARNING: '⏰',
    INCOME_RECORDED: '💰',
    EXPENSE_RECORDED: '💳',
    BUDGET_ALERT: '📊',
    SYSTEM_UPDATE: '🔄',
    SECURITY_ALERT: '🔒',
    MAINTENANCE_DUE: '🔧',
    CAMERA_OFFLINE: '📹',
    MOTION_DETECTED: '🚨',
    SUBSCRIPTION_EXPIRING: '⏳',
    PAYMENT_RECEIVED: '✅',
    INVOICE_OVERDUE: '📄',
    ASSET_MAINTENANCE: '🚜',
    WEATHER_ALERT: '🌤️',
    PRICE_ALERT: '💹',
    USER_INVITED: '👤',
    ROLE_CHANGED: '🔄',
    BACKUP_COMPLETED: '💾',
    SYNC_COMPLETED: '🔄',
  };

  return iconMap[type] || '📢';
};

// Get notification color based on priority
export const getNotificationColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    LOW: 'text-gray-600',
    MEDIUM: 'text-blue-600',
    HIGH: 'text-orange-600',
    URGENT: 'text-red-600',
  };

  return colorMap[priority] || 'text-gray-600';
};

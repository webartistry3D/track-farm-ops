import { PrismaClient, NotificationType, NotificationPriority, UserRole } from '@prisma/client';
import { createNotification } from '../controllers/notificationController';

const prisma = new PrismaClient();

export interface NotificationTemplate {
  title: string;
  message: string;
  priority: NotificationPriority;
}

export class NotificationService {
  // Notification templates for different types
  private static templates: Record<NotificationType, (data: any) => NotificationTemplate> = {
    [NotificationType.LOW_STOCK]: (data) => ({
      title: 'Low Stock Alert',
      message: `${data.itemName} is running low. Current stock: ${data.currentQuantity} ${data.unit}`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.HIGH_STOCK]: (data) => ({
      title: 'High Stock Alert',
      message: `${data.itemName} stock is above optimal level. Current: ${data.currentQuantity} ${data.unit}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.EXPIRY_WARNING]: (data) => ({
      title: 'Expiry Warning',
      message: `${data.itemName} expires on ${data.expiryDate}`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.INCOME_RECORDED]: (data) => ({
      title: 'New Income Recorded',
      message: `₦${data.amount} from ${data.category}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.EXPENSE_RECORDED]: (data) => ({
      title: 'New Expense Recorded',
      message: `₦${data.amount} for ${data.category}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.BUDGET_ALERT]: (data) => ({
      title: 'Budget Alert',
      message: `${data.category} expenses have reached ${data.percentage}% of budget`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.SYSTEM_UPDATE]: (data) => ({
      title: 'System Update',
      message: `${data.message}`,
      priority: NotificationPriority.LOW
    }),
    [NotificationType.SECURITY_ALERT]: (data) => ({
      title: 'Security Alert',
      message: `${data.message}`,
      priority: NotificationPriority.URGENT
    }),
    [NotificationType.MAINTENANCE_DUE]: (data) => ({
      title: 'Maintenance Due',
      message: `${data.assetName} requires maintenance on ${data.dueDate}`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.CAMERA_OFFLINE]: (data) => ({
      title: 'Camera Offline',
      message: `${data.cameraName} is offline`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.MOTION_DETECTED]: (data) => ({
      title: 'Motion Detected',
      message: `Motion detected by ${data.cameraName}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.SUBSCRIPTION_EXPIRING]: (data) => ({
      title: 'Subscription Expiring',
      message: `Your ${data.plan} subscription expires in ${data.daysRemaining} days`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.PAYMENT_RECEIVED]: (data) => ({
      title: 'Payment Received',
      message: `₦${data.amount} payment received from ${data.source}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.INVOICE_OVERDUE]: (data) => ({
      title: 'Invoice Overdue',
      message: `Invoice ${data.invoiceNumber} is overdue by ${data.daysOverdue} days`,
      priority: NotificationPriority.HIGH
    }),
    [NotificationType.ASSET_MAINTENANCE]: (data) => ({
      title: 'Asset Maintenance',
      message: `${data.assetName} maintenance completed`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.WEATHER_ALERT]: (data) => ({
      title: 'Weather Alert',
      message: `${data.alertType}: ${data.description}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.PRICE_ALERT]: (data) => ({
      title: 'Price Alert',
      message: `${data.itemName} price changed to ₦${data.newPrice}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.USER_INVITED]: (data) => ({
      title: 'User Invited',
      message: `${data.invitedUserName} has been invited to join your organization`,
      priority: NotificationPriority.LOW
    }),
    [NotificationType.ROLE_CHANGED]: (data) => ({
      title: 'Role Changed',
      message: `Your role has been changed to ${data.newRole}`,
      priority: NotificationPriority.MEDIUM
    }),
    [NotificationType.BACKUP_COMPLETED]: (data) => ({
      title: 'Backup Completed',
      message: `System backup completed successfully`,
      priority: NotificationPriority.LOW
    }),
    [NotificationType.SYNC_COMPLETED]: (data) => ({
      title: 'Sync Completed',
      message: `Data synchronization completed`,
      priority: NotificationPriority.LOW
    })
  };

  // Create notification for a specific user
  static async createUserNotification(
    userId: number,
    organizationId: number,
    type: NotificationType,
    data: any,
    actionUrl?: string
  ) {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const { title, message, priority } = template(data);
    
    return await createNotification(
      userId,
      organizationId,
      title,
      message,
      type,
      priority,
      data,
      actionUrl
    );
  }

  // Create notification for all users in an organization
  static async createOrganizationNotification(
    organizationId: number,
    type: NotificationType,
    data: any,
    actionUrl?: string
  ) {
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true }
    });

    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const { title, message, priority } = template(data);
    
    const notifications = await Promise.all(
      users.map(user => 
        createNotification(
          user.id,
          organizationId,
          title,
          message,
          type,
          priority,
          data,
          actionUrl
        )
      )
    );

    return notifications;
  }

  // Create notification for users with specific roles
  static async createRoleBasedNotification(
    organizationId: number,
    roles: UserRole[],
    type: NotificationType,
    data: any,
    actionUrl?: string
  ) {
    const users = await prisma.user.findMany({
      where: { 
        organizationId,
        role: { in: roles }
      },
      select: { id: true }
    });

    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const { title, message, priority } = template(data);
    
    const notifications = await Promise.all(
      users.map(user => 
        createNotification(
          user.id,
          organizationId,
          title,
          message,
          type,
          priority,
          data,
          actionUrl
        )
      )
    );

    return notifications;
  }

  // Helper methods for common notification types
  static async notifyLowStock(
    userId: number,
    organizationId: number,
    itemName: string,
    currentQuantity: number,
    unit: string
  ) {
    return this.createUserNotification(
      userId,
      organizationId,
      NotificationType.LOW_STOCK,
      { itemName, currentQuantity, unit }
    );
  }

  static async notifyIncomeRecorded(
    userId: number,
    organizationId: number,
    amount: number,
    category: string
  ) {
    return this.createUserNotification(
      userId,
      organizationId,
      NotificationType.INCOME_RECORDED,
      { amount, category }
    );
  }

  static async notifyExpenseRecorded(
    userId: number,
    organizationId: number,
    amount: number,
    category: string
  ) {
    return this.createUserNotification(
      userId,
      organizationId,
      NotificationType.EXPENSE_RECORDED,
      { amount, category }
    );
  }

  static async notifySystemUpdate(
    organizationId: number,
    message: string
  ) {
    return this.createOrganizationNotification(
      organizationId,
      NotificationType.SYSTEM_UPDATE,
      { message }
    );
  }

  static async notifySecurityAlert(
    organizationId: number,
    message: string
  ) {
    return this.createOrganizationNotification(
      organizationId,
      NotificationType.SECURITY_ALERT,
      { message }
    );
  }

  static async notifySubscriptionExpiring(
    userId: number,
    organizationId: number,
    plan: string,
    daysRemaining: number
  ) {
    return this.createUserNotification(
      userId,
      organizationId,
      NotificationType.SUBSCRIPTION_EXPIRING,
      { plan, daysRemaining }
    );
  }

  // Cleanup old notifications (call this periodically)
  static async cleanupOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true
      }
    });

    return result.count;
  }
}

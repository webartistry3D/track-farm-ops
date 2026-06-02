import { prisma } from '../lib/prisma';

/**
 * Notification types for different activities
 */
export enum NotificationActivityType {
  INCOME_CREATED = 'INCOME_CREATED',
  INCOME_UPDATED = 'INCOME_UPDATED',
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  INVENTORY_CREATED = 'INVENTORY_CREATED',
  INVENTORY_UPDATED = 'INVENTORY_UPDATED',
  ASSET_CREATED = 'ASSET_CREATED',
  ASSET_UPDATED = 'ASSET_UPDATED',
  LIVESTOCK_CREATED = 'LIVESTOCK_CREATED',
  LIVESTOCK_UPDATED = 'LIVESTOCK_UPDATED',
  HEALTH_RECORD_CREATED = 'HEALTH_RECORD_CREATED',
  VACCINATION_CREATED = 'VACCINATION_CREATED',
}

/**
 * Create a notification for specific recipients based on activity
 * @param activityType - Type of activity that triggered the notification
 * @param actorId - ID of the user who performed the action
 * @param organizationId - ID of the organization
 * @param details - Additional details about the activity
 */
export async function createActivityNotification(
  activityType: NotificationActivityType,
  actorId: number,
  organizationId: number,
  details: {
    title: string;
    message: string;
    relatedEntity?: string;
    relatedEntityId?: number;
    metadata?: any;
  }
) {
  try {
    // Get the actor (user who performed the action)
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, role: true }
    });

    if (!actor) {
      console.error('Actor not found for notification');
      return;
    }

    // Determine recipients based on actor's role
    let recipientIds: number[] = [];

    if (actor.role === 'WORKER') {
      // Worker actions: Notify all managers, owner, veterinarian, and inventory manager
      const managersAndOwner = await prisma.user.findMany({
        where: {
          organizationId,
          role: { in: ['MANAGER', 'OWNER', 'VETERINARIAN', 'INVENTORY'] }
        },
        select: { id: true }
      });
      recipientIds = managersAndOwner.map(u => u.id);
    } else if (actor.role === 'MANAGER') {
      // Manager actions: Notify owner, veterinarian, and inventory manager
      const ownerAndSpecialists = await prisma.user.findMany({
        where: {
          organizationId,
          role: { in: ['OWNER', 'VETERINARIAN', 'INVENTORY'] }
        },
        select: { id: true }
      });
      recipientIds = ownerAndSpecialists.map(u => u.id);
    } else if (actor.role === 'VETERINARIAN') {
      // Veterinarian actions: Notify owner and manager
      const ownerAndManager = await prisma.user.findMany({
        where: {
          organizationId,
          role: { in: ['OWNER', 'MANAGER'] }
        },
        select: { id: true }
      });
      recipientIds = ownerAndManager.map(u => u.id);
    } else if (actor.role === 'INVENTORY') {
      // Inventory manager actions: Notify owner and manager
      const ownerAndManager = await prisma.user.findMany({
        where: {
          organizationId,
          role: { in: ['OWNER', 'MANAGER'] }
        },
        select: { id: true }
      });
      recipientIds = ownerAndManager.map(u => u.id);
    } else if (actor.role === 'OWNER') {
      // Owner actions: No notifications needed (owner is the top level)
      return;
    }

    // Create notifications for all recipients
    const notificationType = mapActivityToNotificationType(activityType);
    
    const notifications = await prisma.notification.createMany({
      data: recipientIds.map(recipientId => ({
        title: details.title,
        message: details.message,
        type: notificationType as any,
        userId: recipientId,
        organizationId,
        relatedEntity: details.relatedEntity,
        relatedEntityId: details.relatedEntityId,
        metadata: {
          ...details.metadata,
          actorName: actor.name,
          actorRole: actor.role,
          activityType
        }
      }))
    });

    console.log(`✅ Created ${notifications.count} notifications for ${activityType}`);
    return notifications;
  } catch (error) {
    console.error('Error creating activity notification:', error);
  }
}

/**
 * Map activity type to notification type enum
 */
function mapActivityToNotificationType(activityType: NotificationActivityType): string {
  switch (activityType) {
    case NotificationActivityType.INCOME_CREATED:
    case NotificationActivityType.INCOME_UPDATED:
      return 'INCOME_RECORDED';
    case NotificationActivityType.EXPENSE_CREATED:
    case NotificationActivityType.EXPENSE_UPDATED:
      return 'EXPENSE_RECORDED';
    case NotificationActivityType.INVENTORY_CREATED:
    case NotificationActivityType.INVENTORY_UPDATED:
      return 'LOW_STOCK';
    case NotificationActivityType.ASSET_CREATED:
    case NotificationActivityType.ASSET_UPDATED:
      return 'INFO';
    case NotificationActivityType.LIVESTOCK_CREATED:
    case NotificationActivityType.LIVESTOCK_UPDATED:
    case NotificationActivityType.HEALTH_RECORD_CREATED:
    case NotificationActivityType.VACCINATION_CREATED:
      return 'INFO';
    default:
      return 'INFO';
  }
}

/**
 * Format notification message based on activity
 */
export function formatNotificationMessage(
  activityType: NotificationActivityType,
  actorName: string,
  entityName: string,
  amount?: string
): string {
  const action = activityType.includes('CREATED') ? 'created' : 'updated';
  
  switch (activityType) {
    case NotificationActivityType.INCOME_CREATED:
      return `${actorName} recorded new income: ${amount || 'N/A'} for ${entityName}`;
    case NotificationActivityType.INCOME_UPDATED:
      return `${actorName} updated income record for ${entityName}`;
    case NotificationActivityType.EXPENSE_CREATED:
      return `${actorName} recorded new expense: ${amount || 'N/A'} for ${entityName}`;
    case NotificationActivityType.EXPENSE_UPDATED:
      return `${actorName} updated expense record for ${entityName}`;
    case NotificationActivityType.INVENTORY_CREATED:
      return `${actorName} added new inventory item: ${entityName}`;
    case NotificationActivityType.INVENTORY_UPDATED:
      return `${actorName} updated inventory item: ${entityName}`;
    case NotificationActivityType.ASSET_CREATED:
      return `${actorName} added new asset: ${entityName}`;
    case NotificationActivityType.ASSET_UPDATED:
      return `${actorName} updated asset: ${entityName}`;
    case NotificationActivityType.LIVESTOCK_CREATED:
      return `${actorName} added new livestock: ${entityName}`;
    case NotificationActivityType.LIVESTOCK_UPDATED:
      return `${actorName} updated livestock: ${entityName}`;
    case NotificationActivityType.HEALTH_RECORD_CREATED:
      return `${actorName} created health record for ${entityName}`;
    case NotificationActivityType.VACCINATION_CREATED:
      return `${actorName} recorded vaccination for ${entityName}`;
    default:
      return `${actorName} ${action} ${entityName}`;
  }
}

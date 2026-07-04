import webPush from 'web-push';
import { Prisma, NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';

const vapidConfigured = () =>
  Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

const ensureVapid = () => {
  if (!vapidConfigured()) return false;
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@trackfarmops.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export const sendPushToUser = async (userId: number, payload: PushPayload): Promise<void> => {
  if (!ensureVapid()) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const data = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        } else {
          console.error('Push delivery failed:', err);
        }
      }
    })
  );
};

export const createAndDispatchNotification = async (data: {
  userId: number;
  organizationId?: number | null;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntity?: string;
  relatedEntityId?: number;
  metadata?: Prisma.InputJsonValue | null;
}) => {
  const notification = await prisma.notification.create({ data });

  // Fire-and-forget push dispatch
  if (vapidConfigured()) {
    sendPushToUser(notification.userId, {
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `notification-${notification.id}`,
      data: {
        notificationId: notification.id,
        relatedEntity: notification.relatedEntity,
        relatedEntityId: notification.relatedEntityId,
        url: '/notifications'
      }
    }).catch(err => console.error('Push dispatch failed:', err));
  }

  return notification;
};

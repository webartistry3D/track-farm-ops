import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import '../types/express';

interface SSEClient {
  id: string;
  userId: number;
  organizationId: number;
  response: Response;
}

class NotificationSSEService {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Add a new client for SSE
  addClient(req: Request, res: Response): string {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    
    if (!userId || !organizationId) {
      throw new Error('User not authenticated');
    }

    const clientId = `${userId}-${Date.now()}-${Math.random()}`;
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const client: SSEClient = {
      id: clientId,
      userId,
      organizationId,
      response: res
    };

    this.clients.set(clientId, client);

    // Send initial connection message
    this.sendToClient(clientId, {
      type: 'connected',
      data: { clientId, timestamp: new Date().toISOString() }
    });

    // Handle client disconnect
    req.on('close', () => {
      this.removeClient(clientId);
    });

    // Send any unread notifications on connection
    this.sendUnreadNotifications(clientId);

    return clientId;
  }

  // Remove a client
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.response.end();
      } catch (error) {
        console.error('Error ending client response:', error);
      }
      this.clients.delete(clientId);
    }
  }

  // Send message to specific client
  sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        client.response.write(message);
      } catch (error) {
        console.error('Error sending to client:', error);
        this.removeClient(clientId);
      }
    }
  }

  // Send notification to specific user
  sendToUser(userId: number, organizationId: number, notification: any): void {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.organizationId === organizationId) {
        this.sendToClient(clientId, {
          type: 'notification',
          data: notification
        });
      }
    });
  }

  // Send notification to all users in organization
  sendToOrganization(organizationId: number, notification: any): void {
    this.clients.forEach((client, clientId) => {
      if (client.organizationId === organizationId) {
        this.sendToClient(clientId, {
          type: 'notification',
          data: notification
        });
      }
    });
  }

  // Send to users with specific roles
  sendToRoles(organizationId: number, roles: string[], notification: any): void {
    // This would require checking user roles
    // For now, send to all in organization
    this.sendToOrganization(organizationId, notification);
  }

  // Send unread notifications to newly connected client
  private async sendUnreadNotifications(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          userId: client.userId,
          organizationId: client.organizationId,
          isRead: false
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (unreadNotifications.length > 0) {
        this.sendToClient(clientId, {
          type: 'unread_notifications',
          data: unreadNotifications
        });
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }

  // Start heartbeat to keep connections alive
  startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      const heartbeatMessage = {
        type: 'heartbeat',
        data: { timestamp: new Date().toISOString() }
      };

      this.clients.forEach((client, clientId) => {
        this.sendToClient(clientId, heartbeatMessage);
      });
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get client count
  getClientCount(): number {
    return this.clients.size;
  }

  // Get organization client count
  getOrganizationClientCount(organizationId: number): number {
    let count = 0;
    this.clients.forEach(client => {
      if (client.organizationId === organizationId) {
        count++;
      }
    });
    return count;
  }
}

export const notificationSSE = new NotificationSSEService();

// Start heartbeat on service initialization
notificationSSE.startHeartbeat();

// Graceful shutdown
process.on('SIGTERM', () => {
  notificationSSE.stopHeartbeat();
});

process.on('SIGINT', () => {
  notificationSSE.stopHeartbeat();
});

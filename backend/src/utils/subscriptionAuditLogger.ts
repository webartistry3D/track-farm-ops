import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export interface SubscriptionAuditLog {
  id: string;
  userId: number;
  organizationId: number;
  action: 'SUBSCRIPTION_VIEW' | 'SUBSCRIPTION_CREATE' | 'SUBSCRIPTION_UPDATE' | 'SUBSCRIPTION_CANCEL' | 'TRIAL_ACTIVATED';
  plan?: string;
  status?: string;
  billingCycle?: string;
  price?: number;
  timestamp: Date;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  responseTime?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class SubscriptionAuditLogger {
  private static logs: SubscriptionAuditLog[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs in memory

  /**
   * Log subscription access attempt
   */
  static logAccess(req: AuthRequest, action: SubscriptionAuditLog['action'], details?: Partial<SubscriptionAuditLog>): void {
    const user = req.user;
    const org = (req as any).securityContext;
    
    const log: SubscriptionAuditLog = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 0,
      organizationId: org?.organizationId || 0,
      action,
      timestamp: new Date(),
      requestId: Array.isArray(req.headers['x-request-id']) ? req.headers['x-request-id'][0] : req.headers['x-request-id'],
      userAgent: Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      responseTime: details?.responseTime,
      success: details?.success ?? true,
      error: details?.error,
      metadata: {
        ...details,
        endpoint: '/api/subscription/current',
        method: req.method,
        path: req.path,
        userAgent: Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    };

    // Add plan, status, billingCycle, price if available
    if (details?.plan) log.plan = details.plan;
    if (details?.status) log.status = details.status;
    if (details?.billingCycle) log.billingCycle = details.billingCycle;
    if (typeof details?.price === 'number') log.price = details.price;

    this.addLog(log);
    this.persistLog(log);
  }

  /**
   * Log subscription creation
   */
  static logSubscriptionCreation(req: AuthRequest, subscription: any, responseTime?: number): void {
    this.logAccess(req, 'SUBSCRIPTION_CREATE', {
      success: true,
      plan: subscription.plan,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      price: parseFloat(subscription.price),
      responseTime
    });
  }

  /**
   * Log subscription update
   */
  static logSubscriptionUpdate(req: AuthRequest, oldPlan: string, newPlan: string, responseTime?: number): void {
    this.logAccess(req, 'SUBSCRIPTION_UPDATE', {
      success: true,
      metadata: {
        oldPlan,
        newPlan
      },
      responseTime
    });
  }

  /**
   * Log subscription cancellation
   */
  static logSubscriptionCancellation(req: AuthRequest, plan: string, responseTime?: number): void {
    this.logAccess(req, 'SUBSCRIPTION_CANCEL', {
      success: true,
      plan,
      responseTime
    });
  }

  /**
   * Log trial activation
   */
  static logTrialActivation(req: AuthRequest, plan: string, responseTime?: number): void {
    this.logAccess(req, 'TRIAL_ACTIVATED', {
      success: true,
      plan,
      responseTime
    });
  }

  /**
   * Log subscription access error
   */
  static logError(req: AuthRequest, error: Error, responseTime?: number): void {
    this.logAccess(req, 'SUBSCRIPTION_VIEW', {
      success: false,
      error: error.message,
      responseTime,
      metadata: {
        stack: error.stack
      }
    });
  }

  /**
   * Add log to memory array
   */
  private static addLog(log: SubscriptionAuditLog): void {
    this.logs.unshift(log);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  /**
   * Persist log to console (in production, this would go to a database)
   */
  private static persistLog(log: SubscriptionAuditLog): void {
    const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    
    console.log(`[${logLevel.toUpperCase()}] [SUBSCRIPTION_AUDIT]`, {
      id: log.id,
      userId: log.userId,
      organizationId: log.organizationId,
      action: log.action,
      plan: log.plan,
      status: log.status,
      billingCycle: log.billingCycle,
      price: log.price,
      timestamp: log.timestamp.toISOString(),
      requestId: log.requestId,
      userAgent: log.userAgent,
      ipAddress: log.ipAddress,
      responseTime: log.responseTime,
      success: log.success,
      error: log.error,
      metadata: log.metadata
    });
  }

  /**
   * Get recent logs for monitoring
   */
  static getRecentLogs(limit: number = 50): SubscriptionAuditLog[] {
    return this.logs.slice(0, limit);
  }

  /**
   * Get logs by user ID
   */
  static getLogsByUserId(userId: number, limit: number = 50): SubscriptionAuditLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(0, limit);
  }

  /**
   * Get logs by organization ID
   */
  static getLogsByOrganizationId(organizationId: number, limit: number = 50): SubscriptionAuditLog[] {
    return this.logs
      .filter(log => log.organizationId === organizationId)
      .slice(0, limit);
  }

  /**
   * Clear logs (useful for testing)
   */
  static clearLogs(): void {
    this.logs = [];
  }
}

export default SubscriptionAuditLogger;

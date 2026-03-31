import { AuthRequest } from '../middleware/auth';
import { getSecurityContext, SecurityContext } from '../middleware/rowLevelSecurity';

/**
 * Comprehensive Audit Logging System
 * Tracks all data access attempts for security monitoring and compliance
 */

export enum AuditLogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
}

export interface AuditLogEntry {
  timestamp: Date;
  level: AuditLogLevel;
  action: AuditAction;
  resource: string;
  userId: number;
  organizationId: number;
  userRole: string;
  organizationName: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: number | string;
  details?: any;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 10000; // Keep last 10k logs in memory

  /**
   * Log a security event
   */
  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      timestamp: new Date(),
      ...entry
    };

    // Add to memory buffer
    this.logs.push(logEntry);

    // Trim if exceeds max logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with appropriate formatting
    this.outputLog(logEntry);
  }

  /**
   * Log successful data access
   */
  logAccess(
    req: AuthRequest,
    action: AuditAction,
    resource: string,
    resourceId?: number | string,
    details?: any
  ): void {
    try {
      const context = getSecurityContext(req);
      
      this.log({
        level: AuditLogLevel.INFO,
        action,
        resource,
        userId: context.userId,
        organizationId: context.organizationId,
        userRole: context.userRole,
        organizationName: context.organizationName,
        ipAddress: this.getClientIP(req),
        userAgent: req.get('User-Agent'),
        resourceId,
        details,
        success: true
      });
    } catch (error) {
      console.error('AuditLogger: Failed to log access:', error);
    }
  }

  /**
   * Log access denied event
   */
  logAccessDenied(
    req: AuthRequest,
    action: AuditAction,
    resource: string,
    reason: string,
    resourceId?: number | string,
    details?: any
  ): void {
    try {
      const context = getSecurityContext(req);
      
      this.log({
        level: AuditLogLevel.WARNING,
        action: AuditAction.ACCESS_DENIED,
        resource,
        userId: context.userId,
        organizationId: context.organizationId,
        userRole: context.userRole,
        organizationName: context.organizationName,
        ipAddress: this.getClientIP(req),
        userAgent: req.get('User-Agent'),
        resourceId,
        details: { ...details, denialReason: reason },
        success: false,
        errorMessage: reason
      });
    } catch (error) {
      console.error('AuditLogger: Failed to log access denied:', error);
    }
  }

  /**
   * Log security violation
   */
  logSecurityViolation(
    req: AuthRequest,
    resource: string,
    violation: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details?: any
  ): void {
    try {
      const context = getSecurityContext(req);
      
      this.log({
        level: severity === 'critical' ? AuditLogLevel.ERROR : AuditLogLevel.SECURITY,
        action: AuditAction.SECURITY_VIOLATION,
        resource,
        userId: context.userId,
        organizationId: context.organizationId,
        userRole: context.userRole,
        organizationName: context.organizationName,
        ipAddress: this.getClientIP(req),
        userAgent: req.get('User-Agent'),
        details: { ...details, violation, severity },
        success: false,
        errorMessage: `Security violation: ${violation}`
      });
    } catch (error) {
      console.error('AuditLogger: Failed to log security violation:', error);
    }
  }

  /**
   * Log authentication events
   */
  logAuth(
    action: 'LOGIN' | 'LOGOUT',
    userId: number,
    organizationId: number,
    userRole: string,
    organizationName: string,
    success: boolean,
    errorMessage?: string,
    req?: AuthRequest
  ): void {
    this.log({
      level: success ? AuditLogLevel.INFO : AuditLogLevel.WARNING,
      action: action === 'LOGIN' ? AuditAction.LOGIN : AuditAction.LOGOUT,
      resource: 'AUTHENTICATION',
      userId,
      organizationId,
      userRole,
      organizationName,
      ipAddress: req ? this.getClientIP(req) : undefined,
      userAgent: req ? req.get('User-Agent') : undefined,
      success,
      errorMessage
    });
  }

  /**
   * Log password change events
   */
  logPasswordChange(
    userId: number,
    organizationId: number,
    userRole: string,
    organizationName: string,
    success: boolean,
    passwordStrength?: string,
    errorMessage?: string,
    req?: AuthRequest
  ): void {
    this.log({
      level: success ? AuditLogLevel.INFO : AuditLogLevel.WARNING,
      action: AuditAction.UPDATE,
      resource: 'PASSWORD',
      userId,
      organizationId,
      userRole,
      organizationName,
      ipAddress: req ? this.getClientIP(req) : undefined,
      userAgent: req ? req.get('User-Agent') : undefined,
      details: {
        passwordStrength,
        timestamp: new Date().toISOString()
      },
      success,
      errorMessage: errorMessage || (success ? undefined : 'Password change failed')
    });
  }

  /**
   * Get recent logs for monitoring
   */
  getRecentLogs(limit: number = 100, filters?: {
    userId?: number;
    organizationId?: number;
    level?: AuditLogLevel;
    action?: AuditAction;
    resource?: string;
    since?: Date;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    // Apply filters
    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.organizationId) {
        filteredLogs = filteredLogs.filter(log => log.organizationId === filters.organizationId);
      }
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }
      if (filters.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= (filters.since as Date));
      }
    }

    // Sort by timestamp descending and limit
    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get security statistics
   */
  getSecurityStats(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): {
    totalLogs: number;
    securityViolations: number;
    accessDenied: number;
    topResources: Array<{ resource: string; count: number }>;
    topUsers: Array<{ userId: number; userRole: string; count: number }>;
  } {
    const now = new Date();
    const since = new Date();

    switch (timeframe) {
      case 'hour':
        since.setHours(now.getHours() - 1);
        break;
      case 'day':
        since.setDate(now.getDate() - 1);
        break;
      case 'week':
        since.setDate(now.getDate() - 7);
        break;
      case 'month':
        since.setMonth(now.getMonth() - 1);
        break;
    }

    const recentLogs = this.logs.filter(log => log.timestamp >= since);

    const securityViolations = recentLogs.filter(log => log.action === AuditAction.SECURITY_VIOLATION).length;
    const accessDenied = recentLogs.filter(log => log.action === AuditAction.ACCESS_DENIED).length;

    // Top resources
    const resourceCounts = recentLogs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topResources = Object.entries(resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));

    // Top users
    const userCounts = recentLogs.reduce((acc, log) => {
      const key = `${log.userId}-${log.userRole}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => {
        const [userId, userRole] = key.split('-');
        return { userId: parseInt(userId), userRole, count };
      });

    return {
      totalLogs: recentLogs.length,
      securityViolations,
      accessDenied,
      topResources,
      topUsers
    };
  }

  /**
   * Format log for console output
   */
  private outputLog(entry: AuditLogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const icon = this.getIconForLevel(entry.level);
    const status = entry.success ? '✅' : '❌';
    
    let message = `${icon} [${timestamp}] ${status} ${entry.action} ${entry.resource}`;
    message += ` | User: ${entry.userRole}(${entry.userId})`;
    message += ` | Org: ${entry.organizationName}(${entry.organizationId})`;
    
    if (entry.resourceId) {
      message += ` | ID: ${entry.resourceId}`;
    }
    
    if (entry.errorMessage) {
      message += ` | Error: ${entry.errorMessage}`;
    }

    if (entry.details && Object.keys(entry.details).length > 0) {
      message += ` | Details: ${JSON.stringify(entry.details)}`;
    }

    console.log(message);
  }

  /**
   * Get icon for log level
   */
  private getIconForLevel(level: AuditLogLevel): string {
    switch (level) {
      case AuditLogLevel.INFO:
        return '📝';
      case AuditLogLevel.WARNING:
        return '⚠️';
      case AuditLogLevel.ERROR:
        return '🚨';
      case AuditLogLevel.SECURITY:
        return '🔒';
      default:
        return '📋';
    }
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(req: AuthRequest): string {
    return (
      req.get('X-Forwarded-For') ||
      req.get('X-Real-IP') ||
      req.get('X-Client-IP') ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Export convenience functions
export const logAccess = (req: AuthRequest, action: AuditAction, resource: string, resourceId?: number | string, details?: any) => {
  auditLogger.logAccess(req, action, resource, resourceId, details);
};

export const logAccessDenied = (req: AuthRequest, action: AuditAction, resource: string, reason: string, resourceId?: number | string, details?: any) => {
  auditLogger.logAccessDenied(req, action, resource, reason, resourceId, details);
};

export const logSecurityViolation = (req: AuthRequest, resource: string, violation: string, severity?: 'low' | 'medium' | 'high' | 'critical', details?: any) => {
  auditLogger.logSecurityViolation(req, resource, violation, severity, details);
};

export const logAuth = (action: 'LOGIN' | 'LOGOUT', userId: number, organizationId: number, userRole: string, organizationName: string, success: boolean, errorMessage?: string, req?: AuthRequest) => {
  auditLogger.logAuth(action, userId, organizationId, userRole, organizationName, success, errorMessage, req);
};

export const logPasswordChange = (userId: number, organizationId: number, userRole: string, organizationName: string, success: boolean, passwordStrength?: string, errorMessage?: string, req?: AuthRequest) => {
  auditLogger.logPasswordChange(userId, organizationId, userRole, organizationName, success, passwordStrength, errorMessage, req);
};

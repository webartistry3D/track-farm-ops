import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../lib/prisma';

/**
 * Row-Level Security Middleware
 * Provides centralized organization-based access control for all API endpoints
 */

export interface SecurityContext {
  userId: number;
  organizationId: number;
  userRole: string;
  organizationName: string;
}

/**
 * Validates that the authenticated user belongs to an organization
 * This should be applied to all protected routes
 */
export const requireOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      console.log('🚫 Row-Level Security: No organization context found');
      return res.status(403).json({ 
        error: 'Organization membership required',
        code: 'NO_ORGANIZATION'
      });
    }

    // Verify organization still exists and is accessible
    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { id: true, name: true }
    });

    if (!organization) {
      console.log(`🚫 Row-Level Security: Organization ${req.user.organizationId} not found for user ${req.user.id}`);
      return res.status(403).json({ 
        error: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND'
      });
    }

    // Attach security context to request
    (req as any).securityContext = {
      userId: req.user.id,
      organizationId: req.user.organizationId,
      userRole: req.user.role,
      organizationName: organization.name
    };

    console.log(`✅ Row-Level Security: ${req.user.role} ${req.user.name} validated for organization ${organization.name}`);
    next();
  } catch (error) {
    console.error('Row-Level Security middleware error:', error);
    return res.status(500).json({ error: 'Security validation failed' });
  }
};

/**
 * Role-based access control within organizations
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const securityContext = (req as any).securityContext as SecurityContext;
    
    if (!securityContext) {
      return res.status(401).json({ error: 'Security context not found' });
    }

    if (!allowedRoles.includes(securityContext.userRole)) {
      console.log(`🚫 Row-Level Security: ${securityContext.userRole} not authorized for roles [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'ROLE_ACCESS_DENIED',
        required: allowedRoles,
        current: securityContext.userRole
      });
    }

    next();
  };
};

/**
 * Organization-aware query builder
 * Helps controllers build secure database queries
 */
export class SecureQueryBuilder {
  private context: SecurityContext;

  constructor(context: SecurityContext) {
    this.context = context;
  }

  /**
   * Get user IDs that the current user can access based on role
   */
  async getAccessibleUserIds(): Promise<number[]> {
    switch (this.context.userRole) {
      case 'OWNER':
        // Owners can access all users in their organization
        const orgUsers = await prisma.user.findMany({
          where: { organizationId: this.context.organizationId },
          select: { id: true }
        });
        return orgUsers.map(u => u.id);

      case 'MANAGER':
        // Managers can access OWNER, MANAGER, and WORKER roles
        const managerUsers = await prisma.user.findMany({
          where: { 
            organizationId: this.context.organizationId,
            role: { in: ['OWNER', 'MANAGER', 'WORKER'] }
          },
          select: { id: true }
        });
        return managerUsers.map(u => u.id);

      case 'WORKER':
        // Workers can only access their own data
        return [this.context.userId];

      default:
        return [this.context.userId];
    }
  }

  /**
   * Build organization-aware where clause
   */
  buildWhereClause(baseWhere: any = {}): any {
    return {
      ...baseWhere,
      organizationId: this.context.organizationId
    };
  }

  /**
   * Build user-aware where clause for user-specific data
   */
  async buildUserAwareWhereClause(baseWhere: any = {}): Promise<any> {
    const accessibleUserIds = await this.getAccessibleUserIds();
    
    return {
      ...baseWhere,
      organizationId: this.context.organizationId,
      userId: { in: accessibleUserIds }
    };
  }

  /**
   * Log security action for audit trail
   */
  logAction(action: string, resource: string, details?: any): void {
    console.log(`🔒 Security Action: ${action} | Resource: ${resource} | User: ${this.context.userRole} ${this.context.userId} | Organization: ${this.context.organizationName}`, details || '');
  }
}

/**
 * Helper to get security context from request
 */
export const getSecurityContext = (req: AuthRequest): SecurityContext => {
  const context = (req as any).securityContext;
  if (!context) {
    throw new Error('Security context not found. Ensure requireOrganization middleware is applied.');
  }
  return context;
};

/**
 * Helper to create secure query builder
 */
export const createSecureQueryBuilder = (req: AuthRequest): SecureQueryBuilder => {
  const context = getSecurityContext(req);
  return new SecureQueryBuilder(context);
};

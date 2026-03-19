import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
    organizationId?: number;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    
    // Validate that the user still exists and is active
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        organizationId: true
      }
    });

    if (!currentUser) {
      console.log(`🚫 Authentication failed: User ${decoded.id} no longer exists`);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Validate organization membership
    if (!currentUser.organizationId) {
      console.log(`🚫 Authentication failed: User ${decoded.id} not assigned to any organization`);
      return res.status(401).json({ 
        error: 'User must be assigned to an organization',
        code: 'NO_ORGANIZATION'
      });
    }

    // Validate organization ID matches token (prevents token manipulation)
    if (decoded.organizationId && decoded.organizationId !== currentUser.organizationId) {
      console.log(`🚫 Authentication failed: Token organizationId ${decoded.organizationId} does not match user organizationId ${currentUser.organizationId}`);
      return res.status(401).json({ 
        error: 'Invalid token: organization mismatch',
        code: 'ORGANIZATION_MISMATCH'
      });
    }

    // Get organization details for logging
    const organization = await prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
      select: { name: true }
    });

    // Update user object with current database values
    req.user = {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      name: currentUser.name,
      organizationId: currentUser.organizationId
    };

    console.log(`✅ Authentication successful: ${currentUser.role} ${currentUser.name} (Org: ${organization?.name || 'Unknown'})`);
    next();
  } catch (error) {
    console.log('🚫 Authentication failed: Invalid or expired token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`🚫 Authorization failed: User ${req.user.role} ${req.user.name} not authorized for roles [${roles.join(', ')}]`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// New middleware for organization-based access control
export const requireOrganization = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.organizationId) {
      return res.status(403).json({ 
        error: 'Organization membership required',
        code: 'NO_ORGANIZATION'
      });
    }
    next();
  };
};

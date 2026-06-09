import { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import type { UserRole } from '../config/navigationConfig';

interface PermissionGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  feature?: string;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

const PermissionGuard = ({
  children,
  allowedRoles,
  feature,
  fallback = null,
  requireAuth = true,
}: PermissionGuardProps) => {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscriptionRestrictions();

  // Check authentication
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (allowedRoles && user) {
    const userRole = user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  // Check subscription-based feature access
  if (feature && user) {
    if (!canAccessFeature(feature as any)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;

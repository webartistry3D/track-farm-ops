import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredFeature?: 'inventoryTransactions' | 'analytics' | 'financialReports' | 'ownerDashboard';
  requiredRole?: 'SUPERUSER' | 'OWNER' | 'MANAGER' | 'WORKER' | 'ACCOUNTANT' | 'INVENTORY' | 'VETERINARIAN';
  fallbackPath?: string;
}

const SubscriptionGuard = ({ 
  children, 
  requiredFeature, 
  requiredRole,
  fallbackPath = '/dashboard' 
}: SubscriptionGuardProps) => {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscriptionRestrictions();
  const location = useLocation();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check feature access requirements
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;

import { type ReactNode } from 'react';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import UpgradePrompt from './UpgradePrompt';

interface FeatureWrapperProps {
  feature: 'incomeTracking' | 'expenseTracking' | 'inventoryTransactions' | 'ownerDashboard' | 'financialReports' | 'analytics' | 'auditLogs' | 'dataExport' | 'prioritySupport';
  level?: 'basic' | 'full' | 'advanced';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
  compactPrompt?: boolean;
}

const FeatureWrapper = ({ 
  feature, 
  level = 'basic', 
  children, 
  fallback, 
  showUpgradePrompt = true,
  upgradeMessage,
  compactPrompt = false
}: FeatureWrapperProps) => {
  const { 
    canAccessFeature, 
    canAccessBasicFeature, 
    shouldShowUpgradePrompt 
  } = useSubscriptionRestrictions();

  // Check if user has access to this feature at the required level
  const hasAccess = level === 'basic' 
    ? canAccessBasicFeature(feature)
    : canAccessFeature(feature);

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If upgrade prompt should be shown, render it
  if (showUpgradePrompt && shouldShowUpgradePrompt(feature)) {
    return (
      <UpgradePrompt 
        feature={feature} 
        message={upgradeMessage}
        compact={compactPrompt}
      />
    );
  }

  // Default: render nothing
  return null;
};

export default FeatureWrapper;

import { Link } from 'react-router-dom';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';

interface UpgradePromptProps {
  feature: 'incomeTracking' | 'expenseTracking' | 'inventoryTransactions' | 'ownerDashboard' | 'financialReports' | 'analytics' | 'auditLogs' | 'dataExport' | 'prioritySupport';
  message?: string;
  compact?: boolean;
}

const UpgradePrompt = ({ feature, message, compact = false }: UpgradePromptProps) => {
  const { getUpgradeMessage } = useSubscriptionRestrictions();

  if (compact) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-center">
          <span className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {message || getUpgradeMessage(feature)}
            </p>
          </div>
          <Link
            to="/pricing"
            className="ml-3 px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Premium Feature
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            {message || getUpgradeMessage(feature)}
          </p>
          <div className="flex items-center space-x-4">
            <Link
              to="/pricing"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              View Pricing Plans
            </Link>
            <Link
              to="/settings?tab=subscription"
              className="px-4 py-2 border border-yellow-600 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors font-medium"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;

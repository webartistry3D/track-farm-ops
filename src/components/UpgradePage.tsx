import { Link } from 'react-router-dom';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';

interface UpgradePageProps {
  feature: 'inventoryTransactions' | 'analytics' | 'financialReports' | 'ownerDashboard';
  title: string;
  description: string;
  icon: string;
}

const UpgradePage = ({ feature, title, description, icon }: UpgradePageProps) => {
  const { getUpgradeMessage, getCurrentPlan } = useSubscriptionRestrictions();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {description}
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 dark:text-yellow-400 mr-2">🔒</span>
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Premium Feature
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {getUpgradeMessage(feature)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/pricing"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
            >
              View Pricing Plans
            </Link>
            <Link
              to="/dashboard"
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center block"
            >
              Back to Dashboard
            </Link>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Current plan: <span className="font-medium">{getCurrentPlan()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;

import { Link } from 'react-router-dom';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';

interface RestrictedPageMessageProps {
  feature: 'inventoryTransactions' | 'analytics' | 'financialReports' | 'ownerDashboard';
  title: string;
  description: string;
  icon: string;
}

const RestrictedPageMessage = ({ feature, title, description, icon }: RestrictedPageMessageProps) => {
  const { getUpgradeMessage, getCurrentPlan } = useSubscriptionRestrictions();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-2">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{icon}</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🔒</span>
              </div>
              <div className="ml-2 flex-1 text-left">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Premium Feature
                </h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {getUpgradeMessage(feature)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <Link
              to="/pricing"
              className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center flex items-center justify-center text-sm"
            >
              <span className="mr-1">💎</span>
              Upgrade Now
            </Link>
            <Link
              to="/dashboard"
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center flex items-center justify-center text-sm"
            >
              <span className="mr-1">🏠</span>
              Back to Dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <Link
              to="/pricing"
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-xs"
            >
              View Pricing Plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestrictedPageMessage;

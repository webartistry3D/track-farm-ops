import { useEffect, useState } from 'react';

interface InactivityWarningProps {
  onLogout: () => void; // Called when user is logged out due to inactivity
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({ 
  onLogout
}) => {
  const [showLoggedOutModal, setShowLoggedOutModal] = useState(false);

  const showLoggedOutMessage = () => {
    setShowLoggedOutModal(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowLoggedOutModal(false);
    }, 5000);
  };

  const hide = () => {
    setShowLoggedOutModal(false);
  };

  // Expose methods to parent
  useEffect(() => {
    // Store methods in window for parent component access
    (window as any).inactivityWarning = { 
      show: showLoggedOutMessage, 
      hide 
    };
    
    return () => {
      delete (window as any).inactivityWarning;
    };
  }, []);

  if (!showLoggedOutModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            You Have Been Logged Out
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have been automatically logged out due to 15 minutes of inactivity for security reasons.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please sign in again to continue using the application.
          </p>
          
          <div className="mt-6">
            <button
              onClick={() => {
                hide();
                onLogout();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

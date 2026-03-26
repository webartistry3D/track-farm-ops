import { useEffect, useState } from 'react';

interface InactivityWarningProps {
  onWarning: () => void;
  warningTime: number; // Time in milliseconds before logout
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({ 
  onWarning, 
  warningTime = 2 * 60 * 1000 // 2 minutes before logout
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(warningTime);

  useEffect(() => {
    let interval: number | null = null;

    if (showWarning) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) { // Less than 1 second remaining
            onWarning();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showWarning, onWarning]);

  const show = () => {
    setShowWarning(true);
    setTimeRemaining(warningTime);
  };

  const hide = () => {
    setShowWarning(false);
  };

  // Expose methods to parent
  useEffect(() => {
    // Store methods in window for parent component access
    (window as any).inactivityWarning = { show, hide };
    
    return () => {
      delete (window as any).inactivityWarning;
    };
  }, []);

  if (!showWarning) return null;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Session Expiring Soon
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You've been inactive for a while. Your session will expire in{" "}
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              {formatTime(timeRemaining)}
            </span>
            {" "}for security reasons.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                hide();
                // Trigger user activity to reset timer
                window.dispatchEvent(new Event('user-activity'));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Keep Me Signed In
            </button>
            
            <button
              onClick={() => {
                hide();
                onWarning();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

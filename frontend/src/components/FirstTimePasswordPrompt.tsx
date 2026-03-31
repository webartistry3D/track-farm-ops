import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, X, CheckCircle } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';

interface FirstTimePasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    requiresPasswordChange?: boolean;
    passwordChangeCount?: number;
  };
  onSuccess?: () => void;
}

const FirstTimePasswordPrompt: React.FC<FirstTimePasswordPromptProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Check if this is truly a first-time login scenario
  const isFirstTimeLogin = !user.passwordChangeCount || user.passwordChangeCount === 0;
  const requiresPasswordChange = user.requiresPasswordChange || isFirstTimeLogin;
  
  // Only show modal for manager and worker roles (not for owners or superusers)
  // Owners and superusers typically have different password management workflows
  const shouldShowModal = requiresPasswordChange && 
    (user.role === 'manager' || user.role === 'worker');

  useEffect(() => {
    if (!isOpen) {
      setIsDismissed(false);
      setPasswordChanged(false);
    }
  }, [isOpen]);

  const handlePasswordChangeSuccess = () => {
    setPasswordChanged(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1500);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getPromptTitle = () => {
    if (passwordChanged) return 'Password Updated Successfully!';
    if (isFirstTimeLogin) return 'Welcome! Set Your Password';
    if (requiresPasswordChange) return 'Password Change Required';
    return 'Update Your Password';
  };

  const getPromptMessage = () => {
    if (passwordChanged) {
      return 'Your password has been updated successfully. You can now continue using the application.';
    }
    if (isFirstTimeLogin) {
      return `Hi ${user.name}! This appears to be your first time logging in. For security reasons, please set a new password that only you know.`;
    }
    if (requiresPasswordChange) {
      return 'For your security, you need to update your password. Please choose a strong, unique password that you haven\'t used before.';
    }
    return 'It\'s recommended to update your password regularly to keep your account secure.';
  };

  const getPromptSeverity = () => {
    if (isFirstTimeLogin || requiresPasswordChange) return 'warning';
    return 'info';
  };

  if (!isOpen || isDismissed || !shouldShowModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-4 border-b ${
          passwordChanged 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : getPromptSeverity() === 'warning'
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-full ${
                passwordChanged
                  ? 'bg-green-100 dark:bg-green-900/50'
                  : getPromptSeverity() === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-900/50'
                    : 'bg-blue-100 dark:bg-blue-900/50'
              }`}>
                {passwordChanged ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getPromptTitle()}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getPromptMessage()}
                </p>
              </div>
            </div>
            <button
              onClick={passwordChanged ? onClose : handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {passwordChanged ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                Your account is now secure!
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You can continue using all features of the application.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <PasswordChangeForm
              onSuccess={handlePasswordChangeSuccess}
              userEmail={user.email}
              showTitle={false}
              className="border-0 shadow-none p-0"
            />
          )}
        </div>

        {/* Footer for first-time login */}
        {isFirstTimeLogin && !passwordChanged && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Security Tip:</strong> Your password should be unique to this account and not shared with anyone. 
                  The account owner who created your account initially set up your access, but now only you will know your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstTimePasswordPrompt;

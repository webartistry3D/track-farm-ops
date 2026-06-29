import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import api from '../lib/api';

export interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  userEmail?: string;
  className?: string;
  showTitle?: boolean;
}

interface PasswordChangeState {
  currentPassword: string;
  newPassword: string  ;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  generatedPassword: string;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSuccess,
  onCancel,
  userEmail,
  className = '',
  showTitle = true
}) => {
  const [state, setState] = useState<PasswordChangeState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isSubmitting: false,
    error: null,
    success: null,
    generatedPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    strength: string;
    isValid: boolean;
  }>({ score: 0, strength: 'very-weak', isValid: false });

  const calculatePasswordScore = (password: string, email?: string): number => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    
    // Deductions for bad practices
    if (email && password.toLowerCase().includes(email.toLowerCase().split('@')[0])) score--;
    if (/(.)\1{2,}/.test(password)) score--;
    if (/(?:012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/i.test(password)) score--;
    
    return Math.max(0, Math.min(5, score));
  };

  const getStrengthLevel = (score: number): string => {
    if (score <= 1) return 'very-weak';
    if (score === 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
  };

  // Update password strength when new password changes
  useEffect(() => {
    if (state.newPassword) {
      const score = calculatePasswordScore(state.newPassword, userEmail);
      const strength = getStrengthLevel(score);
      setPasswordStrength({ score, strength, isValid: score >= 4 });
    } else {
      setPasswordStrength({ score: 0, strength: 'very-weak', isValid: false });
    }
  }, [state.newPassword, userEmail]);

  const updateState = (updates: Partial<PasswordChangeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleInputChange = (field: keyof PasswordChangeState, value: string | boolean) => {
    updateState({ [field]: value });
    // Clear messages when user starts typing
    if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
      updateState({ error: null, success: null });
    }
  };

  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one of each required character type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill remaining length with random characters
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    
    updateState({ 
      newPassword: shuffled,
      confirmPassword: shuffled,
      generatedPassword: shuffled 
    });
  };

  const validateForm = (): boolean => {
    if (!state.currentPassword) {
      updateState({ error: 'Current password is required' });
      return false;
    }

    if (!state.newPassword) {
      updateState({ error: 'New password is required' });
      return false;
    }

    if (state.newPassword.length < 8) {
      updateState({ error: 'New password must be at least 8 characters long' });
      return false;
    }

    if (!passwordStrength.isValid) {
      updateState({ error: 'New password does not meet security requirements' });
      return false;
    }

    if (state.newPassword !== state.confirmPassword) {
      updateState({ error: 'New passwords do not match' });
      return false;
    }

    if (state.currentPassword === state.newPassword) {
      updateState({ error: 'New password must be different from current password' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    updateState({ isSubmitting: true, error: null, success: null });

    try {
      await api.post('/auth/change-password', {
        currentPassword: state.currentPassword,
        newPassword: state.newPassword
      });

      updateState({
        success: 'Password changed successfully!',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        generatedPassword: '',
        isSubmitting: false
      });

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }

    } catch (error: any) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.feedback) {
        errorMessage = error.response.data.feedback.join('. ');
      }

      updateState({ 
        error: errorMessage,
        isSubmitting: false 
      });
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    switch (field) {
      case 'current':
        updateState({ showCurrentPassword: !state.showCurrentPassword });
        break;
      case 'new':
        updateState({ showNewPassword: !state.showNewPassword });
        break;
      case 'confirm':
        updateState({ showConfirmPassword: !state.showConfirmPassword });
        break;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your password to keep your account secure
          </p>
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
          </div>
        </div>
      )}

      {state.success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">{state.success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={state.showCurrentPassword ? 'text' : 'password'}
              value={state.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter current password"
              disabled={state.isSubmitting}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {state.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={state.showNewPassword ? 'text' : 'password'}
              value={state.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter new password"
              disabled={state.isSubmitting}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {state.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator
          password={state.newPassword}
          email={userEmail}
          onGeneratePassword={generateStrongPassword}
          showGenerateButton={true}
        />

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={state.showConfirmPassword ? 'text' : 'password'}
              value={state.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Confirm new password"
              disabled={state.isSubmitting}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {state.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {state.confirmPassword && state.newPassword !== state.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={state.isSubmitting || !passwordStrength.isValid || state.newPassword !== state.confirmPassword}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Changing Password...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={state.isSubmitting}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface PasswordStrengthIndicatorProps {
  password: string;
  email?: string;
  onGeneratePassword?: () => void;
  showGenerateButton?: boolean;
  className?: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  email,
  onGeneratePassword,
  showGenerateButton = false,
  className = ''
}) => {
  // This would typically come from the API, but for now we'll use a simplified version
  const validatePassword = (pwd: string, userEmail?: string): {
    score: number;
    strength: string;
    requirements: PasswordRequirement[];
  } => {
    const requirements: PasswordRequirement[] = [
      { text: 'At least 8 characters', met: pwd.length >= 8 },
      { text: 'At least one uppercase letter', met: /[A-Z]/.test(pwd) },
      { text: 'At least one lowercase letter', met: /[a-z]/.test(pwd) },
      { text: 'At least one number', met: /\d/.test(pwd) },
      { text: 'At least one special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
    ];

    // Additional checks
    if (pwd.length < 8) {
      requirements.push({ text: 'Password is too short', met: false });
    }
    
    if (userEmail && pwd.toLowerCase().includes(userEmail.toLowerCase().split('@')[0])) {
      requirements.push({ text: 'Password should not contain your email', met: false });
    }

    if (/(.)\1{2,}/.test(pwd)) {
      requirements.push({ text: 'Avoid repeated characters', met: false });
    }

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.min(5, metRequirements);

    let strength: string;
    if (score <= 1) strength = 'very-weak';
    else if (score === 2) strength = 'weak';
    else if (score === 3) strength = 'fair';
    else if (score === 4) strength = 'good';
    else strength = 'strong';

    return { score, strength, requirements };
  };

  const { score, strength, requirements } = validatePassword(password, email);

  const getStrengthColor = () => {
    switch (strength) {
      case 'very-weak': return 'bg-red-500';
      case 'weak': return 'bg-orange-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-lime-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrengthTextColor = () => {
    switch (strength) {
      case 'very-weak': return 'text-red-600 dark:text-red-400';
      case 'weak': return 'text-orange-600 dark:text-orange-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'good': return 'text-lime-600 dark:text-lime-400';
      case 'strong': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return 'Enter Password';
    }
  };

  const getStrengthPercentage = () => {
    return (score / 5) * 100;
  };

  if (!password) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Password Strength</span>
          {showGenerateButton && onGeneratePassword && (
            <button
              type="button"
              onClick={onGeneratePassword}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <RefreshCw className="w-3 h-3" />
              Generate
            </button>
          )}
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Enter a password to see strength</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
        {showGenerateButton && onGeneratePassword && (
          <button
            type="button"
            onClick={onGeneratePassword}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Generate Strong Password
          </button>
        )}
      </div>

      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getStrengthColor()} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${getStrengthPercentage()}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getStrengthTextColor()}`}>
            {getStrengthText()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {score}/5 requirements met
          </span>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                req.met 
                  ? 'bg-green-100 dark:bg-green-900/50' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {req.met ? (
                  <svg className="w-2.5 h-2.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                )}
              </div>
              <span className={`text-xs ${
                req.met 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      {score < 4 && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Security Tip
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Use a mix of uppercase letters, lowercase letters, numbers, and special characters to create a strong password.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;

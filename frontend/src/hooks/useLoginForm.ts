import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginError {
  title: string;
  message: string;
  suggestion: string;
  type: 'error' | 'warning' | 'info';
}

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  console.log('[useLoginForm] Hook called');
  
  const [formData, setFormData] = useState<LoginFormData>(() => {
    console.log('[useLoginForm] Initializing formData state');
    return { email: '', password: '' };
  });
  const [isLoading, setIsLoading] = useState(() => {
    console.log('[useLoginForm] Initializing isLoading state');
    return false;
  });
  const [error, setError] = useState<string>(() => {
    console.log('[useLoginForm] Initializing error state');
    return '';
  });
  const [errorDetails, setErrorDetails] = useState<LoginError | null>(() => {
    console.log('[useLoginForm] Initializing errorDetails state');
    return null;
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>(() => {
    console.log('[useLoginForm] Initializing fieldErrors state');
    return {};
  });

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string) => {
    console.log(`[useLoginForm] handleInputChange called: ${field} = "${value}"`);
    console.log(`[useLoginForm] Current fieldErrors:`, fieldErrors);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      console.log(`[useLoginForm] Clearing field error for ${field}`);
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [fieldErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    console.log('[useLoginForm] Clearing errors before API call');
    setError('');
    setErrorDetails(null);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      console.log('[useLoginForm] Login failed, setting error:', err);
      const errorInfo: LoginError = {
        title: 'Login Failed',
        message: err.response?.data?.error || 'An error occurred during login',
        suggestion: err.response?.data?.suggestion || 'Please check your credentials and try again',
        type: 'error'
      };
      
      console.log('[useLoginForm] Setting error state:', errorInfo);
      setError(errorInfo.message);
      setErrorDetails(errorInfo);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate]);

  const clearErrors = useCallback(() => {
    setError('');
    setErrorDetails(null);
    setFieldErrors({});
  }, []);

  return {
    formData,
    isLoading,
    error,
    errorDetails,
    fieldErrors,
    handleInputChange,
    handleSubmit,
    clearErrors,
    validateForm
  };
};

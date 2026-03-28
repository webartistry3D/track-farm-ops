import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User, LoginRequest, LoginResponse } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-logout functionality
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const timeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set logout timer (15 minutes)
    timeoutRef.current = window.setTimeout(() => {
      console.log('🕐 [AuthProvider] User inactive for 15 minutes, logging out...');
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  // Handle user activity events
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Setup activity monitoring
  useEffect(() => {
    if (!user) return; // Only monitor when user is logged in

    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown', 'keyup'
    ];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Handle visibility change (user switching tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the tab, check if they were inactive
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          console.log('🕐 [AuthProvider] User returned after inactivity timeout, logging out...');
          logout();
        } else {
          resetInactivityTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the timer when user logs in
    resetInactivityTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]); // Re-run when user state changes

  useEffect(() => {
    console.log('[AuthProvider] Component mounted');
    const token = localStorage.getItem('trackfarmops_token');
    const savedUser = localStorage.getItem('trackfarmops_user');
    
    console.log('[AuthProvider] Checking stored auth:', { token: !!token, savedUser: !!savedUser });
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      console.log('[AuthProvider] Setting user from storage:', userData);
      setUser(userData);
    }
    setIsLoading(false);
    console.log('[AuthProvider] Initial auth check complete');
  }, []); // Empty dependency array - only run once

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('🔐 [Frontend] Login attempt started');
      console.log('📧 [Frontend] Credentials:', {
        email: credentials.email,
        passwordLength: credentials.password?.length,
        hasPassword: !!credentials.password
      });
      
      console.log('🌐 [Frontend] API endpoint:', '/auth/login');
      console.log('🔗 [Frontend] API base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
      
      // Check localStorage before login
      const existingToken = localStorage.getItem('trackfarmops_token');
      const existingUser = localStorage.getItem('trackfarmops_user');
      console.log('💾 [Frontend] Existing localStorage:', {
        hasToken: !!existingToken,
        hasUser: !!existingUser,
        tokenLength: existingToken?.length
      });

      console.log('📤 [Frontend] Sending login request...');
      const startTime = Date.now();
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      const responseTime = Date.now() - startTime;
      console.log('📥 [Frontend] Login response received in', responseTime, 'ms');
      console.log('📋 [Frontend] Response structure:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        hasUser: !!response.data?.user,
        hasToken: !!response.data?.token,
        hasRequestId: !!response.data?.requestId
      });
      
      const { user: userData, token, requestId, debug } = response.data;
      
      console.log('👤 [Frontend] User data received:', {
        id: userData?.id,
        name: userData?.name,
        email: userData?.email,
        role: userData?.role,
        organizationId: userData?.organizationId,
        organizationName: userData?.organizationName
      });
      
      console.log('🎫 [Frontend] Token received:', {
        length: token?.length,
        startsWith: token?.substring(0, 20) + '...',
        validFormat: !!token && token.includes('.')
      });
      
      console.log('🔍 [Frontend] Debug info:', debug);
      console.log('🆔 [Frontend] Request ID:', requestId);

      // Store in localStorage
      console.log('💾 [Frontend] Storing in localStorage...');
      localStorage.setItem('trackfarmops_token', token);
      localStorage.setItem('trackfarmops_user', JSON.stringify(userData));
      
      // Verify storage
      const storedToken = localStorage.getItem('trackfarmops_token');
      const storedUser = localStorage.getItem('trackfarmops_user');
      console.log('✅ [Frontend] Storage verification:', {
        tokenStored: !!storedToken,
        userStored: !!storedUser,
        tokenLength: storedToken?.length,
        userParsed: storedUser ? JSON.parse(storedUser) : null
      });
      
      setUser(userData);
      console.log('✅ [Frontend] User set in context:', userData);
      
      // Start inactivity timer after successful login
      resetInactivityTimer();
      console.log('🕐 [AuthProvider] Inactivity timer started for 15 minutes');
      
      console.log('🎉 [Frontend] Login process completed successfully!');
      
    } catch (error: any) {
      console.error('❌ [Frontend] Login error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Detailed error analysis
      if (error.response?.data) {
        console.log('🔍 [Frontend] Server error details:', error.response.data);
        
        if (error.response.data.debug) {
          console.log('🐛 [Frontend] Debug info from server:', error.response.data.debug);
        }
        
        if (error.response.data.requestId) {
          console.log('🆔 [Frontend] Server request ID:', error.response.data.requestId);
        }
      }
      
      // Network error analysis
      if (error.code === 'ECONNREFUSED') {
        console.log('🌐 [Frontend] Connection refused - server not running?');
      } else if (error.code === 'ERR_NETWORK') {
        console.log('🌐 [Frontend] Network error - CORS or connectivity issue?');
      }
      
      throw error;
    }
  };

  const logout = () => {
    // Clear inactivity timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    localStorage.removeItem('trackfarmops_token');
    localStorage.removeItem('trackfarmops_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

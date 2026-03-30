import { createContext, useContext, useEffect, useState } from 'react';
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
      console.log('⏱️ [Frontend] Request timeout set to 30 seconds');
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
      
      // Handle specific timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('⏰ [Frontend] Login request timed out after 30 seconds');
        console.error('🌐 [Frontend] This is likely due to server cold start or network issues');
        console.error('💡 [Frontend] Try again in a few moments or check your connection');
        throw new Error('Login request timed out. The server may be starting up. Please try again in a moment.');
      }
      
      // Handle network connectivity issues
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('🌐 [Frontend] Network connectivity issue detected');
        console.error('💡 [Frontend] Check your internet connection and try again');
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle server errors
      if (error.response?.status >= 500) {
        console.error('🔥 [Frontend] Server error detected');
        console.error('💡 [Frontend] The server is experiencing issues. Try again later.');
        throw new Error('Server error. Please try again later.');
      }
      
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

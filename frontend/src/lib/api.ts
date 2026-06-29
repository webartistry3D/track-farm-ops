import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout to handle cold starts
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trackfarmops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug logging
  console.log('🌐 API Request:', {
    method: config.method?.toUpperCase(),
    url: `${API_BASE_URL}${config.url}`,
    hasToken: !!token,
  });
  
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    // Debug logging
    console.log('🌐 API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : null
    });
    
    return response;
  },
  (error) => {
    console.error('🌐 API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      isAxiosError: error.isAxiosError,
      errorCode: error.code,
      errorData: error.response?.data
    });
    
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isLoginRequest = url.includes('/auth/login');
      if (!isLoginRequest) {
        console.error('🚨 AUTH ERROR: Token expired or invalid');
        localStorage.removeItem('trackfarmops_token');
        localStorage.removeItem('trackfarmops_user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('🚨 AUTH ERROR: Access forbidden');
      // Don't redirect on 403, let user see error message
    } else if (error.response?.status >= 500) {
      console.error('🚨 SERVER ERROR: Backend server error');
    }
    
    return Promise.reject(error);
  }
);

export default api;

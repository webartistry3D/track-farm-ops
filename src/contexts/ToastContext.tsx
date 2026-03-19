import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import Toast, { type ToastType } from '../components/Toast';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string | React.ReactNode;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string | React.ReactNode, duration?: number) => void;
  showSuccess: (message: string | React.ReactNode, duration?: number) => void;
  showError: (message: string | React.ReactNode, duration?: number) => void;
  showWarning: (message: string | React.ReactNode, duration?: number) => void;
  showInfo: (message: string | React.ReactNode, duration?: number) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string | React.ReactNode, duration?: number) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((message: string | React.ReactNode, duration?: number) => {
    showToast('success', message, duration);
  }, [showToast]);

  const showError = useCallback((message: string | React.ReactNode, duration?: number) => {
    showToast('error', message, duration);
  }, [showToast]);

  const showWarning = useCallback((message: string | React.ReactNode, duration?: number) => {
    showToast('warning', message, duration);
  }, [showToast]);

  const showInfo = useCallback((message: string | React.ReactNode, duration?: number) => {
    showToast('info', message, duration);
  }, [showToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

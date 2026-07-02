import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './components/Landing';
import LoginClean from './components/LoginClean';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import CCTV from './components/CCTV';
import Analytics from './components/Analytics';
import LivestockHealth from './components/LivestockHealth';
import IncomePage from './components/IncomePage';
import ExpensePage from './components/ExpensePage';
import Inventory from './components/Inventory';
import Assets from './components/Assets';
import Settings from './components/Settings';
import UserProfile from './components/UserProfile';
import AdminSetup from './components/AdminSetup';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Pricing from './components/Pricing';
import SuperUserRoutes from './components/SuperUserRoutes';
import SuperUserSignup from './components/SuperUserSignup';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

const ProtectedRoute = ({ children, useLayout = true }: { children: React.ReactNode; useLayout?: boolean }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!useLayout) {
    return <>{children}</>;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  console.log('🚀 APP ROUTES COMPONENT MOUNTING!');
  console.log('🔍 APP ROUTES - Auth state:', {
    user: user,
    userRole: user?.role,
    isLoading: isLoading,
    isSuperUser: user?.role === 'SUPERUSER'
  });
  
  // Show loading screen while auth is initializing
  if (isLoading) {
    console.log('🔍 APP ROUTES - Showing loading screen');
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          user 
            ? <Navigate to={
                user.role === 'SUPERUSER' ? '/super-user/dashboard' :
                user.role === 'VETERINARIAN' ? '/livestock-health' :
                user.role === 'INVENTORY' ? '/inventory' :
                '/dashboard'
              } replace /> 
            : <LoginClean key="login-page" />
        } 
      />
      <Route 
        path="/signup" 
        element={
          user 
            ? <Navigate to={
                user.role === 'SUPERUSER' ? '/super-user/dashboard' :
                user.role === 'VETERINARIAN' ? '/livestock-health' :
                user.role === 'INVENTORY' ? '/inventory' :
                '/dashboard'
              } replace /> 
            : <Signup />
        } 
      />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/super-user-signup" element={<SuperUserSignup />} />
      
      {/* Superuser Routes - Separate from regular user routes */}
      <Route 
        path="/super-user/*" 
        element={
          <ProtectedRoute useLayout={false}>
            <SuperUserRoutes />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/income" 
        element={
          <ProtectedRoute>
            <IncomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expenses" 
        element={
          <ProtectedRoute>
            <ExpensePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assets" 
        element={
          <ProtectedRoute>
            <Assets />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cctv" 
        element={
          <ProtectedRoute>
            <CCTV />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/livestock-health" 
        element={
          <ProtectedRoute>
            <LivestockHealth />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminSetup />
          </ProtectedRoute>
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <ScrollToTop />
                <AppRoutes />
              </Router>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

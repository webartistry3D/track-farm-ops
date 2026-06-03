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
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
                user.role === 'MANAGER' ? '/analytics' :
                user.role === 'WORKER' ? '/income' :
                user.role === 'VETERINARIAN' ? '/livestock-health' :
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
                user.role === 'MANAGER' ? '/analytics' :
                user.role === 'WORKER' ? '/income' :
                user.role === 'VETERINARIAN' ? '/livestock-health' :
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
      <Route path="/super-user/*" element={<SuperUserRoutes />} />
      
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
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
  );
}

export default App;

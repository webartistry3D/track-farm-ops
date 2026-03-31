import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperUserSignup from './SuperUserSignup.tsx';
import SuperUserDashboard from './SuperUserDashboard';
import { useAuth } from '../contexts/AuthContext';

const SuperUserRoutes: React.FC = () => {
  console.log('🚀 SUPERUSER ROUTES COMPONENT MOUNTING!');
  
  const { user } = useAuth();
  
  console.log('🔍 SUPERUSER ROUTES - User state:', {
    user: user,
    userRole: user?.role,
    isSuperUser: user?.role === 'SUPERUSER'
  });

  // Check if user is authenticated as superuser
  const isSuperUser = user?.role === 'SUPERUSER';
  
  console.log('🔍 SUPERUSER ROUTES - Route decision:', { isSuperUser });

  return (
    <Routes>
      <Route 
        path="" 
        element={
          isSuperUser ? (
            (() => {
              console.log('🔄 SUPERUSER ROUTES - Redirecting to dashboard');
              return <Navigate to="dashboard" replace />;
            })()
          ) : (
            (() => {
              console.log('📝 SUPERUSER ROUTES - Showing SuperUserSignup component');
              return <SuperUserSignup />;
            })()
          )
        } 
      />
      <Route 
        path="dashboard" 
        element={
          (() => {
            console.log('🎯 SUPERUSER ROUTES - Rendering SuperUserDashboard component');
            return isSuperUser ? <SuperUserDashboard /> : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="*" 
        element={
          (() => {
            console.log('� SUPERUSER ROUTES - Wildcard route, rendering SuperUserDashboard');
            return isSuperUser ? <SuperUserDashboard /> : <Navigate to="" replace />;
          })()
        } 
      />
    </Routes>
  );
};

export default SuperUserRoutes;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperUserSignup from './SuperUserSignup';
import SuperUserDashboard from './SuperUserDashboard';
import { useAuth } from '../contexts/AuthContext';

const SuperUserRoutes: React.FC = () => {
  const { user } = useAuth();

  // Check if user is authenticated as superuser
  const isSuperUser = user?.role === 'superuser';

  return (
    <Routes>
      <Route 
        path="/super-user" 
        element={
          isSuperUser ? (
            <Navigate to="/super-user/dashboard" replace />
          ) : (
            <SuperUserSignup />
          )
        } 
      />
      <Route 
        path="/super-user/dashboard" 
        element={
          isSuperUser ? (
            <SuperUserDashboard />
          ) : (
            <Navigate to="/super-user" replace />
          )
        } 
      />
      <Route 
        path="/super-user/*" 
        element={
          isSuperUser ? (
            <SuperUserDashboard />
          ) : (
            <Navigate to="/super-user" replace />
          )
        } 
      />
    </Routes>
  );
};

export default SuperUserRoutes;

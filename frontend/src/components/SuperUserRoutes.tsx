import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperUserSignup from './SuperUserSignup';
import SuperUserDashboard from './SuperUserDashboard';
import SuperUserOverview from './SuperUserOverview';
import UserManagement from './UserManagement';
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
            console.log('🎯 SUPERUSER ROUTES - Rendering SuperUserOverview component');
            return isSuperUser ? <SuperUserOverview /> : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="users" 
        element={
          (() => {
            console.log('👥 SUPERUSER ROUTES - Rendering Users page');
            return isSuperUser ? <UserManagement /> : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="organizations" 
        element={
          (() => {
            console.log('🏢 SUPERUSER ROUTES - Rendering Organizations page (placeholder)');
            return isSuperUser ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Organizations Management</h1>
                <p className="text-gray-600">Organizations management page - Coming soon</p>
              </div>
            ) : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="subscriptions" 
        element={
          (() => {
            console.log('💳 SUPERUSER ROUTES - Rendering Subscriptions page (placeholder)');
            return isSuperUser ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Subscriptions Management</h1>
                <p className="text-gray-600">Subscriptions management page - Coming soon</p>
              </div>
            ) : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="activity" 
        element={
          (() => {
            console.log('📊 SUPERUSER ROUTES - Rendering Activity Monitor page (placeholder)');
            return isSuperUser ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Activity Monitor</h1>
                <p className="text-gray-600">Activity monitor page - Coming soon</p>
              </div>
            ) : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="logs" 
        element={
          (() => {
            console.log('📝 SUPERUSER ROUTES - Rendering System Logs page (placeholder)');
            return isSuperUser ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">System Logs</h1>
                <p className="text-gray-600">System logs page - Coming soon</p>
              </div>
            ) : <Navigate to="" replace />;
          })()
        } 
      />
      <Route 
        path="*" 
        element={
          (() => {
            console.log('🔄 SUPERUSER ROUTES - Wildcard route, rendering SuperUserDashboard');
            return isSuperUser ? <SuperUserDashboard /> : <Navigate to="" replace />;
          })()
        } 
      />
    </Routes>
  );
};

export default SuperUserRoutes;

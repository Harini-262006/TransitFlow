import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, getRoleDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F4]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#667085] font-semibold text-xs uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) {
      // Redirect user to their designated dashboard if trying to access unauthorized role route
      return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

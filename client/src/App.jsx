import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DriverDashboard from './pages/DriverDashboard';
import ConductorDashboard from './pages/ConductorDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Helper component to handle default route '/'
const RootRedirect = () => {
  const { user, loading, isAuthenticated, getRoleDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Role-Protected Dashboards (Manager, Driver, Conductor ONLY) */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conductor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['conductor']}>
                <ConductorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all unmapped routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth session on app initialization
  useEffect(() => {
    let isMounted = true;

    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (response.data.success && isMounted) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkLoggedInUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.customMessage ||
        error.response?.data?.message ||
        'Unable to connect to server. Please make sure the backend is running on port 5000.';
      return { success: false, message };
    }
  };

  // Signup handler
  const signup = async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message =
        error.customMessage ||
        error.response?.data?.message ||
        'Unable to connect to server. Please make sure the backend is running on port 5000.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
    }
  };

  // Determine dashboard URL based on user role (Manager, Driver, Conductor)
  const getRoleDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return '/manager/dashboard';
      case 'driver':
        return '/driver/dashboard';
      case 'conductor':
        return '/conductor/dashboard';
      default:
        return '/driver/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        getRoleDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

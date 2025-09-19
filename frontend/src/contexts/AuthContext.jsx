import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, employeeAuthAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin' or 'employee'
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          const savedUserType = localStorage.getItem('userType');
          
          if (savedToken && savedUser && savedUserType) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setUserType(savedUserType);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        // Clear invalid data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const loginAdmin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      const { token: newToken, admin: newUser } = response.data.data;
      
      setToken(newToken);
      setUser(newUser);
      setUserType('admin');
      setIsAuthenticated(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('userType', 'admin');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const loginEmployee = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call employee login API
      const response = await employeeAuthAPI.login(credentials);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Employee login failed');
      }

      const { token: newToken, employee: newUser } = data.data;
      
      setToken(newToken);
      setUser(newUser);
      setUserType('employee');
      setIsAuthenticated(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('userType', 'employee');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Employee login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const registerEmployee = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call employee register API
      const response = await employeeAuthAPI.register(userData);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Employee registration failed');
      }

      const { token: newToken, employee: newUser } = data.data;
      
      setToken(newToken);
      setUser(newUser);
      setUserType('employee');
      setIsAuthenticated(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('userType', 'employee');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Employee registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    userType,
    token,
    isAuthenticated,
    loading,
    error,
    loginAdmin,
    loginEmployee,
    registerEmployee,
    logout,
    clearError,
    isAdmin: userType === 'admin',
    isEmployee: userType === 'employee',
    // Legacy support for existing components
    admin: userType === 'admin' ? user : null,
    login: loginAdmin, // Default to admin login for backward compatibility
    register: registerEmployee
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
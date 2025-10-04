// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopspher.com';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [lastVerified, setLastVerified] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Set up periodic auth verification (every 5 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLastVerified(new Date());
        console.log('✅ Auth verification successful:', response.data.user.email);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('❌ Auth verification failed:', error.message);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error.response?.data?.message || 'Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  };

const login = async (credentials) => {
  try {
    setAuthError(null);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, 
      credentials, 
      { withCredentials: true } // Cookies will be sent automatically
    );
    
    // Set user data - tokens are managed automatically via cookies
    setUser(response.data);
    setIsAuthenticated(true);
    setLastVerified(new Date());
    console.log('✅ Login successful');
    
    return { success: true, user: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    setAuthError(errorMessage);
    console.error('❌ Login failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, 
        { withCredentials: true }
      );
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setLastVerified(null);
    }
  };

  // Enhanced verification methods
  const verifyTokenValidity = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        withCredentials: true,
        timeout: 5000
      });
      return { valid: true, user: response.data.user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  };

  const getAuthStatus = () => {
    return {
      isAuthenticated,
      user,
      isLoading,
      lastVerified,
      authError,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  };

  const forceRecheck = () => {
    console.log('🔄 Force rechecking authentication...');
    checkAuthStatus();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    lastVerified,
    login,
    logout,
    checkAuthStatus,
    verifyTokenValidity,
    getAuthStatus,
    forceRecheck
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
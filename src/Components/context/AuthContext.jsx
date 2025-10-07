// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

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

  // Configure axios defaults once
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 10000;
    
    // Test backend connection on startup
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 3000
      });
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.warn('⚠️ Backend connection test failed:', error.message);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const response = await axios.get(`${API_BASE_URL}/auth/verify`);
      
      if (response.data.user) {
        const userData = {
          userId: response.data.user.userId,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setLastVerified(new Date());
        console.log('✅ Auth verification successful:', response.data.user.email);
      } else {
        // No user data - treat as not authenticated
        setUser(null);
        setIsAuthenticated(false);
        console.log('ℹ️ No active session found');
      }
    } catch (error) {
      // 401 is expected when no valid token exists
      if (error.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        console.log('ℹ️ No valid authentication token');
      } else {
        console.error('❌ Auth verification failed:', error.message);
        setAuthError('Authentication check failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Set up periodic auth verification (every 10 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (credentials) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const loginData = {
        email: credentials.email, 
        password: credentials.password
      };

      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`, 
        loginData
      );
      
      console.log('✅ Login API response:', response.data);
      
      if (response.data.userId) {
        const userData = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setLastVerified(new Date());
        
        console.log('✅ Login successful, user set in context');
        
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response format: missing userId');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('❌ Login failed:', errorMessage);
      
      setAuthError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {});
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setLastVerified(null);
      console.log('✅ Local auth state cleared');
    }
  };

  const verifyTokenValidity = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
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
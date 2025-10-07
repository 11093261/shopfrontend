import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from './context/AuthContext.jsx';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm();

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 10000;
  }, []);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try multiple health endpoints
        const endpoints = ['/alb-health', '/health', '/healthz', '/simple-health'];
        
        for (const endpoint of endpoints) {
          try {
            await axios.get(`${API_BASE_URL}${endpoint}`, { timeout: 3000 });
            setBackendStatus('connected');
            console.log(`✅ Backend connected via ${endpoint}`);
            return;
          } catch (endpointError) {
            continue;
          }
        }
        
        // If all endpoints fail
        setBackendStatus('disconnected');
        console.warn('❌ All backend health checks failed');
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('❌ Connection test failed:', error.message);
      }
    };

    testConnection();
  }, [API_BASE_URL]);

  // Redirect if already authenticated - FIXED: Check both authentication states
  useEffect(() => {
    console.log('🔄 Login component auth check:', { isAuthenticated, user });
    
    if (isAuthenticated && user && user.userId) {
      console.log('✅ User already authenticated, redirecting to Register...');
      
      // Use setTimeout to ensure the navigation happens after render
      const redirectTimer = setTimeout(() => {
        navigate("/Register", { 
          replace: true,
          state: { 
            message: 'Welcome back!',
            userName: user.name
          }
        });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 Starting login process for:', formData.email);

      // Use the AuthContext login method which handles the API call
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Login successful via AuthContext, user:', result.user);
        
        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          navigate("/Register", { 
            replace: true,
            state: { 
              message: 'Login successful!',
              userName: result.user.name
            }
          });
        }, 200);
      } else {
        // AuthContext already set the error, but we need to display it here too
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Login component error:', error);
      
      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.");
      } else if (!error.response) {
        setError("Network error. Please check your connection and ensure the backend is running.");
      } else {
        // Use the error message from the caught error
        setError(error.message || "Login failed. Please try again.");
      }
      
      // Clear form on error
      reset();
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Sign in to your account</h2>
            <p className="text-gray-600 mt-2">Welcome back to ShopSphere</p>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-block w-3 h-3 rounded-full ${
                    backendStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                    backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`}
                ></span>
                <p className="text-sm text-gray-500">
                  {backendStatus === 'connected' && 'Backend connected ✅'}
                  {backendStatus === 'disconnected' && 'Backend disconnected ❌'}
                  {backendStatus === 'checking' && 'Checking connection... 🔄'}
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-center mb-4">
              <div className="font-medium">Login Failed</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          {backendStatus === 'disconnected' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md text-center mb-4">
              <p className="text-sm font-medium">Backend connection issue</p>
              <p className="text-xs mt-1">Please ensure the server is running at {API_BASE_URL}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none relative block w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Enter your email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address format"
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || backendStatus === 'disconnected'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={handleSignupRedirect}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Register now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from './context/AuthContext.jsx';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopspher.com';
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 5000;
  }, []);

  // Check backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await axios.get(`${API_BASE_URL}/alb-health`, { timeout: 2000 });
        setBackendStatus('connected');
      } catch (error) {
        try {
          await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
          setBackendStatus('connected');
        } catch {
          setBackendStatus('disconnected');
        }
      }
    };

    testConnection();
  }, [API_BASE_URL]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        data, 
        { 
          headers: { 
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 5000
        }
      );
      
      // Handle successful login
      if (response.data.userId || response.data.user) {
        console.log('Login successful, redirecting to Register page...');
        
        // Extract user data - tokens are now in httpOnly cookies
        const userData = response.data.user || {
          name: response.data.name,
          email: data.email,
          userId: response.data.userId
        };
        
        // Update auth context with user data only - no token
        login(userData);
        
        // Navigate to Register page after successful login
        navigate("/", { 
          replace: true,
          state: { 
            message: 'Login successful! Redirecting to product listing...',
            userName: userData.name || 'User'
          }
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.");
      } else if (!error.response) {
        setError("Network error. Please check your connection.");
      } else {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            setError(data.message || "Invalid request format");
            break;
          case 401:
            setError(data.message || "Invalid email or password");
            break;
          case 404:
            setError("Service unavailable. Please try again later.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(data.message || "Login failed. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
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
                    backendStatus === 'connected' ? 'bg-green-500' : 
                    backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                ></span>
                <p className="text-sm text-gray-500">
                  {backendStatus === 'connected' && 'Backend connected'}
                  {backendStatus === 'disconnected' && 'Backend disconnected'}
                  {backendStatus === 'checking' && 'Checking connection...'}
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-center mb-4">
              {error}
            </div>
          )}

          {backendStatus === 'disconnected' && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-center mb-4">
              <p className="text-sm">Backend server appears to be offline.</p>
              <p className="text-xs mt-1">Please check if the server is running.</p>
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
                    errors.email ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10`}
                  placeholder="Enter your email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
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
                    errors.password ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10`}
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-opacity"
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
                onClick={() => navigate("/signup")}
                className="font-medium text-indigo-600 hover:text-indigo-500"
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
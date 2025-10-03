import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  // Simple connection test - runs only once on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple HEAD request to check if backend is reachable
        await axios.head(API_BASE_URL, { timeout: 3000 });
        setBackendStatus('connected');
      } catch (error) {
        // If HEAD fails, try OPTIONS as fallback
        try {
          await axios.options(`${API_BASE_URL}/auth/login`, { timeout: 3000 });
          setBackendStatus('connected');
        } catch {
          setBackendStatus('disconnected');
        }
      }
    };

    testConnection();
  }, [API_BASE_URL]);

  // Check if user is already logged in - runs only once on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token') || 
                   document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] ||
                   document.cookie.match(/(?:^|; )accessToken=([^;]*)/)?.[1];

      if (!token || token.length < 10) {
        return; // No valid token found
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/testauth`, {
          withCredentials: true,
          timeout: 5000
        });
        
        if (response.status === 200) {
          navigate("/Register", { replace: true });
        }
      } catch (error) {
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    };
    
    checkAuthStatus();
  }, [navigate, API_BASE_URL]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Attempting login with:', data.email);
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        data, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 10000 
        }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.userId && response.data.accessToken) {
        // Store token in localStorage for quick access
        localStorage.setItem('auth_token', response.data.accessToken);
        localStorage.setItem('user_id', response.data.userId);
        localStorage.setItem('user_name', response.data.name);
        
        console.log('Login successful, navigating to Register page...');
        
        // Navigate immediately without delay
        navigate("/Register", { 
          replace: true,
          state: { 
            message: 'Login successful!',
            userName: response.data.name 
          }
        });
        
      } else {
        throw new Error("Invalid response format");
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
            setError("Login endpoint not found. Please check the API URL.");
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

  const handleTestConnection = async () => {
    setBackendStatus('checking');
    try {
      await axios.head(API_BASE_URL, { timeout: 3000 });
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Sign in to your account</h2>
            <p className="text-gray-600 mt-2">Welcome back to ShopSpher</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  backendStatus === 'connected' ? 'bg-green-500' : 
                  backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-gray-500'
                }`}></span>
                <p className="text-sm text-gray-500">
                  {backendStatus === 'connected' && 'Backend connected'}
                  {backendStatus === 'disconnected' && 'Backend disconnected'}
                  {backendStatus === 'checking' && 'Checking connection...'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                className="text-xs text-indigo-600 hover:text-indigo-500 underline"
              >
                Test
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">API: {API_BASE_URL}</p>
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
                  className={`appearance-none relative block w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10`}
                  placeholder="Email address"
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
                  className={`appearance-none relative block w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10`}
                  placeholder="Password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
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
                onClick={() => navigate("/Signup")}
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
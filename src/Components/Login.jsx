import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null);
  // const userauth = {
  //   loginUser:`http://localhost:3200/auth/verify/${id}`,
  //   postuserLogin:"http://localhost:3200/auth/login",
  //   refresh:"http://localhost:3200/auth/refresh"

  // }

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/verify/${id}`, {
          withCredentials: true
        });
        
        if (response.data.user) {
          navigate("/Register");
        }
      } catch (error) {
        // Not authenticated, stay on login page
        console.log("Not authenticated");
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`, 
        data, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 10000 
        }
      );
      
      if (response.data.userId) {
        setPending(response.data);
        navigate("/Home");
      } else {
        throw new Error("No user data received");
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    if (error.code === 'ECONNABORTED') {
      setError("Request timed out. Please try again.");
      return;
    }
    
    if (!error.response) {
      setError("Network error. Please check your connection.");
      return;
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        setError(data.message || "Invalid request format");
        break;
      case 401:
        setError(data.message || "Invalid email or password");
        break;
      case 403:
        setError(data.message || "Account not verified");
        break;
      case 429:
        setError("Too many attempts. Please try again later.");
        break;
      case 500:
        setError("Server error. Please try again later.");
        break;
      default:
        setError(data.message || "Login failed. Please try again.");
    }
  };

  // Function to handle token refresh
  const refreshToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        console.log("Token refreshed successfully");
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Redirect to login if refresh fails
      navigate("/Login");
      return false;
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
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-center mb-4">
              {error}
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
                disabled={loading}
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
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
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
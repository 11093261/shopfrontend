import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

const Login = () => {
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending,setpending] = useState([])
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();
  useEffect(() => {
    if(pending === null || pending === ""){
      return (
        navigate("/Signup")
      )
    }
    const token = localStorage.getItem("token");
    
    if (token) {
      if (isTokenValid(token)) {
      
      } else {
        localStorage.removeItem("token");
      }
    }
  }, []);
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const onSubmit = async (data)=>{
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post(
        "http://localhost:3200/auth/login", 
        data, 
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000 
        }
      );
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setpending(response.data)
        }
        navigate("/Home");

      } else {
        throw new Error("No access token received");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-center">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
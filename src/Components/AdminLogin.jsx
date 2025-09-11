// AdminLogin.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  const verifySession = async () => {
    try {
      const token = localStorage.getItem("token")
      const adminId = localStorage.getItem("adminId")
      if (!token || !adminId) {
        setIsLoading(false);
        return;
      }
      await axios.get("http://localhost:3200/admin", {
        headers: { Authorization: `Bearer ${token}`}
      });

      
      navigate("/Admin");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth');
        setLoginError("Session expired. Please login again.");
      } else {
        console.error('Session verification error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  verifySession();
}, [navigate]);

  const { 
    register, 
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  
 const onSubmit = async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:3200/api/adminlogin",
      formData
    );
    const token = response.data.token;
    if (!token) {
      throw new Error('No token received');
    }
    
    localStorage.setItem('auth', JSON.stringify({
      token: token,
      expiresAt: Date.now() + 3600000 
    }));
    
    navigate("/Admin");
  } catch (error) {
    setLoginError(
      error.response?.data?.message || 
      error.message ||
      "Login failed. Please check your credentials."
    );
  }
};

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Admin Portal Login
        </h2>
        
        {loginError && (
          <div className="bg-red-50 p-4 mb-4 rounded-md">
            <p className="text-red-700">{loginError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Username
            </label>
            <input
              {...register("username", { 
                required: "Username is required",
                pattern: {
                  message: "Only 'admin' username is allowed"
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin"
              defaultValue="admin"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 3.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 013.242-.857c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 3.31c-.12.362-.12.752 0 1.114 1.489 4.471 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
  </svg>
);

export default AdminLogin;
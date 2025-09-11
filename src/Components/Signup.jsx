import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoLogoGoogle, IoMdEye, IoMdEyeOff } from 'react-icons/io';

const Signup = () => {
  const navigate = useNavigate();
  const [togglePassword, setTogglePassword] = useState(true);
  const [toggle, setToggle] = useState(null);
  const [unsuccess, setUnsuccess] = useState(null);
  const [success, setSuccess] = useState(null);
  const [getusersAuth, setGetusersAuth] = useState([]);
  const [postAuth, setPostAuth] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const getaccesToken = ()=>{
    return localStorage.getItem("token")

    
  }
  useEffect(() => {
    const fetchOneUser = async (userId) => {
      try {
        const accessToken = getaccesToken()
        const response = await axios.get(`http://localhost:3200/auth/verify/${userId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        setGetusersAuth(response.data);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };
    fetchOneUser();
  }, []);

  useEffect(() => {
    const fetchApi = async () => {
      try { 
        const response = await axios.get("http://localhost:3200/auth/registers");
        setGetusersAuth(response.data);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };
    fetchApi();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:3200/auth/registers", data);
      setPostAuth(response.data);
      setSuccess(response.data);
      reset();
      navigate("/Login");
    } catch (error) {
      console.error("Signup error:", error.message);
      setUnsuccess(error.message);
    }
  };

  const handleToggle = () => {
    setToggle(prev => !prev);
    setTogglePassword(prev => !prev);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Signup Successful!</h2>
          <p className="text-gray-600 mb-6">Welcome to ShopSphere,!</p>
          <button 
            onClick={() => navigate("/Products")} 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (unsuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Signup Failed</h2>
          <p className="text-gray-600 mb-4">Sorry, we couldn't create your account.</p>
          <p className="text-gray-600 mb-6">Please check your internet connection and try again.</p>
          <button 
            onClick={() => setUnsuccess(null)} 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="md:w-1/2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 flex flex-col justify-between">  
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl opacity-90 mb-8">
            Sign up to explore thousands of products, exclusive deals, and personalized shopping experiences.
          </p>
          <ul className="space-y-3 gap-5">
            <li className="flex items-center ">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Exclusive member discounts</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Fast checkout experience</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Personalized recommendations</span>
            </li>
          </ul>
        </div>
        
        <div className="hidden md:block">
          <div className="flex space-x-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex-1">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                <h4 className="font-semibold text-center">Top Product</h4>
                <p className="text-sm opacity-80 text-center">Category</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
              <p className="text-gray-600 mt-2">Join thousands of happy shoppers</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  id="name"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Phone number must contain only digits"
                    },
                    minLength: {
                      value: 11,
                      message: "Phone number must be 11 digits"
                    },
                    maxLength: {
                      value: 11,
                      message: "Phone number must be 11 digits"
                    }
                  })}
                  type="text"
                  id="phone"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      },
                      maxLength: {
                        value: 18,
                        message: "Password must be less than 18 characters"
                      }
                    })}
                    type={togglePassword ? "password" : "text"}
                    id="password"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                  >
                    {togglePassword ? <IoMdEyeOff className="text-xl" /> : <IoMdEye className="text-xl" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-500 text-sm">{errors.password.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Create Account
              </button>
              
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
                <IoLogoGoogle className="text-xl text-red-500" />
                <span>Sign up with Google</span>
              </button>
              
              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate("/login")} 
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Signup;
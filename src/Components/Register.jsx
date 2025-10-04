import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IoIosPeople, IoMdCloudUpload, IoMdImages } from 'react-icons/io';
import { FaPhone, FaDollarSign, FaBoxes, FaClipboard, FaLocationArrow } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { FaCrown, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo, FaCreditCard } from 'react-icons/fa';

const FREE_POST_LIMIT = 10;

// Fast cookie check
const getCookie = (name) => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  } catch (error) {
    return null;
  }
};

const Register = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('seller');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [postStatus, setPostStatus] = useState({
    usedPosts: 0,
    remainingPosts: FREE_POST_LIMIT,
    totalPosts: FREE_POST_LIMIT,
    needsPayment: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopspher.com';
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  
  // Enhanced authentication check
  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      if (!isMounted) return;

      try {
        const token = getCookie("accessToken") || getCookie("token");
        
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('Please log in to access this page');
            navigate('/login', { replace: true });
          }
          return;
        }

        // Verify token with backend
        try {
          const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
            withCredentials: true,
            timeout: 2000
          });
          
          if (isMounted && verifyResponse.data.user) {
            setIsAuthenticated(true);
            setAuthError(null);
            setUserProfile(verifyResponse.data.user);
            
            // Check user's post limit and payment status
            checkPostLimit(verifyResponse.data.user);
          }
        } catch (verifyError) {
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('Session expired. Please log in again.');
            navigate('/login', { replace: true });
          }
          return;
        }
        
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthError('Authentication failed. Please log in again.');
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    const checkPostLimit = async (user) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/post-status`, {
          withCredentials: true
        });
        
        if (isMounted) {
          setPostStatus({
            usedPosts: response.data.usedPosts || 0,
            remainingPosts: response.data.remainingPosts || FREE_POST_LIMIT,
            totalPosts: response.data.totalPosts || FREE_POST_LIMIT,
            needsPayment: response.data.needsPayment || false
          });
        }
      } catch (error) {
        console.error('Error checking post limit:', error);
        // Default to free tier if API fails
        if (isMounted) {
          setPostStatus({
            usedPosts: 0,
            remainingPosts: FREE_POST_LIMIT,
            totalPosts: FREE_POST_LIMIT,
            needsPayment: false
          });
        }
      }
    };

    checkAuthentication();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, API_BASE_URL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    
    if (file) {
      if (file.size > 5 * 1024 * 1024){
        setUploadError('File is too large. Maximum size is 5MB.');
        return;
      }
      if (!file.type.match('image.*')){
        setUploadError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAccessToken = () => {
    const token = getCookie("accessToken") || getCookie("token");
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return token;
  };

  const handlePayment = async (paymentMethod = 'card') => {
    setPaymentProcessing(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await axios.post(`${API_BASE_URL}/api/payment/create`, {
        amount: 500, // ₦500 for premium posting
        currency: 'NGN',
        paymentMethod,
        product: 'premium_posts'
      }, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.paymentUrl;
      } else if (response.data.success) {
        // Direct payment success
        setPostStatus(prev => ({
          ...prev,
          remainingPosts: prev.remainingPosts + 10,
          needsPayment: false
        }));
        setShowPaymentModal(false);
        setUploadError('Payment successful! You can now post your product.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setUploadError('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      setUploadError('Authentication error. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    // Check if user needs to pay for more posts
    if (postStatus.needsPayment || postStatus.remainingPosts <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      
      // Map frontend field names to match your database schema
      const fieldMapping = {
        sellername: 'sellername',
        phone: 'phonenumber',
        location: 'location',
        price: 'price',
        description: 'description',
        quantity: 'quantity'
      };
      
      // Add all form data with proper field names
      Object.keys(data).forEach(key => {
        if (key !== 'imageUrl' && data[key] !== undefined && data[key] !== null) {
          const backendFieldName = fieldMapping[key] || key;
          formData.append(backendFieldName, data[key]);
        }
      });
      
      // Set default quantity if not provided
      if (!data.quantity) {
        formData.append('quantity', 1);
      }
      
      // Add image if available
      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }

      const token = getAccessToken();
      if (!token) return;

      // Submit to seller endpoint
      const response = await axios.post(`${API_BASE_URL}/api/seller`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 15000
      });
      
      if (response.data) {
        console.log('Product listed successfully:', response.data);
        
        // Update post status
        setPostStatus(prev => ({
          ...prev,
          usedPosts: prev.usedPosts + 1,
          remainingPosts: prev.remainingPosts - 1,
          needsPayment: prev.remainingPosts - 1 <= 0
        }));
        
        // Show success and reset form
        setUploadError('');
        reset();
        setImagePreview(null);
        setImageFile(null);
        
        // Show success message
        setUploadError('Product listed successfully!');
        
      } else {
        throw new Error('No response data received');
      }
      
    } catch (err) {
      console.error('Product submission error:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setUploadError('Authentication failed. Your session may have expired. Please log in again.');
          navigate('/login', { replace: true });
        } else if (err.response.status === 400) {
          setUploadError(err.response.data?.error || err.response.data?.message || 'Invalid data. Please check your form inputs.');
        } else if (err.response.status === 402) {
          setUploadError('Payment required. Please upgrade to post more products.');
          setShowPaymentModal(true);
        } else if (err.response.status === 413) {
          setUploadError('File too large. Please select a smaller image (max 5MB).');
        } else {
          setUploadError(err.response.data?.error || err.response.data?.message || `Error: ${err.response.status}. Please try again.`);
        }
      } else if (err.request) {
        setUploadError('Network error. Please check your internet connection and try again.');
      } else {
        setUploadError('Unexpected error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCrown className="text-yellow-500 text-2xl" />
              <h3 className="text-xl font-bold text-gray-800">Upgrade to Post More</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-800">Free Posts Used</p>
                  <p className="text-blue-600 text-sm">
                    {postStatus.usedPosts} of {postStatus.totalPosts} free posts
                  </p>
                </div>
                <FaExclamationTriangle className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-5 text-white mb-6">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Get 10 Additional Posts</p>
                <div className="flex items-center justify-center gap-2">
                  <FaDollarSign className="text-xl" />
                  <span className="text-3xl font-bold">500</span>
                  <span className="text-lg">NGN</span>
                </div>
                <p className="text-purple-200 text-sm mt-2">One-time payment • No subscription</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePayment('card')}
                disabled={paymentProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay with Card
                  </>
                )}
              </button>

              <button
                onClick={() => handlePayment('transfer')}
                disabled={paymentProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                <FaCreditCard />
                Bank Transfer
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure payment processed by Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth error if authentication failed
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            List Your Product
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reach thousands of potential customers by listing your products on our platform
          </p>
        </div>

        {/* Post Status Indicator */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${postStatus.needsPayment ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {postStatus.needsPayment ? <FaExclamationTriangle /> : <FaCheckCircle />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {postStatus.needsPayment ? 'Post Limit Reached' : 'Posts Available'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {postStatus.remainingPosts} of {postStatus.totalPosts} free posts remaining
                </p>
              </div>
            </div>
            
            {postStatus.needsPayment && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <FaCrown className="text-sm" />
                Upgrade Now
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Free Posts</span>
              <span>{postStatus.usedPosts}/{postStatus.totalPosts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  postStatus.needsPayment ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (postStatus.usedPosts / postStatus.totalPosts) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* User Welcome Message */}
        {isAuthenticated && userProfile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl" />
              <div>
                <h3 className="font-semibold text-green-800">Welcome, {userProfile.name || 'User'}!</h3>
                <p className="text-green-600 text-sm">You are successfully authenticated and can list your products.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {uploadError && (
          <div className={`border rounded-lg p-4 mb-6 ${
            uploadError.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {uploadError.includes('successfully') ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaExclamationTriangle className="text-red-500 text-xl" />
              )}
              <div>
                <h3 className="font-semibold">
                  {uploadError.includes('successfully') ? 'Success' : 'Error'}
                </h3>
                <p className="text-sm">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Form Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'seller'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('seller')}
              >
                <div className="flex items-center justify-center gap-2">
                  <IoIosPeople className="text-lg" />
                  Seller Information
                </div>
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'product'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('product')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaBoxes className="text-lg" />
                  Product Details
                </div>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Seller Information Tab */}
            {activeTab === 'seller' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <IoIosPeople className="text-gray-500" />
                        Seller Name
                      </div>
                    </label>
                    <input
                      type="text"
                      {...register("sellername", { required: "Seller name is required" })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your name as seller"
                    />
                    {errors.sellername && (
                      <p className="text-red-500 text-sm mt-1">{errors.sellername.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        Phone Number
                      </div>
                    </label>
                    <input
                      type="tel"
                      {...register("phone", { 
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: "Please enter a valid phone number"
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaLocationArrow className="text-gray-500" />
                      Location
                    </div>
                  </label>
                  <input
                    type="text"
                    {...register("location", { required: "Location is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your location"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('product')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Next
                    <FaLocationArrow className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* Product Details Tab */}
            {activeTab === 'product' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-gray-500" />
                        Price (₦)
                      </div>
                    </label>
                    <input
                      type="number"
                      {...register("price", { 
                        required: "Price is required",
                        min: { value: 1, message: "Price must be greater than 0" }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter price"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaClipboard className="text-gray-500" />
                        Quantity Available
                      </div>
                    </label>
                    <input
                      type="number"
                      {...register("quantity", { 
                        required: "Quantity is required",
                        min: { value: 1, message: "Quantity must be at least 1" }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter quantity"
                      defaultValue={1}
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaClipboard className="text-gray-500" />
                      Product Description
                    </div>
                  </label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe your product in detail..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <IoMdImages className="text-gray-500" />
                      Product Image
                    </div>
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-3">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <IoMdCloudUpload className="text-4xl text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload product image
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {uploadError && !uploadError.includes('successfully') && (
                    <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('seller')}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    Back
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setImagePreview(null);
                        setImageFile(null);
                        setUploadError('');
                      }}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <FaRedo className="text-sm" />
                      Reset
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || (postStatus.needsPayment && !showPaymentModal)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Listing...
                        </>
                      ) : postStatus.needsPayment ? (
                        <>
                          <FaCrown className="text-sm" />
                          Upgrade to Post
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-sm" />
                          List Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal />
    </div>
  );
};

export default Register;
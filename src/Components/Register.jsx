import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IoIosPeople, IoMdCloudUpload, IoMdImages } from 'react-icons/io';
import { FaPhone, FaDollarSign, FaBoxes, FaClipboard, FaLocationArrow, FaCrown, FaCheckCircle, FaExclamationTriangle, FaRedo, FaCreditCard } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

const FREE_POST_LIMIT = 10;

const Register = () => {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopspher.com';
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login...');
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // Load post status when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      checkPostLimit();
    }
  }, [isAuthenticated, authUser]);

  const checkPostLimit = async () => {
    try {
      // FIXED: Changed to match backend endpoint /api/payment/posts/status
      const response = await axios.get(`${API_BASE_URL}/api/posts/status`, {
        withCredentials: true,
        timeout: 5000
      });
      
      console.log('✅ Post limit check:', response.data);
      
      setPostStatus({
        usedPosts: response.data.postsCount || 0,
        remainingPosts: response.data.remainingFreePosts || FREE_POST_LIMIT,
        totalPosts: FREE_POST_LIMIT,
        needsPayment: response.data.needsPayment || false
      });
    } catch (error) {
      console.error('Error checking post limit:', error);
      // Default to free tier if API fails
      setPostStatus({
        usedPosts: 0,
        remainingPosts: FREE_POST_LIMIT,
        totalPosts: FREE_POST_LIMIT,
        needsPayment: false
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 5MB.');
        return;
      }
      if (!file.type.match('image.*')) {
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

  const resetImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const syntheticEvent = {
        target: {
          files: [file]
        }
      };
      handleImageChange(syntheticEvent);
    }
  };

  // FIXED: Updated to match backend endpoint /api/payment/initialize
  const handlePayment = async (paymentMethod = 'card') => {
    setPaymentProcessing(true);
    try {
      // FIXED: Changed endpoint to /api/payment/initialize (matches backend)
      const response = await axios.post(`${API_BASE_URL}/api/payment/initialize`, {}, {
        withCredentials: true
      });

      if (response.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setUploadError(`Payment failed: ${error.response.data.error}`);
      } else {
        setUploadError('Payment initialization failed. Please try again.');
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  // FIXED: Added payment verification function
  const verifyPayment = async (reference) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/verify/${reference}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUploadError('Payment successful! You can now post more products.');
        setShowPaymentModal(false);
        // Refresh post status
        await checkPostLimit();
      } else {
        setUploadError(`Payment verification failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setUploadError('Payment verification failed. Please check your payment status.');
    }
  };

  // FIXED: Check for payment verification on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReference = urlParams.get('reference');
    const fromPayment = urlParams.get('fromPayment');
    
    if (paymentReference && fromPayment) {
      verifyPayment(paymentReference);
    }
  }, []);

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      setUploadError('Please log in to list products');
      navigate('/login');
      return;
    }

    // Check if user needs to pay for more posts
    if (postStatus.needsPayment || postStatus.remainingPosts <= 0) {
      setShowPaymentModal(true);
      return;
    }

    // Validate image file
    if (!imageFile) {
      setUploadError('Please select a product image');
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      
      // Add all form data with proper field names matching backend schema
      formData.append('sellername', data.sellername);
      formData.append('price', parseFloat(data.price));
      formData.append('phonenumber', data.phonenumber);
      formData.append('description', data.description);
      formData.append('quantity', parseInt(data.quantity) || 1);
      formData.append('location', data.location);
      
      // Add image file
      formData.append('imageUrl', imageFile);

      console.log('🔄 Submitting product data...', {
        sellername: data.sellername,
        price: data.price,
        phonenumber: data.phonenumber,
        description: data.description,
        quantity: data.quantity,
        location: data.location,
        imageFile: imageFile ? imageFile.name : 'No file'
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/seller`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 15000
      });
      
      if (response.data) {
        console.log('✅ Product listed successfully:', response.data);
        
        // Update post status
        setPostStatus(prev => ({
          ...prev,
          usedPosts: prev.usedPosts + 1,
          remainingPosts: prev.remainingPosts - 1,
          needsPayment: prev.remainingPosts - 1 <= 0
        }));
        
        // Show success and reset form
        setUploadError('Product listed successfully!');
        reset();
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
    } catch (err) {
      console.error('Product submission error:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setUploadError('Session expired. Please log in again.');
          navigate('/login');
        } else if (err.response.status === 402) {
          setUploadError('Payment required. Please upgrade to post more products.');
          setShowPaymentModal(true);
        } else {
          setUploadError(err.response.data?.error || 'Submission failed. Please try again.');
        }
      } else {
        setUploadError('Network error. Please check your connection.');
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
            
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-5 text-white mb-6">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Get 10 Additional Posts</p>
                <div className="flex items-center justify-center gap-2">
                  <FaDollarSign className="text-xl" />
                  <span className="text-3xl font-bold">10</span>
                  <span className="text-lg">NGN</span>
                </div>
                <p className="text-sm opacity-90 mt-1">≈ $0.01 USD</p>
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
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Payment status message */}
            {uploadError && (
              <div className={`mt-4 p-3 rounded-lg ${
                uploadError.includes('successful') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {uploadError.includes('successful') ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaExclamationTriangle className="text-red-500" />
                  )}
                  <span className="text-sm font-medium">{uploadError}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (authLoading) {
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
                  {postStatus.remainingPosts} of {postStatus.totalPosts} posts remaining
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
        </div>

        {/* User Welcome Message */}
        {isAuthenticated && authUser && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl" />
              <div>
                <h3 className="font-semibold text-green-800">Welcome, {authUser.name || 'User'}!</h3>
                <p className="text-green-600 text-sm">You are successfully authenticated and can list your products.</p>
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
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'seller'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('seller')}
              >
                <div className="flex items-center justify-center gap-2">
                  <IoIosPeople />
                  Seller Information
                </div>
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'product'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('product')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaBoxes />
                  Product Details
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {/* Seller Information Tab */}
              {activeTab === 'seller' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Seller Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <IoIosPeople className="text-indigo-500" />
                          Seller Name *
                        </div>
                      </label>
                      <input
                        type="text"
                        {...register('sellername', { required: 'Seller name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your name or business name"
                      />
                      {errors.sellername && (
                        <p className="mt-1 text-sm text-red-600">{errors.sellername.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-indigo-500" />
                          Phone Number *
                        </div>
                      </label>
                      <input
                        type="tel"
                        {...register('phonenumber', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your phone number"
                      />
                      {errors.phonenumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phonenumber.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaLocationArrow className="text-indigo-500" />
                          Location *
                        </div>
                      </label>
                      <input
                        type="text"
                        {...register('location', { required: 'Location is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your location (city, area, etc.)"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details Tab */}
              {activeTab === 'product' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Product Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaClipboard className="text-indigo-500" />
                          Description *
                        </div>
                      </label>
                      <textarea
                        {...register('description', { 
                          required: 'Description is required',
                          minLength: {
                            value: 10,
                            message: 'Description should be at least 10 characters'
                          }
                        })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Describe your product in detail..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-indigo-500" />
                          Price (NGN) *
                        </div>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price', { 
                          required: 'Price is required',
                          min: {
                            value: 1,
                            message: 'Price must be at least ₦1'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaBoxes className="text-indigo-500" />
                          Quantity *
                        </div>
                      </label>
                      <input
                        type="number"
                        {...register('quantity', { 
                          required: 'Quantity is required',
                          min: {
                            value: 1,
                            message: 'Quantity must be at least 1'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="1"
                        defaultValue={1}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                      )}
                    </div>

                    {/* Image Upload - Fixed Styling */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <IoMdImages className="text-indigo-500" />
                          Product Image *
                        </div>
                      </label>
                      
                      <div 
                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img 
                              src={imagePreview} 
                              alt="Product preview" 
                              className="mx-auto max-h-48 rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={resetImage}
                              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                            >
                              <FaRedo />
                              Change Image
                            </button>
                          </div>
                        ) : (
                          <div>
                            <IoMdCloudUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-2">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-gray-500 text-sm">
                              PNG, JPG, JPEG (Max 5MB)
                            </p>
                          </div>
                        )}
                        {/* File input positioned to cover entire drop zone */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      {uploadError && !uploadError.includes('successfully') && (
                        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('seller')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'product'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'invisible'
                  }`}
                >
                  Previous
                </button>

                {activeTab === 'seller' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('product')}
                    className="ml-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    Next
                    <FaLocationArrow className="text-sm" />
                  </button>
                ) : (
                  <div className="ml-auto space-x-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('seller')}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !imageFile}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Listing...
                        </>
                      ) : (
                        <>
                          <IoMdCloudUpload />
                          List Product
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Success Message */}
              {uploadError && uploadError.includes('successfully') && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-xl" />
                    <div>
                      <p className="font-semibold text-green-800">Success!</p>
                      <p className="text-green-600 text-sm">{uploadError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at support@shopspher.com
          </p>
        </div>
      </div>
      <PaymentModal />
    </div>
  );
};

export default Register;

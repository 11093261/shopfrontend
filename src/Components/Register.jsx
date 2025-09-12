import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IoIosBusiness, IoIosPeople, IoMdCloudUpload, IoMdImages } from 'react-icons/io';
import { FaStore, FaPhone, FaDollarSign, FaBoxes, FaClipboard, FaLocationArrow } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { FaCrown, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

const FREE_POST_LIMIT = 10;
const POSTS_PER_PAYMENT = 10;
const PAYMENT_AMOUNT = 100; 

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Register = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('seller');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [postStatus, setPostStatus] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentInitializing, setPaymentInitializing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    const cancel = urlParams.get('cancel');
    
    if (cancel) {
      setPaymentInProgress(false);
      setPaymentInitializing(false);
      setPaymentError('Payment was cancelled');
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (reference || trxref) {
      const paymentRef = reference || trxref;
      // Check if payment was already processed using sessionStorage instead of localStorage
      const processedPayments = JSON.parse(sessionStorage.getItem('processedPayments') || '[]');
      if (!processedPayments.includes(paymentRef)) {
        setPaymentReference(paymentRef);
        verifyPayment(paymentRef);
      } else {
        setPaymentInProgress(false);
        checkPostStatus();
      }
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      checkPostStatus();
    }
  }, [location]);

  const verifyPayment = async (reference) => {
     try {
      setVerifyingPayment(true);
      setVerificationStatus('verifying');
      setVerificationMessage('Verifying your payment...');
      setPaymentError(null);
      
      // Use getCookie instead of localStorage
      const token = getCookie("token");
      
      if (!token) {
        setVerificationStatus('error');
        setPaymentError('Authentication error. Please log in again.');
        setVerifyingPayment(false);
        timeoutRef.current = setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Please log in to verify your payment',
              returnUrl: location.pathname + location.search
            } 
          });
        }, 3000);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:3200/api/payment/verify/${reference}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
          withCredentials: true // Include cookies in the request
        }
      );
      
      if (response.data.success) {
        // Use sessionStorage for temporary storage instead of localStorage
        const processedPayments = JSON.parse(sessionStorage.getItem('processedPayments') || '[]');
        processedPayments.push(reference);
        sessionStorage.setItem('processedPayments', JSON.stringify(processedPayments));
        
        setVerificationStatus('success');
        setPaymentSuccess(true);
        setPaymentInProgress(false);
        setVerificationMessage('Payment verified successfully! You can now continue listing products.');
        
        await checkPostStatus();
        timeoutRef.current = setTimeout(() => {
          setPaymentRequired(false);
          navigate('/Register', { 
            state: { 
              paymentSuccess: true,
              message: `Payment successful! You can now post ${POSTS_PER_PAYMENT} more products.`,
              postsAdded: POSTS_PER_PAYMENT,
              reference: reference
            } 
          });
        }, 500);
      } else {
        setVerificationStatus('error');
        setPaymentError(response.data.error || 'Payment verification failed. Please contact support.');
        setPaymentInProgress(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('error');
      
      if (error.code === 'ECONNABORTED') {
        setPaymentError('Verification timeout. Please check your connection and try again.');
      } else if (error.response) {
        if (error.response.status === 401) {
          setPaymentError('Authentication error. Please log in again.');
          timeoutRef.current = setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Your session has expired. Please log in again.',
                returnUrl: location.pathname + location.search
              } 
            });
          }, 3000);
        } else if (error.response.status === 404) {
          setPaymentError('Payment reference not found. Please contact support with your reference code.');
        } else if (error.response.status >= 500) {
          setPaymentError('Server error. Please try again in a few moments.');
        } else {
          setPaymentError(error.response.data.error || 'Payment verification failed');
        }
      } else if (error.request) {
        setPaymentError('Network error. Please check your connection and try again.');
      } else {
        setPaymentError('An unexpected error occurred. Please try again.');
      }
      setPaymentInProgress(false);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const checkPostStatus = async () => {
    try {
      // Use getCookie instead of localStorage
      const token = getCookie("token");
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await axios.get('http://localhost:3200/api/posts/status', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true // Include cookies in the request
      });
      setPostStatus(response.data);
      setPaymentRequired(response.data.needsPayment);
    } catch (error) {
      console.error('Error checking post status:', error);
      if (error.response && error.response.status === 401) {
        // Remove cookie by setting expiration to past date
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      }
    }
  };

  const initializePayment = async () => {
    if (paymentInitializing || paymentInProgress) return;
    
    try {
      setPaymentInitializing(true);
      setPaymentError(null);
      // Use getCookie instead of localStorage
      const token = getCookie("token");
      
      if (!token) {
        setPaymentError('Authentication error. Please log in again.');
        setPaymentInitializing(false);
        return;
      }
      
      const response = await axios.post(
        'http://localhost:3200/api/payment/initialize',
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true // Include cookies in the request
        }
      );
      
      if (response.data.authorization_url) {
        setPaymentInProgress(true);
        if (response.data.reference) {
          sessionStorage.setItem('pendingPaymentRef', response.data.reference);
        }
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      if (error.response && error.response.status === 400 && 
          error.response.data.error.includes('Payment already in progress')) {
        setPaymentInProgress(true);
        setPaymentError('You already have a payment in progress. Please complete or cancel that payment first.');
      } else if (error.response && error.response.data && error.response.data.error) {
        setPaymentError(error.response.data.error);
      } else {
        setPaymentError('Failed to initialize payment. Please try again.');
      }
      setPaymentInitializing(false);
    }
  };

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
    // Use getCookie instead of localStorage
    return getCookie("token");
  };

  const onSubmit = async (data) => {
    if (paymentRequired) {
      setPaymentError('You need to make a payment before posting more products.');
      setPaymentRequired(true);
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    setPaymentError(null);
    
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'imageUrl') {
          formData.append(key, data[key]);
        }
      });
      
      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        setPaymentError('Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await axios.post('http://localhost:3200/api/seller', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${accessToken}`
        },
        withCredentials: true // Include cookies in the request
      });
      
      console.log(response.data);
      
      navigate("/Register", { 
        state: { 
          postSuccess: true,
          message: 'Product listed successfully!' 
        } 
      });
      reset();
      setImagePreview(null);
      setImageFile(null);
      checkPostStatus();
    } catch (err) {
      if (err.response && err.response.status === 402) {
        setPaymentRequired(true);
        setPaymentError('You have exhausted your available posts. Please make a payment to continue.');
      } else if (err.response && err.response.status === 401) {
        setPaymentError('Authentication error. Please log in again.');
        // Remove cookie by setting expiration to past date
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      } else if (err.response) {
        console.log(err.response.data);
        console.log(err.response.status);
        console.log(err.response.headers);
        if (err.response.status === 500) {
          setUploadError('Server error. Please try again later.');
        }
      } else {
        console.log(`Error: ${err.message}`);
        setUploadError('Network error. Please check your connection.');
      }
    } 
    setIsSubmitting(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'buyer') {
      navigate("/Home");
    }
  };

  const handleGoHome = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigate('/Home');
  };

  const handleRetry = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVerificationStatus('verifying');
    setVerificationMessage('Verifying your payment...');
    setPaymentError(null);
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Payment Verification Issue');
    const body = encodeURIComponent(`Hello,\n\nI'm having trouble verifying my payment.\nReference Code: ${paymentReference}\n\nPlease assist.`);
    window.open(`mailto:support@yourcompany.com?subject=${subject}&body=${body}`, '_blank');
  };
  
  const PaymentErrorNotification = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Error</h3>
          <p className="text-gray-600 mb-4">
            {paymentError}
          </p>
          <button
            onClick={() => setPaymentError(null)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
  
  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {paymentInProgress ? 'Payment In Progress' : 'Payment Required'}
        </h3>
        <p className="text-gray-600 mb-6">
          {paymentInProgress 
            ? 'You have a payment in progress. Please complete that payment first.'
            : `You have exhausted your free posts. Please pay ₦${PAYMENT_AMOUNT} to post ${POSTS_PER_PAYMENT} more products.`
          }
        </p>
        {paymentError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {paymentError}
          </div>
        )}
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setPaymentRequired(false);
              setPaymentInProgress(false);
              setPaymentError(null);
            }}
            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
          {!paymentInProgress && (
            <button
              onClick={initializePayment}
              disabled={paymentInitializing}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
            >
              {paymentInitializing ? 'Processing...' : `Pay ₦${PAYMENT_AMOUNT}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
  
  const PaymentVerificationNotification = () => {
    if (verificationStatus === 'verifying') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment</h3>
              <p className="text-gray-600 mb-6">
                {verificationMessage}
              </p>
              {paymentReference && (
                <p className="text-xs text-gray-500">Reference: {paymentReference}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                {verificationMessage}
              </p>
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-green-800 text-sm">
                  You can now post {POSTS_PER_PAYMENT} more products
                </p>
              </div>
              <button
                onClick={() => {
                  setVerificationStatus('idle');
                  setPaymentSuccess(false);
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Continue Listing Products
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Verification Failed</h3>
              <p className="text-gray-600 mb-4">{paymentError}</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Try Again
                </button>
                <button
                  onClick={handleGoHome}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };
  
  const PostStatusInfo = () => {
    if (!postStatus) return null;
    
    return (
      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Your Posting Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Total Posts:</span>
            <p className="font-bold">{postStatus.postsCount}</p>
          </div>
          {postStatus.remainingFreePosts > 0 && (
            <div>
              <span className="text-sm text-gray-600">Free Posts Left:</span>
              <p className="font-bold text-green-600">{postStatus.remainingFreePosts}</p>
            </div>
          )}
          {postStatus.remainingPaidPosts > 0 && (
            <div>
              <span className="text-sm text-gray-600">Paid Posts Left:</span>
              <p className="font-bold text-blue-600">{postStatus.remainingPaidPosts}</p>
            </div>
          )}
        </div>
        {postStatus.needsPayment && (
          <button
            onClick={() => setPaymentRequired(true)}
            className="mt-3 w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600"
          >
            Purchase More Posts
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {paymentRequired && <PaymentModal />}
      {(verifyingPayment || verificationStatus !== 'idle') && <PaymentVerificationNotification />}
      {paymentError && <PaymentErrorNotification />}
      
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/Home')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <IoIosPeople className="mr-2" />
          Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-500 w-16 h-16 text-white p-3 rounded-full mb-4">
            <FaCrown className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Join Our Marketplace</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Become a seller on our platform and reach thousands of customers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => handleTabChange('seller')}
              className={`px-8 py-4 flex items-center gap-3 font-medium transition-colors ${
                activeTab === 'seller' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <IoIosPeople className="text-xl" />
              <span>I'm a Seller</span>
            </button>
            
            <button
              onClick={() => handleTabChange('buyer')}
              className={`px-8 py-4 flex items-center gap-3 font-medium transition-colors ${
                activeTab === 'buyer' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <IoIosBusiness className="text-xl" />
              <span>I'm a Buyer</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Product Listing</h2>
              <p className="text-gray-600 mt-2">Fill in your product details to start selling</p>
            </div>
            <PostStatusInfo />
            {uploadError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                {uploadError}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaStore className="mr-2 text-indigo-600" />
                  Seller Name
                </label>
                <input
                  {...register("sellername", { required: "Seller name is required" })}
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.sellername ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter your business name"
                />
                {errors.sellername && (
                  <p className="mt-1 text-red-500 text-sm">{errors.sellername.message}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaPhone className="mr-2 text-indigo-600" />
                  Phone Number
                </label>
                <input
                  {...register("phonenumber", { 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: "Enter a valid 11-digit phone number"
                    }
                  })}
                  type="tel"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phonenumber ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter your phone number"
                />
                {errors.phonenumber && (
                  <p className="mt-1 text-red-500 text-sm">{errors.phonenumber.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FaDollarSign className="mr-2 text-indigo-600" />
                    Price (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      {...register("price", { 
                        required: "Price is required",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Enter a valid price"
                        }
                      })}
                      type="number"
                      className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter product price"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-red-500 text-sm">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FaLocationArrow className="mr-2 text-indigo-600" />
                    Location
                  </label>
                  <div className="relative">
                    <input
                      {...register("location", { 
                        required: "Location is required",
                      })}
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter location"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-red-500 text-sm">{errors.location.message}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FaBoxes className="mr-2 text-indigo-600" />
                    Quantity
                  </label>
                    <input
                      {...register("quantity", { 
                        required: "Quantity is required",
                        min: {
                          value: 1,
                          message: "Quantity must be at least 1"
                        }
                      })}
                      type="number"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.quantity ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Enter available quantity"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-red-500 text-sm">{errors.quantity.message}</p>
                    )}
                </div>
              </div>
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaClipboard className="mr-2 text-indigo-600" />
                  Product Description
                </label>
                <textarea
                  {...register("description", { 
                    required: "Description is required",
                    minLength: {
                      value: 20,
                      message: "Description must be at least 20 characters"
                    }
                  })}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Describe your product in detail"
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <IoMdImages className="mr-2 text-indigo-600" />
                  Product Image
                </label>
                
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 overflow-hidden flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <IoMdCloudUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Preview will appear here</p>
                        </div>
                      )}
                    </div> 
                  </div>
                  <div className="w-full md:w-2/3">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <IoMdCloudUpload className="text-4xl text-gray-400 mb-2" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          name="imageUrl"
                          className="hidden"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                    </div>
                    {!imageFile && !uploadError && (
                      <p className="mt-2 text-red-500 text-sm">Product image is required</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3">Benefits of Selling on Our Platform</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Reach thousands of customers across Nigeria</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="CurrentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Secure payments and fast disbursement</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Marketing support to boost your sales</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Easy inventory management tools</span>
                  </li>
                </ul>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !imageFile || uploadError || paymentRequired}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {paymentRequired ? 'Payment Required' : 
                 isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                 ) : 
                 'List Product on ShopSphere'}
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">50,000+</div>
            <div className="text-gray-600 text-sm">Active Sellers</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">2M+</div>
            <div className="text-gray-600 text-sm">Monthly Customers</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">97%</div>
            <div className="text-gray-600 text-sm">Positive Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">24h</div>
            <div className="text-gray-600 text-sm">Support Response</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;  
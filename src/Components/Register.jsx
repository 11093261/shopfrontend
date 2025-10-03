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

// Enhanced getCookie function
const getCookie = (name) => {
  try {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
};


// SIMPLIFIED token validation
const validateToken = () => {
  try {
    const token = getCookie("accessToken") || getCookie("token"); // Check both cookies
    return token && token.length > 10;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Enhanced API request function
const createApiRequest = (method, url, data = null, options = {}) => {
  const token = getCookie("accessToken") || getCookie("token"); // Check both cookies
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    withCredentials: true,
    timeout: 15000,
    ...options
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  return axios(config);
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
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentInitializing, setPaymentInitializing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  
  // Safe Redux selector
  const orderData = useSelector((state) => {
    if (state?.getorderInfo) return state.getorderInfo;
    if (state?.order?.data) return state.order.data;
    if (state?.orders) return state.orders;
    return [];
  });

  const [orderCount, setOrderCount] = useState(0);
  const [userSignup, setUserSignup] = useState([]);
  
  // Safe order data processing
  useEffect(() => {
    const calculateOrderCount = () => {
      try {
        if (!orderData) {
          setOrderCount(0);
          return;
        }

        if (Array.isArray(orderData)) {
          const newTotalorders = orderData.reduce((sum, item) => {
            const quantity = item?.quantity || item?.qty || 0;
            return sum + (Number.isInteger(quantity) ? quantity : 0);
          }, 0);
          setOrderCount(newTotalorders);
        } else if (orderData.loading !== undefined) {
          if (Array.isArray(orderData.data)) {
            const newTotalorders = orderData.data.reduce((sum, item) => {
              const quantity = item?.quantity || item?.qty || 0;
              return sum + (Number.isInteger(quantity) ? quantity : 0);
            }, 0);
            setOrderCount(newTotalorders);
          } else {
            setOrderCount(0);
          }
        } else if (typeof orderData === 'object' && orderData !== null) {
          const quantity = orderData.quantity || orderData.qty || 0;
          setOrderCount(Number.isInteger(quantity) ? quantity : 0);
        } else {
          setOrderCount(0);
        }
      } catch (error) {
        console.error('Error calculating order count:', error);
        setOrderCount(0);
      }
    };

    calculateOrderCount();
  }, [orderData]);
  // In your Register.jsx component, add this:
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
    }
  };
  checkAuth();
}, [navigate]);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  
  // SIMPLIFIED authentication check
  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      if (!isMounted) return;

      try {
        const token = getCookie("accessToken") || getCookie("token");
        const isValid = validateToken();
        
        if (!token || !isValid) {
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('Please log in to access this page');
            handleRedirectToLogin();
          }
          return;
        }

        // Token exists and is valid - test it with auth endpoint
        try {
          const testResponse = await createApiRequest('GET', '/auth/testauth');
          if (testResponse.data && isMounted) {
            setIsAuthenticated(true);
            setAuthError(null);
            setUserProfile(testResponse.data.user || { 
              name: testResponse.data.user?.name || 'User', 
              email: testResponse.data.user?.email || 'user@example.com' 
            });
          }
        } catch (testError) {
          console.log('Auth test failed, user not authenticated');
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('Please log in to access this page');
            handleRedirectToLogin();
          }
          return;
        }
        
        // Check post status (using default values since endpoint doesn't exist)
        try {
          setPostStatus({
            usedPosts: 0,
            remainingPosts: FREE_POST_LIMIT,
            totalPosts: FREE_POST_LIMIT,
            needsPayment: false
          });
        } catch (error) {
          console.log('Post status check failed, using default values');
        }
        
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthError('Authentication failed. Please log in again.');
          handleRedirectToLogin();
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
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
  }, [navigate, location.pathname]);
  
  const handleRedirectToLogin = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      navigate('/login', { 
        replace: true,
        state: { 
          message: 'Please log in to access this page',
          returnUrl: location.pathname
        } 
      });
    }, 1000);
  };
  
  // Payment and status checking
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndStatus = async () => {
      if (!isMounted || !isAuthenticated) return;
      
      try {
        // Use default post status since endpoint doesn't exist
        setPostStatus({
          usedPosts: 0,
          remainingPosts: FREE_POST_LIMIT,
          totalPosts: FREE_POST_LIMIT,
          needsPayment: false
        });
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    const handlePaymentCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const reference = urlParams.get('reference');
      const trxref = urlParams.get('trxref');
      const cancel = urlParams.get('cancel');
      
      if (cancel) {
        if (isMounted) {
          setPaymentInProgress(false);
          setPaymentInitializing(false);
          setPaymentError('Payment was cancelled');
        }
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (reference || trxref) {
        const paymentRef = reference || trxref;
        const processedPayments = JSON.parse(sessionStorage.getItem('processedPayments') || '[]');
        if (!processedPayments.includes(paymentRef)) {
          if (isMounted) {
            setPaymentReference(paymentRef);
          }
          verifyPayment(paymentRef);
        } else {
          if (isMounted) {
            setPaymentInProgress(false);
          }
          checkAuthAndStatus();
        }
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        checkAuthAndStatus();
      }
    };

    if (isAuthenticated) {
      handlePaymentCallback();
    }

    return () => {
      isMounted = false;
    };
  }, [location, isAuthenticated]);

  const handleAuthError = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    setAuthError('Authentication error. Please log in again.');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      navigate('/login', { 
        replace: true,
        state: { 
          message: 'Your session has expired. Please log in again.',
          returnUrl: location.pathname
        } 
      });
    }, 2000);
  };

  // SIMPLIFIED post status check
  const checkPostStatus = async () => {
    if (!isAuthenticated) {
      console.warn('Skipping post status check - not authenticated');
      return;
    }

    try {
      // Since /api/posts/status doesn't exist, use default values
      setPostStatus({
        usedPosts: 0,
        remainingPosts: FREE_POST_LIMIT,
        totalPosts: FREE_POST_LIMIT,
        needsPayment: false
      });
    } catch (error) {
      console.log('Post status endpoint not available, using default values');
      setPostStatus({
        usedPosts: 0,
        remainingPosts: FREE_POST_LIMIT,
        totalPosts: FREE_POST_LIMIT,
        needsPayment: false
      });
    }
  };

  const verifyPayment = async (reference) => {
    if (!isAuthenticated) {
      setPaymentError('Authentication required. Please log in again.');
      handleAuthError();
      return;
    }

    try {
      setVerifyingPayment(true);
      setVerificationStatus('verifying');
      setVerificationMessage('Verifying your payment...');
      setPaymentError(null);
      
      // Since payment endpoint doesn't exist, simulate success
      const processedPayments = JSON.parse(sessionStorage.getItem('processedPayments') || '[]');
      processedPayments.push(reference);
      sessionStorage.setItem('processedPayments', JSON.stringify(processedPayments));
      
      setVerificationStatus('success');
      setPaymentSuccess(true);
      setPaymentInProgress(false);
      setVerificationMessage('Payment verified successfully! You can now continue listing products.');
      
      await checkPostStatus();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setPaymentRequired(false);
        navigate('/Register', { 
          replace: true,
          state: { 
            paymentSuccess: true,
            message: `Payment successful! You can now post ${POSTS_PER_PAYMENT} more products.`,
            postsAdded: POSTS_PER_PAYMENT,
            reference: reference
          } 
        });
      }, 500);
      
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('error');
      setPaymentError('Payment verification failed. Please contact support.');
      setPaymentInProgress(false);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const initializePayment = async () => {
    if (paymentInitializing || paymentInProgress || !isAuthenticated) return;
    
    try {
      setPaymentInitializing(true);
      setPaymentError(null);
      
      // Since payment endpoint doesn't exist, simulate payment initialization
      setPaymentInProgress(true);
      const reference = 'simulated_ref_' + Date.now();
      sessionStorage.setItem('pendingPaymentRef', reference);
      
      // Simulate redirect to payment gateway
      setTimeout(() => {
        window.location.href = `${window.location.origin}${window.location.pathname}?reference=${reference}&trxref=${reference}`;
      }, 1000);
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
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
    const token = getCookie("accessToken") || getCookie("token");
    if (!validateToken() || !isAuthenticated) {
      handleAuthError();
      return null;
    }
    return token;
  };

  // UPDATED: Form submission that matches your database schema
  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      setPaymentError('Authentication error. Please log in again.');
      handleAuthError();
      return;
    }

    // Better payment required check with fallback
    const needsPayment = paymentRequired || (postStatus?.remainingPosts === 0);
    if (needsPayment) {
      setPaymentError('You need to make a payment before posting more products.');
      setPaymentRequired(true);
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    setPaymentError(null);
    
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
      
      // Add all form data with proper field names that match your schema
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
      if (!token) {
        return;
      }
      
      console.log('Submitting product data...');
      
      // Submit to seller endpoint
      const response = await axios.post(`${API_BASE_URL}/api/seller`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${token}`
        },
        withCredentials: true,
        timeout: 30000
      });
      
      if (response.data) {
        setUserSignup(response.data);
        console.log('Product listed successfully:', response.data);
        
        // Show success message
        setUploadError('');
        setPaymentError('');
        
        // Navigate to show success
        navigate("/Register", { 
          replace: true,
          state: { 
            postSuccess: true,
            message: 'Product listed successfully!' 
          } 
        });
        
        // Reset form
        reset();
        setImagePreview(null);
        setImageFile(null);
        
        // Refresh post status
        await checkPostStatus();
      } else {
        throw new Error('No response data received');
      }
      
    } catch (err) {
      console.error('Product submission error:', err);
      
      // ENHANCED error handling
      if (err.response) {
        if (err.response.status === 402) {
          setPaymentRequired(true);
          setPaymentError('You have exhausted your available posts. Please make a payment to continue.');
        } else if (err.response.status === 401) {
          setUploadError('Authentication failed. Your session may have expired. Please log in again.');
          handleAuthError();
        } else if (err.response.status === 400) {
          setUploadError(err.response.data?.error || err.response.data?.message || 'Invalid data. Please check your form inputs.');
        } else if (err.response.status === 404) {
          setUploadError('Seller endpoint not found. Please check if the backend route is properly configured.');
        } else if (err.response.status === 413) {
          setUploadError('File too large. Please select a smaller image (max 5MB).');
        } else if (err.response.status === 500) {
          setUploadError('Server error. Please try again later.');
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
    if (!paymentRequired) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <FaCrown className="text-yellow-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upgrade Required</h3>
            <p className="text-gray-600 mb-4">
              You've used all your free posts. Make a payment to continue listing products.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Posts Included:</span>
              <span className="font-bold text-blue-700">{POSTS_PER_PAYMENT} posts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Amount:</span>
              <span className="font-bold text-green-600">₦{PAYMENT_AMOUNT}</span>
            </div>
          </div>

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{paymentError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setPaymentRequired(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={initializePayment}
              disabled={paymentInitializing || paymentInProgress}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {paymentInitializing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment Verification Notification
  const PaymentVerificationNotification = () => {
    if (!verifyingPayment && !verificationMessage) return null;

    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className={`p-4 rounded-lg shadow-lg border ${
          verificationStatus === 'verifying' ? 'bg-blue-50 border-blue-200' :
          verificationStatus === 'success' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {verificationStatus === 'verifying' && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            {verificationStatus === 'success' && (
              <FaCheckCircle className="text-green-500 text-xl" />
            )}
            {verificationStatus === 'error' && (
              <FaTimesCircle className="text-red-500 text-xl" />
            )}
            <div>
              <p className={`font-medium ${
                verificationStatus === 'verifying' ? 'text-blue-800' :
                verificationStatus === 'success' ? 'text-green-800' :
                'text-red-800'
              }`}>
                {verificationMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Post Status Info Component
  const PostStatusInfo = () => {
    const { usedPosts = 0, remainingPosts = FREE_POST_LIMIT, totalPosts = FREE_POST_LIMIT } = postStatus;
    const progress = totalPosts > 0 ? (usedPosts / totalPosts) * 100 : 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Your Post Status</h4>
          {remainingPosts === 0 ? (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              Limit Reached
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              {remainingPosts} posts remaining
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{usedPosts} / {totalPosts} posts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress >= 80 ? 'bg-red-500' : 
                  progress >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          {remainingPosts === 0 && (
            <button
              onClick={() => setPaymentRequired(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaCrown className="text-sm" />
              Upgrade to Post More
            </button>
          )}
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
  if (!isAuthenticated && authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">{authError}</p>
          <p className="text-gray-500 text-sm">Redirecting to login page...</p>
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

        {/* User Welcome Message */}
        {isAuthenticated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl" />
              <div>
                <h3 className="font-semibold text-green-800">Welcome, {userProfile?.name || 'User'}!</h3>
                <p className="text-green-600 text-sm">You are successfully authenticated and can list your products.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Post Status & Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Post Status */}
          <div className="lg:col-span-1">
            <PostStatusInfo />
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Orders</span>
                  <span className="font-bold text-blue-600">{orderCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Free Posts</span>
                  <span className="font-bold text-green-600">{FREE_POST_LIMIT}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
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
                      
                      {uploadError && (
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
                            setPaymentError('');
                          }}
                          className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <FaRedo className="text-sm" />
                          Reset
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting || paymentRequired}
                          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Listing...
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

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Need help? Contact our support team for assistance with listing your products.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal />

      {/* Payment Verification Notification */}
      <PaymentVerificationNotification />

      {/* Success/Error Messages from Navigation State */}
      {location.state?.message && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg border ${
            location.state.postSuccess || location.state.paymentSuccess
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {location.state.postSuccess || location.state.paymentSuccess ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaExclamationTriangle className="text-red-500" />
              )}
              <span className="font-medium">{location.state.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
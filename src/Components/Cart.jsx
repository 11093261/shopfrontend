import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from './Cartcontext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FaPhone, FaDollarSign, FaBoxes, FaClipboard, FaLocationArrow, FaCrown, FaCheckCircle, FaExclamationTriangle, FaRedo, FaCreditCard } from 'react-icons/fa';

const Cart = () => {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal < 0 ? 0 : 50;
    const tax = subtotal * 0.001;
    const total = subtotal + shippingFee + tax;

    setBreakdown({
      subtotal,
      shippingFee,
      tax,
      total
    });
  }, [cart]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check authentication first
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login...');
        navigate('/login', { 
          replace: true,
          state: { from: '/cart' } // Store where they came from
        });
        return; // Stop execution here
      }

      // Validate email
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate cart
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Validate cart items
      const invalidItems = cart.filter(item => !item._id || !item.price);
      if (invalidItems.length > 0) {
        throw new Error(`Invalid product data in ${invalidItems.length} item(s)`);
      }

      // Prepare order data
      const orderData = {
        cartItems: cart.map(item => ({
          productId: item._id,
          sellername: item.sellername,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl || null
        })),
        shippingAddress: {
          fullName: authUser?.name || "",
          email: email,
          address: '',
          city: '',
          state: '',
          country: ''
        },
        paymentMethod: 'paystack',
        subtotal: breakdown.subtotal,
        shippingFee: breakdown.shippingFee,
        tax: breakdown.tax,
        total: breakdown.total,
        userId: authUser?.userId // Include user ID from auth context
      };

      console.log('Sending order data:', orderData);

      // Make API call to create order
      const orderResponse = await axios.post(
        `${API_BASE_URL}/api/orders/postorders`,
        orderData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order created successfully:', orderResponse.data);

      // Navigate to Order page with data
      navigate('/order', { 
        state: { 
          cartItems: cart, 
          order: orderResponse.data 
        } 
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Checkout failed');
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        navigate('/login', { 
          state: { from: '/cart' }
        });
      }
    } finally {
      setLoading(false);
    }
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

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto p-4">
          <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">Please log in to proceed with checkout.</p>
            <button
              onClick={() => navigate('/login', { state: { from: '/cart' } })}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <FaBoxes className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md mb-6">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center p-6 border-b last:border-b-0">
                  <div className="flex items-center flex-1">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        e.target.className = 'w-20 h-20 object-cover rounded-lg bg-gray-200';
                      }}
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{item.sellername}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      <p className="text-indigo-600 font-bold mt-2">₦{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item._id, item.quantity - 1);
                          } else {
                            removeFromCart(item._id);
                          }
                        }}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 bg-gray-50 min-w-12 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors"
                      title="Remove item"
                    >
                      <FaExclamationTriangle />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                <FaClipboard className="mr-2 text-indigo-600" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₦{breakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span>₦{breakdown.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (0.1%):</span>
                  <span>₦{breakdown.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-800 mt-4 pt-4 border-t">
                  <span>Total:</span>
                  <span>₦{breakdown.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-indigo-600" />
                Checkout Information
              </h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for order confirmation"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0 || !email}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="mr-2" />
                    Proceed to Checkout - ₦{breakdown.total.toFixed(2)}
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-3 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from './Cartcontext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FaPhone, FaDollarSign, FaBoxes, FaClipboard, FaLocationArrow, FaCrown, FaCheckCircle, FaExclamationTriangle, FaRedo, FaCreditCard } from 'react-icons/fa';
const Cart = () => {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  console.log(cart)
  const navigate = useNavigate();
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
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }
      
      if (cart.length > 0) {
        console.log(cart.length)
        console.log("your cart items ", cart.length);
      }else{
        throw new Error(`invalid product data in ${cart.length} items(s)`)
      }
     if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
      
      const orderData = {
        cartItems: cart.map(item => ({
          productId: item._id,
          sellername:item.sellername,
          description:item.description,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl || null
        })),
        shippingAddress: {
          fullName:"",
          email:"",
          address: '',
          city: '',
          state: '',
          country: ''
        },
        paymentMethod: 'paystack',
        subtotal: breakdown.subtotal,
        shippingFee: breakdown.shippingFee,
        tax: breakdown.tax,
        total: breakdown.total
      };
      console.log(orderData)
      const orderResponse = await axios.post(
        `${API_BASE_URL}/api/orders/postorders`,orderData,{
          withCredentials:true
        });
      console.log({cartItems:cart,order:orderResponse.data})
      navigate('/Order', { state: {cartItems:cart, order: orderResponse.data } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };
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
    <div className="container mx-auto p-4">
      {cart.map(item => (
        <div key={item._id} className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <img 
              src={item.imageUrl} 
              alt={item.name } 
              className="w-20 h-20 object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
            />
            <div className="ml-4">
              <h3 className="font-medium">{item.sellername}</h3>
              <p>{item.description}</p>
              <p>₦{item.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (item.quantity > 1) {
                  updateQuantity(item._id, item.quantity - 1);
                } else {
                  removeFromCart(item._id);
                }
              }}
              className="px-3 py-1 bg-gray-200"
            >
              -
            </button>
            <span className="px-3">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              className="px-3 py-1 bg-gray-200"
            >
              +
            </button>
            <button 
              onClick={() => removeFromCart(item._id)}
              className="ml-4 text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="mt-6 p-4 bg-gray-50">
        <h3 className="font-bold text-lg">Order Summary</h3>
        <div className="mt-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₦{breakdown.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>₦{breakdown.shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₦{breakdown.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>₦{breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          required
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
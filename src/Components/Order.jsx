import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CartContext } from './Cartcontext';
import { fetchShippingAddress } from '../Components/Shipping'; // Adjust the import path

const Order = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const { cart } = useContext(CartContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  // const OldApi = "http://localhost:3200/api/orders/postorders"
  
  // Get shipping data from Redux store
  const { 
    loading: shippingLoading, 
    data: shippingData, 
    selectedShipping: shippingAddress,
    error: shippingError 
  } = useSelector((state) => state.shipping);

  const [breakdown, setBreakdown] = useState({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    dispatch(fetchShippingAddress());
  }, [dispatch]);

  useEffect(() => {
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = subtotal > 0 ? 50 : 0;
      const tax = subtotal * 0.1;
      const total = subtotal + shippingFee + tax;
      
      setBreakdown({
        subtotal,
        shippingFee,
        tax,
        total
      });
    } catch (error) {
      console.error("Error calculating order breakdown:", error);
      setError("Failed to calculate order totals");
    }
  }, [cart]);

  // Function to handle authentication errors
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      navigate("/login");
      return "Authentication failed. Please login again.";
    } else if (error.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }
    return error.response?.data?.message || "An error occurred";
  };

  const handlePlaceOrder = async () => { 
    try {
      setIsPlacingOrder(true);
      
      // Use the shipping address from Redux store
      const currentShippingAddress = shippingAddress;
      
      if (!isValidAddress(currentShippingAddress)) {
        setError("Please provide a complete shipping address with full name, street, city, state, ZIP code, and phone number");
        setIsPlacingOrder(false);
        return;
      }
      
      if (!cart || cart.length === 0) {
        setError("Your cart is empty. Please add items before placing an order.");
        setIsPlacingOrder(false);
        return;
      }
      
      const orderPayload = {
        cartItems: cart.map(item => ({
          productId: item._id || item.id,
          sellername: item.sellername || item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.imageUrl
        })),
        shippingAddress: currentShippingAddress,
        paymentMethod: "Cash on Delivery",
        subtotal: breakdown.subtotal,
        shippingFee: breakdown.shippingFee,
        tax: breakdown.tax,
        total: breakdown.total
      };
      
      console.log("Order payload:", orderPayload);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/postorders`,
        orderPayload,
        { withCredentials: true } // Send cookies with the request
      );
      
      setOrderConfirmation({
        id: response.data._id || response.data.id,
        status: response.data.status || 'confirmed',
        items: response.data.items || cart,
        total: response.data.total || breakdown.total,
        shippingAddress: response.data.shippingAddress || currentShippingAddress,
        createdAt: response.data.createdAt || new Date().toISOString()
      });
      
      setError('');
    } catch (err) {
      let errorMessage = "Failed to place order";
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = "Invalid order data. Please check your information.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = handleAuthError(err);
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      console.error("Order submission error:", err.response?.data || err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const isValidAddress = (address) => {
    return address && 
           typeof address === 'object' &&
           address.fullName?.trim() && 
           address.street?.trim() && 
           address.city?.trim() && 
           address.state?.trim() && 
           address.zip?.trim() && 
           address.phone?.trim();
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error && error.message) return error.message;
    if (typeof error === 'object') return JSON.stringify(error);
    return 'An unknown error occurred';
  };

  // Combine loading states
  const isLoadingData = shippingLoading;

  if (isLoadingData && !shippingAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">
          Loading your order information...
        </p>
      </div>
    );
  }

  if (shippingError || error) {
    const displayError = shippingError || error;
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 mb-4 whitespace-pre-line">
          {getErrorMessage(displayError)}
        </p>
        <button
          onClick={() => navigate(id ? '/orders' : '/cart')}
          className="px-5 py-2.5 bg-blue-600 text-white cursor-pointer font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {id ? 'View All Orders' : 'Back to Cart'}
        </button>
      </div>
    );
  }

  if (orderConfirmation) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p>Your order ID: <span className="font-mono">{orderConfirmation.id}</span></p>
          <p className="mt-2">Order Date: <span className="font-medium">{new Date(orderConfirmation.createdAt).toLocaleDateString()}</span></p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600 capitalize">{orderConfirmation.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{orderConfirmation.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-bold">₦{orderConfirmation.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
          
          {orderConfirmation.shippingAddress ? (
            <div className="text-gray-700 space-y-2">
              <p className="font-medium">{orderConfirmation.shippingAddress.fullName}</p>
              <p>{orderConfirmation.shippingAddress.street}</p>
              <p>{orderConfirmation.shippingAddress.city}, {orderConfirmation.shippingAddress.state} {orderConfirmation.shippingAddress.zip}</p>
              <p>Phone: {orderConfirmation.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No shipping address provided</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            className="bg-blue-600 text-white cursor-pointer px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={()=>navigate("/OrderConfirmation")}
          >
            View Order Details
          </button>
          <button
            className="bg-gray-600 text-white px-6 py-3 cursor-pointer rounded-lg hover:bg-gray-700 transition-colors font-medium"
            onClick={() => navigate('/Home')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isAddressValid = isValidAddress(shippingAddress);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Order Review</h1>
      <section className="mb-10 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Items</h2>
        {cart.length > 0 ? (
          <>
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item._id || item.id} className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 rounded-md w-16 h-16 flex items-center justify-center">
                      <img 
                        src={item.imageUrl || '/default-image.png'}
                        alt={item.sellername || item.name} 
                        className="max-w-full max-h-full object-contain rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-image.png';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.sellername || item.name}</p>
                      <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-gray-500 text-sm">Price: ₦{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₦{breakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee:</span>
                <span className="font-medium">₦{breakdown.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium">₦{breakdown.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                <span className="text-gray-800">Total:</span>
                <span className="text-blue-700">₦{breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 italic">Your cart is empty</p>
        )}
      </section>
      <section className="mb-10 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Shipping Address</h2>
          
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            onClick={() => navigate('/ShippingAddress')}
          >
            {shippingAddress ? 'Edit' : 'Add'}
          </button>
        </div>
        
        {isAddressValid ? (
          <div className="text-gray-700 space-y-2">
            <p className="font-medium">{shippingAddress.fullName}</p>
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
            <p>Phone: {shippingAddress.phone}</p>
          </div>
        ) : (
          <div className="text-red-500 italic">
            <p>Please add a complete shipping address</p>
            <p className="text-sm mt-1">(Full name, street, city, state, ZIP, and phone are required)</p>
          </div>
        )}
      </section>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <button 
          className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </button>
        <button 
          className={`${
            isAddressValid && cart.length > 0
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white px-8 py-3 rounded-lg transition-colors font-medium flex items-center justify-center min-w-[140px]`}
          onClick={handlePlaceOrder}
          disabled={!isAddressValid || cart.length === 0 || isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
};

export default Order;
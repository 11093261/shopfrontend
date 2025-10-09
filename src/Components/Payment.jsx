import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethods] = useState(["Paystack", "Flutterwave", "Stripe", "Cash On Delivery"]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  const { 
    shippingAddress, 
    cartItems 
  } = location?.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      if (!selectedPaymentMethod) {
        setError("Please select a payment method");
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/api/orderpayment`, 
        { paymentMethod: selectedPaymentMethod },
        {
          withCredentials: true 
        }
      );
      if (response.data) {
        console.log("Payment method processed:", response.data);
      }

      navigate('/order', { 
        state: { 
          shippingAddress, 
          paymentMethod: selectedPaymentMethod,
          cartItems
        } 
      });

    } catch (error) {
      let errorMessage = "Failed to process payment method";
      6
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Please login to continue";
          navigate('/login');
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid payment method";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div key={method} className="flex items-center">
              <input
                type="radio"
                id={method.toLowerCase().replace(/\s+/g, '-')}
                name="paymentMethod"
                value={method}
                checked={selectedPaymentMethod === method}
                onChange={() => setSelectedPaymentMethod(method)}
                className="h-5 w-5 text-blue-600"
                disabled={loading}
              />
              <label 
                htmlFor={method.toLowerCase().replace(/\s+/g, '-')} 
                className="ml-2 text-gray-700"
              >
                {method}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/shipping', { 
              state: { 
                shippingAddress, 
                cartItems 
              } 
            })}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300"
            disabled={loading}
          >
            Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={!selectedPaymentMethod || loading}
            className={`${
              selectedPaymentMethod && !loading
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[120px]`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Continue to Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Payment;
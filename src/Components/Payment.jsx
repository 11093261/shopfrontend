import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const[paymentMethod,setPaymentMethod] = useState(["Paystack","Flutterwave","Stripe","Cash On Delivery"])
  const { 
    shippingAddress, 
  } = location?.state || {};
  const [error, setError] = useState('');

  const handleSubmit = async(e) => {
    try{
      const token = localStorage.getItem("token")
      e.preventDefault();
      const response = await axios.post("http://localhost:3200/api/orderpayment",{
        header:{
          "Authorization" : `Bearer ${token}`
        }
      })
      setPaymentMethod(response.data)
      
      if (!paymentMethod) {
        setError("Please select a payment method");
        return;
      }
      navigate('/order', { 
        state: { 
          shippingAddress, 
          paymentMethod,
        
        } 
      });

    }catch(error){

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
          <div className="flex items-center">
            <input
              type="radio"
              id="paystack"
              name="paymentMethod"
              value="Paystack"
              checked={paymentMethod === "Paystack"}
              onChange={() => setPaymentMethod("Paystack")}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="paystack" className="ml-2 text-gray-700">
              Paystack
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="flutterwave"
              name="paymentMethod"
              value="Flutterwave"
              checked={paymentMethod === "Flutterwave"}
              onChange={() => setPaymentMethod("Flutterwave")}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="flutterwave" className="ml-2 text-gray-700">
              Flutterwave
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="stripe"
              name="paymentMethod"
              value="Stripe"
              checked={paymentMethod === "Stripe"}
              onChange={() => setPaymentMethod("Stripe")}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="stripe" className="ml-2 text-gray-700">
              Stripe
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="cash"
              name="paymentMethod"
              value="Cash On Delivery"
              checked={paymentMethod === "Cash On Delivery"}
              onChange={() => setPaymentMethod("Cash On Delivery")}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="cash" className="ml-2 text-gray-700">
              Cash On Delivery
            </label>
          </div>
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
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Shipping
          </button>
          <button
            type="submit"
            disabled={!paymentMethod}
            className={`${
              paymentMethod 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-6 py-2 rounded-lg transition-colors`}
          >
            Continue to Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default Payment;
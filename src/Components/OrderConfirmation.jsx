import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from "axios"

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrders] = useState(true);
  const [control, setcontroler] = useState(true);
  const [orderId, setorderId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
  // const oldApi = "http://localhost:3200/api/orders/getorders"

  const handleOrder = () => navigate("/Order");

  useEffect(() => {
    const fetchOrderId = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/api/orders/getorders`, {
          withCredentials: true 
        });
        
        console.log(response.data);
        setorderId(response.data);
        
      } catch (error) {
        let errorMessage = "Failed to fetch order details";
        
        if (error.response) {
          console.log("Error response:", error.response.data);
          console.log("Status:", error.response.status);
          
          if (error.response.status === 401) {
            errorMessage = "Please login to view your orders";
            navigate("/login");
          } else if (error.response.status === 404) {
            errorMessage = "Order not found";
          } else {
            errorMessage = error.response.data?.message || errorMessage;
          }
        } else if (error.request) {
          console.log("Network error:", error.request);
          errorMessage = "Network error. Please check your connection.";
        } else {
          console.log("Error:", error.message);
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };

    fetchOrderId();
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-2xl font-bold text-blue-800 mb-2">Loading Order Details</h3>
        <p className="text-blue-700 mb-4">Please wait while we fetch your order information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <h3 className="text-2xl font-bold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => navigate('/Home')}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md text-center">
      <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <h3 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h3>
      <p className="text-green-700 mb-4">
        Your order has been successfully placed. Order Number: <span className="font-bold">{orderId.orderNumber}</span>
      </p>
     
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate('/Home')}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleOrder}
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          View Order Details
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;

import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from "axios"
const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData,setOrders] = useState(true)
  const [control, setcontroler] = useState(true)
  const handleOrder = () => navigate("/Order")
  const [orderId,setorderId] = useState([])

  const getaccessToken = ()=>{
    return localStorage.getItem("token")
  }

  useEffect(()=>{
    const fetchOrderId = async()=>{
      try{
        const accessToken = getaccessToken()
        const response = await axios.get("http://localhost:3200/api/orders/getorders",{
          headers:{
            "Authorization" : `Bearer ${accessToken}`
          }
        })
        console.log(response.data)
        setorderId(response.data)

      }catch(error){
        if(error.response){
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
        else{
        console.log(`Error:${error.message}`)

        }


      }
    }
    fetchOrderId()

  },[])


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
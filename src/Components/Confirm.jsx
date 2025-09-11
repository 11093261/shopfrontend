
import api from '../utils/api';
const fetchOrderSummary = async () => {
  try {
    const response = await api.get('/orders/summary');
    setOrderData(response.data);
  } catch (error) {
  }
};

try {
  const response = await api.post('/orders', orderData);
  localStorage.setItem('lastOrderId', response.data._id);
  navigate('/confirmation', { state: { order: response.data } });
} catch (error){

}

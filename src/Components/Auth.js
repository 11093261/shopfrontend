import axios from 'axios';

const API_URL = 'http://localhost:3200/auth'; 
const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};
const getUser = async (userId) => {
  const token = JSON.parse(localStorage.getItem('user')).token;
  const response = await axios.get(`${API_URL}/verify/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const authService = {
  login,
  getUser
};

export default authService;
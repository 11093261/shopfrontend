import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
  const navigate = useNavigate();

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null; 
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  const handleAuthError = useCallback((error) => {
    console.error('Auth error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return 'Session expired. Please login again.';
    }
    return error.response?.data?.message || 'Request failed';
  }, [navigate]);

  return { getAuthConfig, handleAuthError };
}
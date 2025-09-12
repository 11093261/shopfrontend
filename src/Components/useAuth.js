import useAuth from './useAuth';
import axios from 'axios';

function MyComponent() {
  const { getAuthConfig, handleAuthError } = useAuth();

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data', getAuthConfig());
      // Handle response
    } catch (error) {
      const errorMessage = handleAuthError(error);
      // Show error message to user
    }
  };
}
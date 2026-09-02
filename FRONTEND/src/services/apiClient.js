// src/services/apiClient.js
import axios from 'axios';
import { BASE_URL } from '../routes/apiRoutes';

/**
 * Axios instance with Base URL configuration and interceptors
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor: Attach JWT Token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Extract data and handle errors gracefully
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const responseData = error.response ? error.response.data : null;
    const message = responseData?.message || error.message || 'An unexpected error occurred';

    // Handle token expiration or unauthorized access
    if (status === 401) {
      // If token expired or invalid (not during login endpoint itself)
      const isLoginRequest = error.config?.url?.includes('/login');
      if (!isLoginRequest) {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.data = responseData;
    enhancedError.rawError = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;

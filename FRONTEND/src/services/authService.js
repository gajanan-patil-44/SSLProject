// src/services/authService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const authService = {
  /**
   * User login with username and password
   * @param {string} username 
   * @param {string} password 
   */
  login: async (username, password) => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, {
      username: username?.trim(),
      password: password
    });

    if (response?.success && response?.token?.accessToken) {
      localStorage.setItem('erp_token', response.token.accessToken);
      localStorage.setItem('erp_user', JSON.stringify(response.data?.user || {}));
      localStorage.setItem('erp_user_context', JSON.stringify(response.data?.context || {}));
      localStorage.setItem('erp_session', JSON.stringify(response.session || {}));
      if (response.photo) {
        localStorage.setItem('erp_photo', response.photo);
      }
    }

    return response;
  },

  /**
   * Logout user and clear stored auth credentials
   */
  logout: () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_user_context');
    localStorage.removeItem('erp_session');
    localStorage.removeItem('erp_photo');
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('erp_token'));
  },

  /**
   * Retrieve active stored JWT token
   */
  getToken: () => {
    return localStorage.getItem('erp_token');
  },

  /**
   * Retrieve active user data
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('erp_user');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve current user context (companies, products, projects, roles)
   */
  getUserContext: () => {
    const context = localStorage.getItem('erp_user_context');
    try {
      return context ? JSON.parse(context) : null;
    } catch {
      return null;
    }
  }
};

export default authService;

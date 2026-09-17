// src/services/authService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const purgeStorage = () => {
  try {
    if (typeof window === 'undefined') return;
    const allowedKeys = new Set(['session', 'erp_theme', 'erp_sidebar_collapsed', 'erp_lang', 'remembered_credentials']);
    if (window.localStorage) {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !allowedKeys.has(key)) toRemove.push(key);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    }
    if (window.sessionStorage) {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !allowedKeys.has(key)) toRemove.push(key);
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch {}
};

export const authService = {
  /**
   * Helper to get parsed session from storage
   */
  getSession: () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * User login with username and password
   * Stores ONLY the unified login response object
   * @param {string} username 
   * @param {string} password 
   */
  login: async (username, password) => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, {
      username: username?.trim(),
      password: password
    });

    if (response?.success && response?.token?.accessToken) {
      // Purge all legacy and mock keys from storage
      purgeStorage();

      // Store ONLY the unified login response object
      localStorage.setItem('session', JSON.stringify(response));
    }

    return response;
  },

  /**
   * Logout user and clear stored auth credentials
   */
  logout: () => {
    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    purgeStorage();
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: () => {
    const session = authService.getSession();
    return Boolean(session?.token?.accessToken);
  },

  /**
   * Retrieve active stored JWT token
   */
  getToken: () => {
    const session = authService.getSession();
    return session?.token?.accessToken || null;
  },

  /**
   * Retrieve active user data
   */
  getCurrentUser: () => {
    const session = authService.getSession();
    return session?.data?.user || null;
  },

  /**
   * Retrieve current user context (companies, products, projects, roles)
   */
  getUserContext: () => {
    const session = authService.getSession();
    return session?.data?.context || null;
  }
};

export default authService;


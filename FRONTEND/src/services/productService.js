// src/services/productService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const productService = {
  /**
   * Get all active products (flagId: 1)
   */
  getProducts: async () => {
    return apiClient.post(API_ROUTES.PRODUCT.GET_PRODUCTS, {
      flagId: 1
    });
  },

  /**
   * Add a new product (flagId: 2)
   * @param {Object} productData 
   */
  addProduct: async (productData) => {
    return apiClient.post(API_ROUTES.PRODUCT.ADD_PRODUCT, {
      flagId: 2,
      ...productData
    });
  },

  /**
   * Update existing product (flagId: 3)
   * @param {Object} productData 
   */
  updateProduct: async (productData) => {
    return apiClient.post(API_ROUTES.PRODUCT.UPDATE_PRODUCT, {
      flagId: 3,
      ...productData
    });
  },

  /**
   * Toggle product status (flagId: 4)
   * @param {Object} statusData 
   */
  toggleProductStatus: async (statusData) => {
    return apiClient.post(API_ROUTES.PRODUCT.TOGGLE_STATUS, {
      flagId: 4,
      ...statusData
    });
  },

  /**
   * Delete / Disable product (flagId: 5)
   * @param {Object} deleteData 
   */
  deleteProduct: async (deleteData) => {
    return apiClient.post(API_ROUTES.PRODUCT.DELETE_PRODUCT, {
      flagId: 5,
      ...deleteData
    });
  }
};

export default productService;

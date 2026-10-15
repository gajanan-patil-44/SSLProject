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
      ProductCode: productData.ProductCode || productData.productCode || '',
      ProductName: productData.ProductName || productData.productName || '',
      ProductDescription: productData.ProductDescription ?? productData.Description ?? productData.description ?? '',
      IsDisabled: typeof productData.IsDisabled === 'boolean'
        ? productData.IsDisabled
        : (productData.IsDisabled === 'true' || productData.IsDisabled === 'Inactive' || productData.IsDisabled === 'Disabled' || productData.status === 'Inactive' || false),
      CreatedByUserName: productData.CreatedByUserName || '',
      UpdatedByUserName: productData.UpdatedByUserName || ''
    });
  },

  /**
   * Update existing product (flagId: 3)
   * @param {Object} productData 
   */
  updateProduct: async (productData) => {
    return apiClient.patch(API_ROUTES.PRODUCT.UPDATE_PRODUCT, {
      flagId: 3,
      ProductId: Number(productData.ProductId ?? productData.id),
      ProductCode: productData.ProductCode || productData.productCode || '',
      ProductName: productData.ProductName || productData.productName || '',
      ProductDescription: productData.ProductDescription ?? productData.Description ?? productData.description ?? '',
      UpdatedByUserName: productData.UpdatedByUserName || ''
    });
  },

  /**
   * Toggle product status (flagId: 4)
   * @param {Object} statusData 
   */
  toggleProductStatus: async (statusData) => {
    const isDisabled = typeof statusData.IsDisabled === 'boolean'
      ? statusData.IsDisabled
      : (statusData.IsDisabled === 'true' || statusData.IsDisabled === 'Inactive' || statusData.IsDisabled === 'Disabled' || statusData.status === 'Inactive');

    return apiClient.patch(API_ROUTES.PRODUCT.TOGGLE_STATUS, {
      flagId: 4,
      ProductId: Number(statusData.ProductId ?? statusData.id),
      IsDisabled: Boolean(isDisabled),
      UpdatedByUserName: statusData.UpdatedByUserName || ''
    });
  },

  /**
   * Delete / Disable product (flagId: 5)
   * @param {number|string|Object} productData 
   */
  deleteProduct: async (productData) => {
    const productId = typeof productData === 'object' 
      ? (productData.ProductId ?? productData.id) 
      : productData;

    return apiClient.post(API_ROUTES.PRODUCT.DELETE_PRODUCT, {
      flagId: 5,
      ProductId: Number(productId)
    });
  }
};

export default productService;

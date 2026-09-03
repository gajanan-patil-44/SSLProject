// src/services/companyProductService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const companyProductService = {
  /**
   * View all company product mappings (FlagId: 1)
   */
  getCompanyProducts: async () => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.GET_COMPANY_PRODUCTS, {
      FlagId: 1
    });
  },

  /**
   * Get companies dropdown (FlagId: 1)
   */
  getCompaniesDropdown: async () => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DROPDOWN_OR_ADD, {
      FlagId: 1
    });
  },

  /**
   * Get products dropdown (FlagId: 2)
   */
  getProductsDropdown: async () => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DROPDOWN_OR_ADD, {
      FlagId: 2
    });
  },

  /**
   * Add company product mapping (FlagId: 3)
   * @param {Object} data - { CompanyId, ProductId, IsDisabled, CreatedByUserName }
   */
  addCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DROPDOWN_OR_ADD, {
      FlagId: 3,
      ...data
    });
  },

  /**
   * Edit company product mapping (FlagId: 3)
   * @param {Object} data - { CompanyProductId, CompanyId, ProductId, IsDisabled, UpdatedByUserName }
   */
  editCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.EDIT_COMPANY_PRODUCT, {
      FlagId: 3,
      ...data
    });
  },

  /**
   * Delete company product mapping (FlagId: 1)
   * @param {number|string} companyProductId 
   */
  deleteCompanyProduct: async (companyProductId) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DELETE_COMPANY_PRODUCT, {
      FlagId: 1,
      CompanyProductId: companyProductId
    });
  }
};

export default companyProductService;

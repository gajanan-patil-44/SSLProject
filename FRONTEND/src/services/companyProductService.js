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
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.ADD_COMPANY_PRODUCT, {
      FlagId: 3,
      CompanyId: Number(data.CompanyId),
      ProductId: Number(data.ProductId),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      CreatedByUserName: data.CreatedByUserName || ''
    });
  },

  /**
   * Edit company product mapping (FlagId: 3)
   * @param {Object} data - { CompanyProductId, CompanyId, ProductId, IsDisabled, UpdatedByUserName }
   */
  editCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.EDIT_COMPANY_PRODUCT, {
      FlagId: 3,
      CompanyProductId: Number(data.CompanyProductId ?? data.id),
      CompanyId: Number(data.CompanyId),
      ProductId: Number(data.ProductId),
      IsDisabled: typeof data.IsDisabled === 'boolean'
        ? data.IsDisabled
        : (data.IsDisabled === 'true' || data.IsDisabled === 'Inactive' || data.IsDisabled === 'Disabled' || false),
      UpdatedByUserName: data.UpdatedByUserName || ''
    });
  },

  /**
   * Delete company product mapping (FlagId: 1)
   * @param {number|string|Object} companyProductData 
   */
  deleteCompanyProduct: async (companyProductData) => {
    const id = typeof companyProductData === 'object'
      ? (companyProductData.CompanyProductId ?? companyProductData.id)
      : companyProductData;

    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DELETE_COMPANY_PRODUCT, {
      FlagId: 1,
      CompanyProductId: Number(id)
    });
  },

  /**
   * Update company product status (FlagId: 1)
   * @param {number|string|Object} companyProductData 
   * @param {boolean} isDisabled 
   */
  updateCompanyProductStatus: async (companyProductData, isDisabled) => {
    const id = typeof companyProductData === 'object'
      ? (companyProductData.CompanyProductId ?? companyProductData.id)
      : companyProductData;

    const disabledVal = typeof isDisabled === 'boolean'
      ? isDisabled
      : (typeof companyProductData === 'object' && companyProductData.IsDisabled !== undefined ? Boolean(companyProductData.IsDisabled) : false);

    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.UPDATE_STATUS, {
      FlagId: 1,
      CompanyProductId: Number(id),
      IsDisabled: Boolean(disabledVal)
    });
  }
};

export default companyProductService;

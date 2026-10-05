// src/services/companyProductService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const companyProductService = {
  /**
   * View all company products (FlagId: 1)
   * Endpoint: /verp-service/companyProductCreation/view
   * Payload: { "FlagId": 1 }
   */
  getCompanyProducts: async (flagId = 1) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.VIEW, {
      FlagId: flagId
    });
  },

  /**
   * Get Companies Dropdown (FlagId: 1)
   * Endpoint: /verp-service/companyProductCreation/companyProduct
   * Payload: { "FlagId": 1 }
   */
  getCompaniesDropdown: async () => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.COMPANY_PRODUCT, {
      FlagId: 1
    });
  },

  /**
   * Get Products Dropdown (FlagId: 2)
   * Endpoint: /verp-service/companyProductCreation/companyProduct
   * Payload: { "FlagId": 2 }
   */
  getProductsDropdown: async () => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.COMPANY_PRODUCT, {
      FlagId: 2
    });
  },

  /**
   * Add / Create Company Product (FlagId: 3)
   * Endpoint: /verp-service/companyProductCreation/companyProduct
   * Payload: { "FlagId": 3, "CompanyId": ..., "ProductId": ..., "IsDisabled": ..., "CreatedByUserName": "" }
   */
  addCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.COMPANY_PRODUCT, {
      FlagId: 3,
      CompanyId: Number(data.CompanyId),
      ProductId: Number(data.ProductId),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      CreatedByUserName: String(data.CreatedByUserName || '')
    });
  },

  /**
   * Edit / Update Company Product (FlagId: 3)
   * Endpoint: /verp-service/companyProductCreation/editcompanyproduct
   * Payload: { "FlagId": 3, "CompanyProductId": ..., "CompanyId": ..., "ProductId": ..., "IsDisabled": ..., "UpdatedByUserName": "" }
   */
  updateCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.EDIT_COMPANY_PRODUCT, {
      FlagId: 3,
      CompanyProductId: Number(data.CompanyProductId || data.id),
      CompanyId: Number(data.CompanyId),
      ProductId: Number(data.ProductId),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      UpdatedByUserName: String(data.UpdatedByUserName || data.UpdateByUserName || '')
    });
  },

  editCompanyProduct: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.EDIT_COMPANY_PRODUCT, {
      FlagId: 3,
      CompanyProductId: Number(data.CompanyProductId || data.id),
      CompanyId: Number(data.CompanyId),
      ProductId: Number(data.ProductId),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      UpdatedByUserName: String(data.UpdatedByUserName || data.UpdateByUserName || '')
    });
  },

  /**
   * Delete Company Product (FlagId: 1)
   * Endpoint: /verp-service/companyProductCreation/deleteCompanyProduct
   * Payload: { "FlagId": 1, "CompanyProductId": ... }
   */
  deleteCompanyProduct: async (companyProductId) => {
    const id = typeof companyProductId === 'object' ? (companyProductId.CompanyProductId || companyProductId.id) : companyProductId;
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.DELETE_COMPANY_PRODUCT, {
      FlagId: 1,
      CompanyProductId: Number(id)
    });
  },

  /**
   * Toggle / Update Company Product Status (FlagId: 1)
   * Endpoint: /verp-service/companyProductCreation/updateCompanyProductstatus
   * Payload: { "FlagId": 1, "CompanyProductId": ..., "IsDisabled": ... }
   */
  toggleCompanyProductStatus: async (data) => {
    return apiClient.post(API_ROUTES.COMPANY_PRODUCT.UPDATE_STATUS, {
      FlagId: 1,
      CompanyProductId: Number(data.CompanyProductId || data.id),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.isDisabled)
    });
  }
};

export default companyProductService;

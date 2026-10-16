// src/services/companyService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const companyService = {
  /**
   * Get all active companies (flagId: 1)
   */
  getCompanies: async () => {
    return apiClient.post(API_ROUTES.COMPANY.GET_COMPANIES, {
      flagId: 1
    });
  },

  /**
   * Add a new company (flagId: 2)
   * @param {Object} companyData 
   */
  addCompany: async (companyData) => {
    return apiClient.post(API_ROUTES.COMPANY.ADD_COMPANY, {
      flagId: 2,
      CompanyName: companyData.CompanyName || companyData.companyName || '',
      CompanyCode: companyData.CompanyCode || companyData.companyCode || '',
      CreatedByUserName: companyData.CreatedByUserName || '',
      UpdatedByUserName: companyData.UpdatedByUserName || '',
      IsDisabled: typeof companyData.IsDisabled === 'boolean' ? companyData.IsDisabled : false,
      Email: companyData.Email || companyData.email || '',
      PhoneNumber: companyData.PhoneNumber || companyData.phone || '',
      Address: companyData.Address || companyData.address || ''
    });
  },

  /**
   * Update existing company (flagId: 3)
   * @param {Object} companyData 
   */
  updateCompany: async (companyData) => {
    return apiClient.patch(API_ROUTES.COMPANY.UPDATE_COMPANY, {
      flagId: 3,
      CompanyId: Number(companyData.CompanyId ?? companyData.id),
      CompanyName: companyData.CompanyName || companyData.companyName || '',
      CompanyCode: companyData.CompanyCode || companyData.companyCode || '',
      UpdatedByUserName: companyData.UpdatedByUserName || '',
      Email: companyData.Email || companyData.email || '',
      PhoneNumber: companyData.PhoneNumber || companyData.phone || '',
      Address: companyData.Address || companyData.address || ''
    });
  },

  /**
   * Toggle company status (flagId: 4)
   * @param {Object} statusData - { CompanyId, IsDisabled, UpdatedByUserName }
   */
  toggleCompanyStatus: async (statusData) => {
    return apiClient.patch(API_ROUTES.COMPANY.TOGGLE_STATUS, {
      flagId: 4,
      CompanyId: Number(statusData.CompanyId ?? statusData.id),
      IsDisabled: typeof statusData.IsDisabled === 'boolean' ? statusData.IsDisabled : Boolean(statusData.IsDisabled),
      UpdatedByUserName: statusData.UpdatedByUserName || ''
    });
  },

  /**
   * Delete / Disable company (flagId: 5)
   * @param {Object} deleteData 
   */
  deleteCompany: async (deleteData) => {
    return apiClient.post(API_ROUTES.COMPANY.DELETE_COMPANY, {
      flagId: 5,
      ...deleteData
    });
  }
};

export default companyService;

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
      ...companyData
    });
  },

  /**
   * Update existing company (flagId: 3)
   * @param {Object} companyData 
   */
  updateCompany: async (companyData) => {
    return apiClient.post(API_ROUTES.COMPANY.UPDATE_COMPANY, {
      flagId: 3,
      ...companyData
    });
  },

  /**
   * Toggle company status (flagId: 4)
   * @param {Object} statusData 
   */
  toggleCompanyStatus: async (statusData) => {
    return apiClient.post(API_ROUTES.COMPANY.TOGGLE_STATUS, {
      flagId: 4,
      ...statusData
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

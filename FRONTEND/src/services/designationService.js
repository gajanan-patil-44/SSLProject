// src/services/designationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const designationService = {
  /**
   * View all designations (flagId: 1)
   */
  getDesignations: async () => {
    return apiClient.post(API_ROUTES.DESIGNATION.GET_DESIGNATIONS, {
      flagId: 1
    });
  },

  /**
   * Get companies dropdown for designation (flagId: 1)
   */
  getCompaniesDropdown: async () => {
    return apiClient.post(API_ROUTES.DESIGNATION.DROPDOWN_OR_ADD, {
      flagId: 1
    });
  },

  /**
   * Add a new designation (flagId: 2)
   * @param {Object} data - { CompanyId, DesignationName, DesignationCode, IsDisabled, CreatedByUserName }
   */
  addDesignation: async (data) => {
    return apiClient.post(API_ROUTES.DESIGNATION.DROPDOWN_OR_ADD, {
      flagId: 2,
      ...data
    });
  },

  /**
   * Get companies dropdown for edit designation (flagId: 1)
   */
  getCompaniesForEditDropdown: async () => {
    return apiClient.post(API_ROUTES.DESIGNATION.EDIT_DESIGNATION, {
      flagId: 1
    });
  },

  /**
   * Get designation details by ID (flagId: 2)
   * @param {number|string} companyDesignationId 
   */
  getDesignationById: async (companyDesignationId) => {
    return apiClient.post(API_ROUTES.DESIGNATION.EDIT_DESIGNATION, {
      flagId: 2,
      CompanyDesignationId: companyDesignationId
    });
  },

  /**
   * Edit existing designation (flagId: 3)
   * @param {Object} data - { CompanyDesignationId, CompanyId, DesignationName, DesignationCode, IsDisabled, UpdateByUserName }
   */
  editDesignation: async (data) => {
    return apiClient.post(API_ROUTES.DESIGNATION.EDIT_DESIGNATION, {
      flagId: 3,
      ...data
    });
  },

  /**
   * Toggle designation status (flagId: 4)
   * @param {Object} data - { CompanyDesignationId, IsDisabled, UpdateByUserName }
   */
  toggleDesignationStatus: async (data) => {
    return apiClient.post(API_ROUTES.DESIGNATION.TOGGLE_STATUS, {
      flagId: 4,
      ...data
    });
  },

  /**
   * Delete designation (flagId: 5)
   * @param {number|string} companyDesignationId 
   */
  deleteDesignation: async (companyDesignationId) => {
    return apiClient.post(API_ROUTES.DESIGNATION.DELETE_DESIGNATION, {
      flagId: 5,
      CompanyDesignationId: companyDesignationId
    });
  }
};

export default designationService;

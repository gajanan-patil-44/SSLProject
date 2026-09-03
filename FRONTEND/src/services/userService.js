// src/services/userService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const userService = {
  /**
   * Get user dropdowns:
   * FlagId: 1 -> Gender
   * FlagId: 2 -> Marital Status
   * FlagId: 3 -> Designation
   * FlagId: 4 -> Reporting Manager (requires CompanyId and DesignationId)
   */
  getGenderDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.DROPDOWNS, {
      FlagId: 1
    });
  },

  getMaritalStatusDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.DROPDOWNS, {
      FlagId: 2
    });
  },

  getDesignationDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.DROPDOWNS, {
      FlagId: 3
    });
  },

  getReportingManagerDropdown: async (companyId, designationId) => {
    return apiClient.post(API_ROUTES.USER.DROPDOWNS, {
      FlagId: 4,
      CompanyId: companyId,
      DesignationId: designationId
    });
  },

  /**
   * Company / Product / Project dropdowns for user creation:
   * FlagId: 1 -> Company
   * FlagId: 2 -> Product (requires CompanyId)
   * FlagId: 3 -> Project (requires CompanyProductId)
   */
  getCompanyDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.COMPANY_PRODUCT_PROJECT_DROPDOWN, {
      FlagId: 1
    });
  },

  getProductDropdown: async (companyId) => {
    return apiClient.post(API_ROUTES.USER.COMPANY_PRODUCT_PROJECT_DROPDOWN, {
      FlagId: 2,
      CompanyId: companyId
    });
  },

  getProjectDropdown: async (companyProductId) => {
    return apiClient.post(API_ROUTES.USER.COMPANY_PRODUCT_PROJECT_DROPDOWN, {
      FlagId: 3,
      CompanyProductId: companyProductId
    });
  },

  /**
   * Create User (Multipart Form Data with files and photo)
   * @param {FormData} formData 
   */
  createUser: async (formData) => {
    return apiClient.post(API_ROUTES.USER.CREATE_USER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default userService;

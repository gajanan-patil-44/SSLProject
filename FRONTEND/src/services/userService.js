// src/services/userService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const userService = {
  /**
   * All user dropdowns via /verp-service/userCreation/userdropdowns:
   * FlagId: 1 -> Gender            (GenderId, GenderName)
   * FlagId: 2 -> Marital Status    (MaritalStatusId, MaritalStatusName)
   * FlagId: 3 -> Designation       (CompanyDesignationId, DesignationName)
   * FlagId: 4 -> Reporting Manager (requires CompanyId and DesignationId)
   */
  getGenderDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 1
    });
  },

  getMaritalStatusDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 2
    });
  },

  getDesignationDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 3
    });
  },

  getReportingManagerDropdown: async (companyId, designationId) => {
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 4,
      CompanyId: Number(companyId),
      DesignationId: Number(designationId)
    });
  },

  /**
   * File Types dropdown via /verp-service/fileType/getfiletypes
   * FlagId: 1 -> (FileTypeId, FileTypeName, Description)
   */
  getFileTypes: async () => {
    return apiClient.post(API_ROUTES.FILE_TYPE.GET_FILE_TYPES, {
      FlagId: 1
    });
  },

  /**
   * Company / Product / Project / Role cascade dropdowns
   * Endpoint: /verp-service/userCreation/companyproductprojectdropdown
   *
   * FlagId: 1 → Company list            (CompanyId, CompanyName)
   * FlagId: 2 → Company Products        (CompanyProductId, ProductName) — requires CompanyId
   * FlagId: 3 → Projects                (ProjectId, ProjectName)        — requires CompanyProductId
   * FlagId: 4 → Roles                   (RoleId, RoleName)
   */
  getCompanyDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 1
    });
  },

  getProductDropdown: async (companyId) => {
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 2,
      CompanyId: Number(companyId)
    });
  },

  getProjectDropdown: async (companyProductId) => {
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 3,
      CompanyProductId: Number(companyProductId)
    });
  },

  /**
   * Roles dropdown via /verp-service/roleCreation/getRole
   * FlagId: 1 -> (RoleId, RoleName)
   */
  getRoleDropdown: async () => {
    return apiClient.post(API_ROUTES.ROLE.GET_ROLE, {
      FlagId: 1
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

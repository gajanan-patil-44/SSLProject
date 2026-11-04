// src/services/userService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { getSessionCompanyId } from './departmentService';

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

  getDesignationDropdown: async (companyId) => {
    const compId = companyId !== undefined && companyId !== null && String(companyId).trim() !== ''
      ? Number(companyId)
      : getSessionCompanyId();
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 3,
      CompanyId: compId
    });
  },

  getReportingManagerDropdown: async (companyId, designationId) => {
    const compId = companyId !== undefined && companyId !== null && String(companyId).trim() !== ''
      ? Number(companyId)
      : getSessionCompanyId();
    return apiClient.post(API_ROUTES.USER.USERDROPDOWNS, {
      FlagId: 4,
      CompanyId: compId,
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
   * FlagId: 3 → Projects                (ProjectId, ProjectName)        — requires ProductId and CompanyProductId
   * FlagId: 4 → Roles                   (RoleId, RoleName)
   */
  getCompanyDropdown: async () => {
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 1
    });
  },

  getProductDropdown: async (companyId) => {
    const compId = companyId !== undefined && companyId !== null && String(companyId).trim() !== ''
      ? Number(companyId)
      : getSessionCompanyId();
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 2,
      CompanyId: compId
    });
  },

  getProjectDropdown: async (productId, companyProductId) => {
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 3,
      ProductId: Number(productId),
      CompanyProductId: Number(companyProductId)
    });
  },

  /**
   * Roles dropdown via /verp-service/userCreation/companyproductprojectdropdown
   * FlagId: 4, CompanyId: number
   */
  getRoleDropdown: async (companyId) => {
    const compId = companyId !== undefined && companyId !== null && String(companyId).trim() !== ''
      ? Number(companyId)
      : getSessionCompanyId();
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, {
      FlagId: 4,
      CompanyId: compId
    });
  },

  /**
   * Department dropdown via /verp-service/userCreation/companyproductprojectdropdown
   * flagId: 5, CompanyId: number | null
   */
  getDepartmentDropdown: async (companyId = null) => {
    const sessionCompId = getSessionCompanyId();
    const targetCompanyId = companyId !== null && companyId !== undefined && String(companyId).trim() !== ''
      ? Number(companyId)
      : (sessionCompId ? Number(sessionCompId) : null);
    const payload = {
      FlagId: 5,
      CompanyId: targetCompanyId
    };
    return apiClient.post(API_ROUTES.USER.CPP_DROPDOWN, payload);
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
  },

  /**
   * Get all user details with full nested associations
   * Endpoint: /verp-service/userEdit/getAllUserDetails
   * @param {number} flagId default 1
   */
  getAllUserDetails: async (flagId = 1) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_ALL_USER_DETAILS, {
      flagId: Number(flagId)
    });
  },

  /**
   * Edit user details
   * Endpoint: /verp-service/userEdit/editUserdetails
   * @param {Object} userData
   */
  editUserDetails: async (userData) => {
    const payload = {
      flagId: 2,
      ...userData
    };
    try {
      return await apiClient.patch(API_ROUTES.USER_EDIT.EDIT_USER_DETAILS, payload);
    } catch (err) {
      if (err?.response?.status === 405) {
        return await apiClient.post(API_ROUTES.USER_EDIT.EDIT_USER_DETAILS, payload);
      }
      throw err;
    }
  },

  /**
   * Toggle user status
   * Endpoint: /verp-service/userEdit/toggleUserStatus
   * @param {Object} statusData { flagId, IsDisabled, UpdatedByUserName, UserId }
   */
  toggleUserStatus: async (statusData) => {
    const payload = {
      flagId: Number(statusData.flagId ?? 1),
      IsDisabled: Boolean(statusData.IsDisabled),
      UpdatedByUserName: statusData.UpdatedByUserName || '',
      UserId: Number(statusData.UserId ?? statusData.userId ?? statusData.id)
    };

    return apiClient.patch(API_ROUTES.USER_EDIT.TOGGLE_USER_STATUS, payload);
  },

  /**
   * Change user password
   * Hits /verp-service/userEdit/change-password with:
   * {
   *   "FlagId": 1,
   *   "UserId": <UserId>,
   *   "NewPassword": "<NewPassword>"
   * }
   * @param {number|string} userId
   * @param {string} newPassword
   */
  changePassword: async (userId, newPassword) => {
    const payload = {
      FlagId: 1,
      UserId: Number(userId),
      NewPassword: String(newPassword)
    };

    return apiClient.patch(API_ROUTES.USER_EDIT.CHANGE_PASSWORD, payload);
  },

  /**
   * ==========================================================================
   * User Edit Dropdown Routes (/verp-service/userEdit/...)
   * ==========================================================================
   */
  getEditGender: async () => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_GENDER, {
      flagId: 1
    });
  },

  getEditMaritalStatus: async () => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_MARITAL_STATUS, {
      flagId: 1
    });
  },

  getEditCompany: async () => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_COMPANY, {
      flagId: 1
    });
  },

  getEditDesignation: async (companyId) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_DESIGNATION, {
      flagId: 1,
      CompanyId: Number(companyId)
    });
  },

  getEditReportingManager: async (companyId) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_REPORTING_MANAGER, {
      flagId: 1,
      CompanyId: Number(companyId)
    });
  },

  getEditCompanyProduct: async (companyId) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_COMPANY_PRODUCT, {
      flagId: 1,
      CompanyId: Number(companyId)
    });
  },

  getEditProject: async (companyProductId) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_PROJECT, {
      flagId: 1,
      CompanyProductId: Number(companyProductId)
    });
  },

  getEditRole: async (companyId) => {
    return apiClient.post(API_ROUTES.USER_EDIT.GET_ROLE, {
      flagId: 1,
      CompanyId: Number(companyId)
    });
  }
};

export default userService;

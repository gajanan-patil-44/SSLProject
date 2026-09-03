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
    const userState = (typeof window !== 'undefined' && window.localStorage) ? (() => {
      try {
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        const s = JSON.parse(localStorage.getItem('erp_session') || '{}');
        return u?.loginName || u?.LoginName || s?.LoginName || s?.loginName || u?.EmployeeId || s?.EmployeeId || 'admin';
      } catch { return 'admin'; }
    })() : 'admin';

    const userName = data.CreatedByUserName || data.CreateByUserName || data.UpdatedByUserName || data.UpdateByUserName || userState;

    return apiClient.post(API_ROUTES.DESIGNATION.ADD_DESIGNATION, {
      flagId: 2,
      CompanyId: Number(data.CompanyId),
      DesignationName: data.DesignationName || data.designationName || '',
      DesignationCode: data.DesignationCode || data.designationCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      CreatedByUserName: userName
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
   * Edit existing designation (flagId: 2)
   * @param {Object} data - { CompanyDesignationId, CompanyId, DesignationName, DesignationCode, IsDisabled, UpdateByUserName }
   */
  editDesignation: async (data) => {
    const userState = (typeof window !== 'undefined' && window.localStorage) ? (() => {
      try {
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        const s = JSON.parse(localStorage.getItem('erp_session') || '{}');
        return u?.loginName || u?.LoginName || s?.LoginName || s?.loginName || u?.EmployeeId || s?.EmployeeId || 'admin';
      } catch { return 'admin'; }
    })() : 'admin';

    const userName = data.UpdateByUserName || data.UpdatedByUserName || data.CreatedByUserName || userState;

    return apiClient.post(API_ROUTES.DESIGNATION.EDIT_DESIGNATION, {
      flagId: Number(data.flagId || 2),
      CompanyDesignationId: Number(data.CompanyDesignationId ?? data.id),
      CompanyId: Number(data.CompanyId),
      DesignationName: data.DesignationName || data.designationName || '',
      DesignationCode: data.DesignationCode || data.designationCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      UpdateByUserName: userName
    });
  },

  /**
   * Toggle designation status (flagId: 4)
   * @param {Object} data - { CompanyDesignationId, IsDisabled, UpdateByUserName }
   */
  toggleDesignationStatus: async (data) => {
    const userState = (typeof window !== 'undefined' && window.localStorage) ? (() => {
      try {
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        const s = JSON.parse(localStorage.getItem('erp_session') || '{}');
        return u?.loginName || u?.LoginName || s?.LoginName || s?.loginName || u?.EmployeeId || s?.EmployeeId || 'admin';
      } catch { return 'admin'; }
    })() : 'admin';

    const userName = data.UpdateByUserName || data.UpdatedByUserName || userState;

    return apiClient.post(API_ROUTES.DESIGNATION.TOGGLE_STATUS, {
      flagId: 4,
      CompanyDesignationId: Number(data.CompanyDesignationId ?? data.id),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled),
      UpdateByUserName: userName
    });
  },

  /**
   * Delete designation (flagId: 1)
   * @param {number|string|Object} idOrData 
   */
  deleteDesignation: async (idOrData) => {
    const id = typeof idOrData === 'object' ? (idOrData.CompanyDesignationId ?? idOrData.id) : idOrData;
    return apiClient.post(API_ROUTES.DESIGNATION.DELETE_DESIGNATION, {
      flagId: 1,
      CompanyDesignationId: Number(id)
    });
  }
};

export default designationService;

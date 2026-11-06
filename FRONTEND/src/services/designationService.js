// src/services/designationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const designationService = {
  /**
   * View all designations (flagId: 1)
   * Route: POST /verp-service/designationCreation/view
   * Payload: { flagId: 1 }
   */
  getDesignations: async (payload) => {
    return apiClient.post('/verp-service/designationCreation/view', {
      flagId: payload?.flagId ?? 1
    });
  },

  viewDesignations: async () => {
    return apiClient.post('/verp-service/designationCreation/view', {
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
   * Fetch company designation dropdowns
   * Route: POST /verp-service/designationCreation/companyDesignationDpdwn
   * @param {number} flagId 1 for company dropdown, 2 for designation dropdown
   */
  getCompanyDesignationDropdown: async (flagId) => {
    return apiClient.post(
      API_ROUTES.DESIGNATION.COMPANY_DESIGNATION_DROPDOWN || '/verp-service/designationCreation/companyDesignationDpdwn',
      { flagId: Number(flagId) }
    );
  },

  /**
   * Add a new designation (flagId: 2)
   * Route: POST /verp-service/designationCreation/designation
   * Payload: { flagId: 2, DesignationName, DesignationCode, DesignationDescription, IsDisabled, CreatedByUserName }
   */
  addDesignation: async (data) => {
    const userState = (typeof window !== 'undefined') ? (() => {
      try {
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
        if (raw) {
          const s = JSON.parse(raw);
          const u = s?.data?.user || s?.user;
          return u?.loginName || u?.LoginName || u?.name?.first || (typeof u?.name === 'string' && u.name !== 'Andrew' ? u.name : '') || u?.EmployeeId || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.name?.first || u?.EmployeeId || '';
      } catch { return ''; }
    })() : '';

    const userName = data.CreatedByUserName || data.CreateByUserName || userState || 'Admin';

    const rawCode = data.DesignationCode ?? data.designationCode ?? '';
    const code = (typeof rawCode === 'string' && /^\d+$/.test(rawCode.trim()))
      ? Number(rawCode.trim())
      : rawCode;

    return apiClient.post('/verp-service/designationCreation/designation', {
      flagId: 2,
      DesignationName: data.DesignationName || data.designationName || '',
      DesignationCode: code,
      DesignationDescription: data.DesignationDescription || data.Description || data.description || '',
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
   * Route: PATCH /verp-service/designationCreation/editdesignation
   * Payload: { flagId: 2, DesignationId, DesignationName, DesignationCode, DesignationDescription, IsDisabled, UpdatedByUserName }
   */
  editDesignation: async (data) => {
    const userState = (typeof window !== 'undefined') ? (() => {
      try {
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
        if (raw) {
          const s = JSON.parse(raw);
          const u = s?.data?.user || s?.user;
          return u?.loginName || u?.LoginName || u?.name?.first || (typeof u?.name === 'string' && u.name !== 'Andrew' ? u.name : '') || u?.EmployeeId || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.name?.first || u?.EmployeeId || '';
      } catch { return ''; }
    })() : '';

    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState || 'Admin';
    const designationId = Number(data.DesignationId ?? data.CompanyDesignationId ?? data.id);

    const rawCode = data.DesignationCode ?? data.designationCode ?? '';
    const code = (typeof rawCode === 'string' && /^\d+$/.test(rawCode.trim()))
      ? Number(rawCode.trim())
      : rawCode;

    return apiClient.patch(API_ROUTES.DESIGNATION.EDIT_DESIGNATION, {
      flagId: Number(data.flagId || 2),
      DesignationId: designationId,
      DesignationName: data.DesignationName || data.designationName || '',
      DesignationCode: code,
      DesignationDescription: data.DesignationDescription || data.Description || data.description || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      UpdatedByUserName: userName
    });
  },

  /**
   * Toggle designation status (flagId: 4)
   * Route: PATCH /verp-service/designationCreation/toggleDesignationStatus
   * Payload: { flagId: 4, DesignationId, IsDisabled, UpdatedByUserName }
   */
  toggleDesignationStatus: async (data) => {
    const userState = (typeof window !== 'undefined') ? (() => {
      try {
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
        if (raw) {
          const s = JSON.parse(raw);
          const u = s?.data?.user || s?.user;
          return u?.loginName || u?.LoginName || u?.name?.first || (typeof u?.name === 'string' && u.name !== 'Andrew' ? u.name : '') || u?.EmployeeId || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.name?.first || u?.EmployeeId || '';
      } catch { return ''; }
    })() : '';

    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState || 'Admin';
    const designationId = Number(data.DesignationId ?? data.CompanyDesignationId ?? data.id);

    return apiClient.patch(API_ROUTES.DESIGNATION.TOGGLE_STATUS, {
      flagId: 4,
      DesignationId: designationId,
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled),
      UpdatedByUserName: userName
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

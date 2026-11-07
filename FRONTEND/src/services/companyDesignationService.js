// src/services/companyDesignationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { getSessionCompanyId } from './departmentService';

export const companyDesignationService = {
  /**
   * Fetch company designations view
   * Route: POST /verp-service/designationCreation/fetchCompanyDesignationView
   * Payload: { flagId: 1, CompanyId: null | number }
   */
  getCompanyDesignations: async (payload = {}) => {
    const sessionCompanyId = getSessionCompanyId();
    const effectiveCompanyId = payload?.CompanyId !== undefined
      ? payload.CompanyId
      : (sessionCompanyId ? Number(sessionCompanyId) : null);

    const body = {
      flagId: Number(payload?.flagId ?? payload?.FlagId ?? 1),
      CompanyId: effectiveCompanyId ? Number(effectiveCompanyId) : null
    };

    return apiClient.post(
      API_ROUTES.COMPANY_DESIGNATION?.VIEW ||
      API_ROUTES.DESIGNATION?.FETCH_COMPANY_DESIGNATION_VIEW ||
      '/verp-service/designationCreation/fetchCompanyDesignationView',
      body
    );
  },

  /**
   * Fetch company designation dropdowns
   * Route: POST /verp-service/designationCreation/companyDesignationDpdwn
   * @param {number} flagId 1 for company dropdown, 2 for designation dropdown
   */
  getCompanyDesignationDropdown: async (flagId) => {
    return apiClient.post(
      API_ROUTES.DESIGNATION?.COMPANY_DESIGNATION_DROPDOWN || '/verp-service/designationCreation/companyDesignationDpdwn',
      { flagId: Number(flagId) }
    );
  },

  /**
   * Fetch active companies dropdown (flagId: 1)
   * Route: POST /verp-service/designationCreation/companyDesignationDpdwn with { flagId: 1 }
   */
  getCompaniesDropdown: async () => {
    const res = await companyDesignationService.getCompanyDesignationDropdown(1);
    const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
    if (Array.isArray(raw)) {
      return raw.map((c) => ({
        CompanyId: Number(c.CompanyId ?? c.id),
        CompanyName: c.CompanyName || c.name || ''
      }));
    }
    return [];
  },

  /**
   * Fetch master designations dropdown (flagId: 2)
   * Route: POST /verp-service/designationCreation/companyDesignationDpdwn with { flagId: 2 }
   */
  getMasterDesignationsDropdown: async () => {
    const res = await companyDesignationService.getCompanyDesignationDropdown(2);
    const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
    if (Array.isArray(raw)) {
      return raw.map((d) => ({
        DesignationId: Number(d.DesignationId ?? d.id),
        DesignationName: d.DesignationName || d.name || '',
        DesignationCode: d.DesignationCode || d.code || '',
        DesignationDescription: d.DesignationDescription || d.description || ''
      }));
    }
    return [];
  },

  /**
   * Add a new company designation (flagId: 1)
   * Route: POST /verp-service/designationCreation/insertCompanyDesignation
   * Payload: { flagId: 1, CompanyId, DesignationId, DesignationLevel, CanBeReportingManager, CreatedByUserName }
   */
  addCompanyDesignation: async (data) => {
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

    const userName = data.CreatedByUserName || data.CreateByUserName || userState || '';
    const sessionCompId = getSessionCompanyId();
    const effectiveCompanyId = (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== '')
      ? Number(data.CompanyId)
      : (sessionCompId ? Number(sessionCompId) : null);

    const payload = {
      flagId: Number(data.flagId ?? data.FlagId ?? 1),
      CompanyId: effectiveCompanyId,
      DesignationId: Number(data.DesignationId),
      DesignationLevel: Number(data.DesignationLevel),
      CanBeReportingManager: typeof data.CanBeReportingManager === 'boolean'
        ? data.CanBeReportingManager
        : Boolean(data.CanBeReportingManager),
      CreatedByUserName: userName
    };

    const endpoint = API_ROUTES.COMPANY_DESIGNATION?.ADD ||
      API_ROUTES.DESIGNATION?.INSERT_COMPANY_DESIGNATION ||
      '/verp-service/designationCreation/insertCompanyDesignation';

    return apiClient.post(endpoint, payload);
  },

  /**
   * Edit existing company designation
   * Endpoint: /verp-service/designationCreation/editCompanyDesignation
   * Method: PATCH (with fallback to POST if 405)
   * Payload:
   * {
   *   "flagId": 2,
   *   "CompanyDesignationId": 1,
   *   "CompanyId": 2,
   *   "DesignationId": 1,
   *   "DesignationLevel": 3,
   *   "CanBeReportingManager": true,
   *   "UpdateByUserName": "Praveen"
   * }
   */
  editCompanyDesignation: async (data) => {
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

    const userName = data.UpdateByUserName || data.UpdatedByUserName || userState || '';
    const companyDesignationId = Number(data.CompanyDesignationId ?? data.id);
    const sessionCompId = getSessionCompanyId();
    const effectiveCompanyId = (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== '')
      ? Number(data.CompanyId)
      : (sessionCompId ? Number(sessionCompId) : null);

    const payload = {
      flagId: Number(data.flagId ?? data.FlagId ?? 2),
      CompanyDesignationId: companyDesignationId,
      CompanyId: effectiveCompanyId,
      DesignationId: Number(data.DesignationId),
      DesignationLevel: Number(data.DesignationLevel),
      CanBeReportingManager: typeof data.CanBeReportingManager === 'boolean'
        ? data.CanBeReportingManager
        : Boolean(data.CanBeReportingManager),
      UpdateByUserName: userName
    };

    const endpoint = API_ROUTES.COMPANY_DESIGNATION?.EDIT_COMPANY_DESIGNATION ||
      API_ROUTES.DESIGNATION?.EDIT_COMPANY_DESIGNATION ||
      API_ROUTES.COMPANY_DESIGNATION?.EDIT ||
      '/verp-service/designationCreation/editCompanyDesignation';

    try {
      return await apiClient.patch(endpoint, payload);
    } catch (patchErr) {
      if (patchErr?.response?.status === 405) {
        return await apiClient.post(endpoint, payload);
      }
      throw patchErr;
    }
  },

  /**
   * Toggle company designation status
   * Endpoint: /verp-service/designationCreation/toggleCompanyDesignationStatus
   * Method: PATCH (with fallback to POST if 405)
   * Payload:
   * {
   *   "flagId": 3,
   *   "CompanyDesignationId": 3,
   *   "IsDisabled": true,
   *   "UpdateByUserName": "Praveen"
   * }
   */
  toggleCompanyDesignationStatus: async (data) => {
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

    const userName = data.UpdateByUserName || data.UpdatedByUserName || userState || '';
    const companyDesignationId = Number(data.CompanyDesignationId ?? data.id);
    const isDisabled = typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled);

    const payload = {
      flagId: Number(data.flagId ?? data.FlagId ?? 3),
      CompanyDesignationId: companyDesignationId,
      IsDisabled: isDisabled,
      UpdateByUserName: userName
    };

    const endpoint = API_ROUTES.COMPANY_DESIGNATION?.STATUS ||
      API_ROUTES.DESIGNATION?.TOGGLE_COMPANY_DESIGNATION_STATUS ||
      '/verp-service/designationCreation/toggleCompanyDesignationStatus';

    try {
      return await apiClient.patch(endpoint, payload);
    } catch (patchErr) {
      if (patchErr?.response?.status === 405) {
        return await apiClient.post(endpoint, payload);
      }
      throw patchErr;
    }
  }
};

export default companyDesignationService;

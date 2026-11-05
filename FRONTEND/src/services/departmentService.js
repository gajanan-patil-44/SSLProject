// src/services/departmentService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { useERPStore } from '../store/useERPStore';

/**
 * Helper to extract the active company from session storage or store
 */
export const getSessionCompany = () => {
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const active = s?.data?.context?.activeCompany || s?.context?.activeCompany;
      if (active) return active;
      const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
      if (Array.isArray(comps) && comps.length > 0) return comps[0];
      const user = s?.data?.user || s?.user;
      if (user?.CompanyId || user?.companyId) {
        return {
          CompanyId: user?.CompanyId || user?.companyId,
          CompanyName: user?.CompanyName || user?.companyName
        };
      }
    }
    const storeState = useERPStore.getState();
    const ctx = storeState?.userContext;
    if (ctx?.activeCompany) return ctx.activeCompany;
    if (Array.isArray(ctx?.companies) && ctx.companies.length > 0) return ctx.companies[0];
    const user = storeState?.user;
    if (user?.CompanyId || user?.companyId) {
      return {
        CompanyId: user?.CompanyId || user?.companyId,
        CompanyName: user?.CompanyName || user?.companyName
      };
    }
  } catch {}
  return null;
};

/**
 * Helper to extract session CompanyId as a valid number
 */
export const getSessionCompanyId = (explicitId) => {
  if (explicitId !== undefined && explicitId !== null && explicitId !== '') {
    const num = Number(explicitId);
    if (!isNaN(num) && num > 0) return num;
  }
  const comp = getSessionCompany();
  const id = comp?.CompanyId ?? comp?.CompanyMasterId ?? comp?.companyId ?? comp?.id;
  if (id !== undefined && id !== null && id !== '') {
    const num = Number(id);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
};

export const departmentService = {
  /**
   * Fetch departments list for viewing in table
   * Endpoint: /verp-service/department/getDepartment
   * Method: POST
   * Payload: { flagId: 1, CompanyId }
   */
  getDepartments: async (params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      flagId: 1,
      CompanyId: compId,
      ...params
    };
    return apiClient.post(API_ROUTES.DEPARTMENT.GET_DEPARTMENTS, payload);
  },

  /**
   * Add new department
   * Endpoint: /verp-service/department/addDepartment
   * Method: POST
   * Payload: { flagId: 2, CompanyId, DepartmentName, DepartmentCode, CreatedByUserName }
   */
  addDepartment: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      flagId: 2,
      CompanyId: compId,
      DepartmentName: String(data.DepartmentName || '').trim(),
      DepartmentCode: String(data.DepartmentCode || '').trim(),
      CreatedByUserName: data.CreatedByUserName
    };
    return apiClient.post(API_ROUTES.DEPARTMENT.ADD_DEPARTMENT, payload);
  },

  /**
   * Update department
   * Endpoint: /verp-service/department/updateDepartment
   * Method: PATCH
   * Payload: { flagId: 3, DepartmentId, CompanyId, DepartmentName, DepartmentCode, UpdatedByUserName }
   */
  updateDepartment: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      flagId: 3,
      DepartmentId: Number(data.DepartmentId),
      CompanyId: compId,
      DepartmentName: String(data.DepartmentName || '').trim(),
      DepartmentCode: String(data.DepartmentCode || '').trim(),
      UpdatedByUserName: data.UpdatedByUserName
    };
    return apiClient.patch(API_ROUTES.DEPARTMENT.UPDATE_DEPARTMENT, payload);
  },

  /**
   * Toggle department status (enable / disable)
   * Endpoint: /verp-service/department/toggleDepartmentStatus
   * Method: PATCH
   * Payload: { flagId: 4, DepartmentId, CompanyId, IsDisabled, UpdatedByUserName }
   */
  toggleDepartmentStatus: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      flagId: 4,
      DepartmentId: Number(data.DepartmentId),
      CompanyId: compId,
      IsDisabled: Boolean(data.IsDisabled),
      UpdatedByUserName: data.UpdatedByUserName
    };
    return apiClient.patch(API_ROUTES.DEPARTMENT.TOGGLE_DEPARTMENT_STATUS, payload);
  }
};

export default departmentService;

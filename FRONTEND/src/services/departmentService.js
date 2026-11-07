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
   * Payload: { flagId: 1 }
   */
  getDepartments: async (params = {}) => {
    const { CompanyId, companyId, ...rest } = params;
    const payload = {
      flagId: 1,
      ...rest
    };
    return apiClient.post(API_ROUTES.DEPARTMENT.GET_DEPARTMENTS, payload);
  },

  /**
   * Add new department
   * Endpoint: /verp-service/department/addDepartment
   * Method: POST
   * Payload: { flagId: 2, DepartmentName, DepartmentCode, CreatedByUserName }
   */
  addDepartment: async (data = {}) => {
    const payload = {
      flagId: 2,
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
   * Payload: { flagId: 3, DepartmentId, DepartmentName, DepartmentCode, UpdatedByUserName }
   */
  updateDepartment: async (data = {}) => {
    const payload = {
      flagId: 3,
      DepartmentId: Number(data.DepartmentId),
      DepartmentName: String(data.DepartmentName || '').trim(),
      DepartmentCode: String(data.DepartmentCode || '').trim(),
      UpdatedByUserName: data.UpdatedByUserName
    };
    try {
      return await apiClient.patch(API_ROUTES.DEPARTMENT.UPDATE_DEPARTMENT, payload);
    } catch (err) {
      if (err?.response?.status === 405) {
        return await apiClient.post(API_ROUTES.DEPARTMENT.UPDATE_DEPARTMENT, payload);
      }
      throw err;
    }
  },

  /**
   * Toggle department status (enable / disable)
   * Endpoint: /verp-service/department/toggleDepartmentStatus
   * Method: PATCH
   * Payload: { flagId: 4, DepartmentId, IsDisabled, UpdatedByUserName }
   */
  toggleDepartmentStatus: async (data = {}) => {
    const payload = {
      flagId: 4,
      DepartmentId: Number(data.DepartmentId),
      IsDisabled: Boolean(data.IsDisabled),
      UpdatedByUserName: data.UpdatedByUserName
    };
    try {
      return await apiClient.patch(API_ROUTES.DEPARTMENT.TOGGLE_DEPARTMENT_STATUS, payload);
    } catch (err) {
      if (err?.response?.status === 405) {
        return await apiClient.post(API_ROUTES.DEPARTMENT.TOGGLE_DEPARTMENT_STATUS, payload);
      }
      throw err;
    }
  }
};

export default departmentService;

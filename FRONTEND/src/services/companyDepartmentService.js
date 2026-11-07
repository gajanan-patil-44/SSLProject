// src/services/companyDepartmentService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

const getUserName = () => {
  if (typeof window === 'undefined') return '';
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const u = s?.data?.user || s?.user;
      return u?.loginName || u?.LoginName || u?.name?.first || (typeof u?.name === 'string' ? u.name : '') || u?.EmployeeId || '';
    }
    const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
    return u?.loginName || u?.LoginName || u?.name?.first || (typeof u?.name === 'string' ? u.name : '') || u?.EmployeeId || '';
  } catch {
    return '';
  }
};

export const companyDepartmentService = {
  /**
   * Fetch company departments for viewing in table
   * Route: POST /verp-service/department/view
   * Payload: { flagId: 1, CompanyId? }
   */
  getCompanyDepartments: async (payload = {}) => {
    const endpoint = API_ROUTES.DEPARTMENT?.VIEW || '/verp-service/department/view';
    const flagId = payload?.flagId ?? 1;
    const companyId = payload?.CompanyId ?? payload?.companyId;

    const reqPayload = {
      flagId: Number(flagId)
    };

    if (companyId !== undefined && companyId !== null && companyId !== '') {
      reqPayload.CompanyId = Number(companyId);
    }

    return apiClient.post(endpoint, reqPayload);
  },

  /**
   * Fetch companies dropdown list (flagId: 1)
   * Route: POST /verp-service/department/dropdown with { flagId: 1 }
   */
  getCompaniesDropdown: async () => {
    const endpoint = API_ROUTES.DEPARTMENT?.DROPDOWN || '/verp-service/department/dropdown';
    const res = await apiClient.post(endpoint, { flagId: 1 });
    const raw = res?.data?.data || res?.data?.result || res?.data || (Array.isArray(res) ? res : []);
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    if (Array.isArray(list)) {
      return list.map((c) => ({
        CompanyId: Number(c.CompanyId ?? c.id ?? c.CompanyMasterId ?? c.companyId),
        CompanyName: c.CompanyName || c.companyName || c.name || ''
      }));
    }
    return [];
  },

  /**
   * Fetch master departments dropdown (flagId: 2)
   * Route: POST /verp-service/department/dropdown with { flagId: 2 }
   */
  getDepartmentsDropdown: async () => {
    const endpoint = API_ROUTES.DEPARTMENT?.DROPDOWN || '/verp-service/department/dropdown';
    const res = await apiClient.post(endpoint, { flagId: 2 });
    const raw = res?.data?.data || res?.data?.result || res?.data || (Array.isArray(res) ? res : []);
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    if (Array.isArray(list)) {
      return list.map((d) => ({
        DepartmentId: Number(d.DepartmentId ?? d.id ?? d.departmentId),
        DepartmentName: d.DepartmentName || d.departmentName || d.name || '',
        DepartmentCode: d.DepartmentCode || d.departmentCode || d.code || ''
      }));
    }
    return [];
  },

  /**
   * Add new company department (flagId: 1)
   * Route: POST /verp-service/department/add
   * Payload: { flagId: 1, CompanyId, DepartmentId, CreatedByUserName }
   */
  addCompanyDepartment: async (data = {}) => {
    const userName = data.CreatedByUserName || data.CreateByUserName || getUserName() || '';
    const payload = {
      flagId: 1,
      CompanyId: Number(data.CompanyId),
      DepartmentId: Number(data.DepartmentId),
      CreatedByUserName: userName
    };

    const endpoint = API_ROUTES.DEPARTMENT?.ADD || '/verp-service/department/add';
    return apiClient.post(endpoint, payload);
  },

  /**
   * Edit existing company department (flagId: 2)
   * Route: PATCH /verp-service/department/edit
   * Payload: { flagId: 2, ComapnyDepartmentId, CompanyId, DepartmentId, UpdateByUserName }
   */
  editCompanyDepartment: async (data = {}) => {
    const userName = data.UpdateByUserName || data.UpdatedByUserName || getUserName() || '';
    const compDeptId = Number(data.ComapnyDepartmentId ?? data.CompanyDepartmentId ?? data.id);
    const departmentId = Number(data.DepartmentId);
    const companyId = Number(data.CompanyId);

    const payload = {
      flagId: 2,
      ComapnyDepartmentId: compDeptId,
      CompanyId: companyId,
      DepartmentId: departmentId,
      UpdateByUserName: userName
    };

    const endpoint = API_ROUTES.DEPARTMENT?.EDIT || '/verp-service/department/edit';
    return apiClient.patch(endpoint, payload);
  },

  /**
   * Toggle company department status (flagId: 3)
   * Route: PATCH /verp-service/department/status
   * Payload: { flagId: 3, ComapnyDepartmentId, IsDisabled, UpdateByUserName }
   */
  toggleCompanyDepartmentStatus: async (data = {}) => {
    const userName = data.UpdateByUserName || data.UpdatedByUserName || getUserName() || '';
    const companyDepartmentId = Number(data.ComapnyDepartmentId ?? data.CompanyDepartmentId ?? data.id);
    const isDisabled = typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled);

    const payload = {
      flagId: 3,
      ComapnyDepartmentId: companyDepartmentId,
      IsDisabled: isDisabled,
      UpdateByUserName: userName
    };

    const endpoint = API_ROUTES.DEPARTMENT?.STATUS || '/verp-service/department/status';
    return apiClient.patch(endpoint, payload);
  }
};

export default companyDepartmentService;

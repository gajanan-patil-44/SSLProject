// src/services/companyRoleService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const companyRoleService = {
  /**
   * Fetch all company roles (FlagId: 1)
   * Route: POST /verp-service/companyRole/view
   * Payload: { FlagId: 1 }
   */
  getCompanyRoles: async (payload = {}) => {
    return apiClient.post('/verp-service/companyRole/view', {
      FlagId: payload?.FlagId ?? payload?.flagId ?? 1
    });
  },

  /**
   * Fetch dropdown data for company role
   * Route: POST /verp-service/companyRole/dropdown
   * @param {number} flagId 5 for company dropdown, 6 for role dropdown
   */
  getCompanyRoleDropdown: async (flagId) => {
    return apiClient.post(
      API_ROUTES.COMPANY_ROLE.DROPDOWN || '/verp-service/companyRole/dropdown',
      { FlagId: Number(flagId) }
    );
  },

  /**
   * Fetch company dropdown list (FlagId: 5)
   * Route: POST /verp-service/companyRole/dropdown with { FlagId: 5 }
   */
  getCompaniesDropdown: async () => {
    const res = await companyRoleService.getCompanyRoleDropdown(5);
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
   * Fetch master roles dropdown (FlagId: 6)
   * Route: POST /verp-service/companyRole/dropdown with { FlagId: 6 }
   */
  getRolesDropdown: async () => {
    const res = await companyRoleService.getCompanyRoleDropdown(6);
    const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
    if (Array.isArray(raw)) {
      return raw.map((r) => ({
        RoleId: Number(r.RoleId ?? r.id),
        RoleName: r.RoleName || r.name || '',
        RoleCode: r.RoleCode || r.code || ''
      }));
    }
    return [];
  },

  /**
   * Add new company role (FlagId: 2)
   * Route: POST /verp-service/companyRole/add
   * Payload: { FlagId: 2, RoleId, CompanyId, CreatedByUserName }
   */
  addCompanyRole: async (data) => {
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

    return apiClient.post(API_ROUTES.COMPANY_ROLE.ADD, {
      FlagId: Number(data.FlagId || data.flagId || 2),
      RoleId: Number(data.RoleId),
      CompanyId: Number(data.CompanyId),
      CreatedByUserName: userName
    });
  },

  /**
   * Edit existing company role (FlagId: 3)
   * Route: PATCH /verp-service/companyRole/edit
   * Payload: { FlagId: 3, CompanyRoleId, RoleId, UpdatedByUserName }
   */
  editCompanyRole: async (data) => {
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

    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState || '';
    const companyRoleId = Number(data.CompanyRoleId ?? data.id);
    const roleId = Number(data.RoleId);

    return apiClient.patch(API_ROUTES.COMPANY_ROLE.EDIT, {
      FlagId: Number(data.FlagId || data.flagId || 3),
      CompanyRoleId: companyRoleId,
      RoleId: roleId,
      UpdatedByUserName: userName
    });
  },

  /**
   * Toggle company role status (FlagId: 4)
   * Route: PATCH /verp-service/companyRole/status
   * Payload: { FlagId: 4, CompanyRoleId, IsDisabled }
   */
  toggleCompanyRoleStatus: async (data) => {
    const companyRoleId = Number(data.CompanyRoleId ?? data.id);
    return apiClient.patch(API_ROUTES.COMPANY_ROLE.STATUS, {
      FlagId: Number(data.FlagId || data.flagId || 4),
      CompanyRoleId: companyRoleId,
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled)
    });
  }
};

export default companyRoleService;

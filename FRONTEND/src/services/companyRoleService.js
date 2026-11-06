// src/services/companyRoleService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

/**
 * Initial sample company roles to showcase the screen before backend API integration
 */
const INITIAL_MOCK_ROLES = [
  {
    CompanyRoleId: 1,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    RoleName: 'Project Manager',
    RoleCode: 'CR_PM_01',
    RoleDescription: 'Responsible for end-to-end management of engineering projects and team delivery.',
    IsDisabled: false,
    CreatedAt: '2026-11-01T10:00:00.000Z',
    UpdatedAt: null
  },
  {
    CompanyRoleId: 2,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    RoleName: 'Senior Site Engineer',
    RoleCode: 'CR_ENG_02',
    RoleDescription: 'Oversees site execution, equipment maintenance, and field quality checks.',
    IsDisabled: false,
    CreatedAt: '2026-11-02T11:30:00.000Z',
    UpdatedAt: null
  },
  {
    CompanyRoleId: 3,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    RoleName: 'Procurement Specialist',
    RoleCode: 'CR_PROC_03',
    RoleDescription: 'Manages vendor requisitions, quotation analysis, and purchase order tracking.',
    IsDisabled: false,
    CreatedAt: '2026-11-03T09:15:00.000Z',
    UpdatedAt: null
  },
  {
    CompanyRoleId: 4,
    CompanyId: 2,
    CompanyName: 'Vishvin Energy Solutions',
    RoleName: 'Accounts Officer',
    RoleCode: 'CR_ACC_04',
    RoleDescription: 'Handles invoice verification, tax compliance, and budget approvals.',
    IsDisabled: true,
    CreatedAt: '2026-11-04T14:45:00.000Z',
    UpdatedAt: '2026-11-05T08:20:00.000Z'
  }
];

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
    try {
      const res = await companyRoleService.getCompanyRoleDropdown(5);
      const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((c) => ({
          CompanyId: Number(c.CompanyId ?? c.id),
          CompanyName: c.CompanyName || c.name || `Company #${c.CompanyId}`
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch companies via companyRole/dropdown (FlagId: 5):', err);
    }

    try {
      const rawSession = sessionStorage.getItem('session') || localStorage.getItem('session');
      if (rawSession) {
        const s = JSON.parse(rawSession);
        const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || [];
        if (Array.isArray(comps) && comps.length > 0) {
          return comps.map((c) => ({
            CompanyId: Number(c.CompanyId ?? c.id),
            CompanyName: c.CompanyName || c.name || 'Current Company'
          }));
        }
      }
    } catch {}

    return [
      { CompanyId: 1, CompanyName: 'Vishvin Technologies Pvt Ltd' },
      { CompanyId: 2, CompanyName: 'Vishvin Energy Solutions' }
    ];
  },

  /**
   * Fetch master roles dropdown (FlagId: 6)
   * Route: POST /verp-service/companyRole/dropdown with { FlagId: 6 }
   */
  getRolesDropdown: async () => {
    try {
      const res = await companyRoleService.getCompanyRoleDropdown(6);
      const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((r) => ({
          RoleId: Number(r.RoleId ?? r.id),
          RoleName: r.RoleName || r.name || `Role #${r.RoleId}`,
          RoleCode: r.RoleCode || r.code || ''
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch roles via companyRole/dropdown (FlagId: 6):', err);
    }

    try {
      const res = await apiClient.post(API_ROUTES.ROLE.GET_ROLE, { FlagId: 1 });
      const raw = res?.data?.data || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((r) => ({
          RoleId: Number(r.RoleId ?? r.id),
          RoleName: r.RoleName || r.name || `Role #${r.RoleId}`,
          RoleCode: r.RoleCode || r.code || ''
        }));
      }
    } catch {}
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

    const userName = data.CreatedByUserName || data.CreateByUserName || userState || 'Admin';

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

    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState || 'Admin';
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


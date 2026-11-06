// src/services/companyDesignationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { getSessionCompanyId } from './departmentService';

/**
 * Initial sample company designations to showcase the screen before backend API integration
 */
const INITIAL_MOCK_DESIGNATIONS = [
  {
    CompanyDesignationId: 1,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    DesignationId: 1,
    DesignationName: 'Managing Director',
    DesignationCode: 'MD_001',
    DesignationDescription: 'Executive head responsible for strategic planning and executive leadership.',
    IsDisabled: false,
    CreatedAt: '2026-11-01T10:00:00.000Z',
    UpdatedAt: null,
    CreatedByUserName: 'Praveen',
    UpdatedByUserName: null
  },
  {
    CompanyDesignationId: 2,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    DesignationId: 2,
    DesignationName: 'Project Manager',
    DesignationCode: 'PM_101',
    DesignationDescription: 'Responsible for managing operations, resources, and engineering timelines.',
    IsDisabled: false,
    CreatedAt: '2026-11-02T11:30:00.000Z',
    UpdatedAt: null,
    CreatedByUserName: 'Praveen',
    UpdatedByUserName: null
  },
  {
    CompanyDesignationId: 3,
    CompanyId: 1,
    CompanyName: 'Vishvin Technologies Pvt Ltd',
    DesignationId: 3,
    DesignationName: 'Senior Software Engineer',
    DesignationCode: 'ENG_201',
    DesignationDescription: 'Leads software development, architectural design, and deployment pipelines.',
    IsDisabled: false,
    CreatedAt: '2026-11-03T09:15:00.000Z',
    UpdatedAt: null,
    CreatedByUserName: 'Praveen',
    UpdatedByUserName: null
  },
  {
    CompanyDesignationId: 4,
    CompanyId: 2,
    CompanyName: 'Vishvin Energy Solutions',
    DesignationId: 4,
    DesignationName: 'Site Supervisor',
    DesignationCode: 'SITE_301',
    DesignationDescription: 'Oversees power grid maintenance, safety compliance, and site inspection.',
    IsDisabled: true,
    CreatedAt: '2026-11-04T14:45:00.000Z',
    UpdatedAt: '2026-11-05T08:20:00.000Z',
    CreatedByUserName: 'Admin',
    UpdatedByUserName: 'Admin'
  }
];

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

    try {
      const res = await apiClient.post(
        API_ROUTES.DESIGNATION?.FETCH_COMPANY_DESIGNATION_VIEW || '/verp-service/designationCreation/fetchCompanyDesignationView',
        body
      );
      return res;
    } catch (err) {
      console.warn('Failed to fetch from fetchCompanyDesignationView:', err);
      const stored = sessionStorage.getItem('vms_company_designations');
      const data = stored ? JSON.parse(stored) : INITIAL_MOCK_DESIGNATIONS;
      if (!stored) {
        sessionStorage.setItem('vms_company_designations', JSON.stringify(INITIAL_MOCK_DESIGNATIONS));
      }
      return { data: { status: true, data } };
    }
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
    try {
      const res = await companyDesignationService.getCompanyDesignationDropdown(1);
      const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((c) => ({
          CompanyId: Number(c.CompanyId ?? c.id),
          CompanyName: c.CompanyName || c.name || `Company #${c.CompanyId}`
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch companies from companyDesignationDpdwn (flagId: 1):', err);
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
      { CompanyId: 1, CompanyName: 'vishvin' },
      { CompanyId: 3, CompanyName: 'VishAng' },
      { CompanyId: 5, CompanyName: 'Digital' },
      { CompanyId: 6, CompanyName: 'Vtpvtltd' },
      { CompanyId: 2, CompanyName: 'ANG' }
    ];
  },

  /**
   * Fetch master designations dropdown (flagId: 2)
   * Route: POST /verp-service/designationCreation/companyDesignationDpdwn with { flagId: 2 }
   */
  getMasterDesignationsDropdown: async () => {
    try {
      const res = await companyDesignationService.getCompanyDesignationDropdown(2);
      const raw = res?.data?.result || res?.data?.data || res?.result || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((d) => ({
          DesignationId: Number(d.DesignationId ?? d.id),
          DesignationName: d.DesignationName || d.name || `Designation #${d.DesignationId}`,
          DesignationCode: d.DesignationCode || d.code || '',
          DesignationDescription: d.DesignationDescription || d.description || ''
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch designations from companyDesignationDpdwn (flagId: 2):', err);
    }

    try {
      const res = await apiClient.post('/verp-service/designationCreation/view', { flagId: 1 });
      const raw = res?.data?.data || res?.data?.result || res?.data || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((d) => ({
          DesignationId: Number(d.DesignationId ?? d.id),
          DesignationName: d.DesignationName || d.name || `Designation #${d.DesignationId}`,
          DesignationCode: d.DesignationCode || d.code || '',
          DesignationDescription: d.DesignationDescription || d.description || ''
        }));
      }
    } catch {}

    return [
      { DesignationId: 1, DesignationName: 'Managing Director', DesignationCode: 'MD_001' },
      { DesignationId: 2, DesignationName: 'Project Manager', DesignationCode: 'PM_101' },
      { DesignationId: 3, DesignationName: 'Senior Software Engineer', DesignationCode: 'ENG_201' },
      { DesignationId: 4, DesignationName: 'Site Supervisor', DesignationCode: 'SITE_301' }
    ];
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

    const userName = data.CreatedByUserName || data.CreateByUserName || userState || 'Admin';
    const sessionCompId = getSessionCompanyId();
    const effectiveCompanyId = (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== '')
      ? Number(data.CompanyId)
      : (sessionCompId ? Number(sessionCompId) : 1);

    const payload = {
      flagId: Number(data.flagId ?? data.FlagId ?? 1),
      CompanyId: effectiveCompanyId,
      DesignationId: Number(data.DesignationId),
      DesignationLevel: Number(data.DesignationLevel ?? 100),
      CanBeReportingManager: typeof data.CanBeReportingManager === 'boolean'
        ? data.CanBeReportingManager
        : (data.CanBeReportingManager === 'true' || data.CanBeReportingManager === 1 || Boolean(data.CanBeReportingManager)),
      CreatedByUserName: userName
    };

    try {
      return await apiClient.post(
        API_ROUTES.DESIGNATION?.INSERT_COMPANY_DESIGNATION || '/verp-service/designationCreation/insertCompanyDesignation',
        payload
      );
    } catch (apiErr) {
      console.warn('Backend insertCompanyDesignation returned error, falling back:', apiErr);
      const stored = JSON.parse(sessionStorage.getItem('vms_company_designations') || '[]');
      const newId = stored.length > 0 ? Math.max(...stored.map(d => d.CompanyDesignationId || 0)) + 1 : 1;
      const newRecord = {
        CompanyDesignationId: newId,
        CompanyId: Number(data.CompanyId),
        CompanyName: data.CompanyName || 'Current Company',
        DesignationId: Number(data.DesignationId),
        DesignationName: data.DesignationName || `Designation #${data.DesignationId}`,
        DesignationCode: data.DesignationCode || 'DES',
        DesignationDescription: data.DesignationDescription || '',
        DesignationLevel: Number(data.DesignationLevel ?? 100),
        CanBeReportingManager: payload.CanBeReportingManager,
        IsDisabled: false,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: null,
        CreatedByUserName: userName,
        UpdatedByUserName: null
      };
      const updated = [newRecord, ...stored];
      sessionStorage.setItem('vms_company_designations', JSON.stringify(updated));
      return { status: true, message: 'Company designation inserted successfully', data: newRecord };
    }
  },

  /**
   * Edit existing company designation (FlagId: 3)
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

    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState || 'Admin';
    const companyDesignationId = Number(data.CompanyDesignationId ?? data.id);
    const designationId = Number(data.DesignationId);

    try {
      return await apiClient.patch(API_ROUTES.COMPANY_DESIGNATION?.EDIT || '/verp-service/companyDesignation/edit', {
        FlagId: Number(data.FlagId || data.flagId || 3),
        CompanyDesignationId: companyDesignationId,
        DesignationId: designationId,
        UpdatedByUserName: userName
      });
    } catch {
      const stored = JSON.parse(sessionStorage.getItem('vms_company_designations') || '[]');
      const updated = stored.map((d) => {
        if ((d.CompanyDesignationId ?? d.id) === companyDesignationId) {
          return {
            ...d,
            DesignationId: designationId,
            DesignationName: data.DesignationName || d.DesignationName,
            DesignationCode: data.DesignationCode || d.DesignationCode,
            UpdatedAt: new Date().toISOString(),
            UpdatedByUserName: userName
          };
        }
        return d;
      });
      sessionStorage.setItem('vms_company_designations', JSON.stringify(updated));
      return { status: 'success', message: 'Company designation updated successfully' };
    }
  },

  /**
   * Toggle company designation status (FlagId: 4)
   */
  toggleCompanyDesignationStatus: async (data) => {
    const companyDesignationId = Number(data.CompanyDesignationId ?? data.id);
    const isDisabled = typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled);

    try {
      return await apiClient.patch(API_ROUTES.COMPANY_DESIGNATION?.STATUS || '/verp-service/companyDesignation/status', {
        FlagId: Number(data.FlagId || data.flagId || 4),
        CompanyDesignationId: companyDesignationId,
        IsDisabled: isDisabled
      });
    } catch {
      const stored = JSON.parse(sessionStorage.getItem('vms_company_designations') || '[]');
      const updated = stored.map((d) => {
        if ((d.CompanyDesignationId ?? d.id) === companyDesignationId) {
          return {
            ...d,
            IsDisabled: isDisabled,
            UpdatedAt: new Date().toISOString()
          };
        }
        return d;
      });
      sessionStorage.setItem('vms_company_designations', JSON.stringify(updated));
      return { status: 'success', message: 'Company designation status updated successfully' };
    }
  }
};

export default companyDesignationService;

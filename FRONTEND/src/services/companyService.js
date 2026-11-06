// src/services/companyService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const companyService = {
  /**
   * Get all active companies (flagId: 1)
   */
  getCompanies: async () => {
    return apiClient.post(API_ROUTES.COMPANY.GET_COMPANIES, {
      flagId: 1
    });
  },

  /**
   * Get all active companies from company master (flagId: 1)
   * Route: /verp-service/companyMaster/getCompanyMaster
   * @param {Object} payload - { flagId: 1 }
   */
  getCompanyMaster: async (payload = { flagId: 1 }) => {
    return apiClient.post(API_ROUTES.COMPANY_MASTER.GET_COMPANY_MASTER, {
      flagId: payload?.flagId !== undefined ? payload.flagId : 1,
      ...payload
    });
  },

  /**
   * Add company master entry (flagId: 2)
   * Route: /verp-service/companyMaster/addCompanyMaster
   */
  addCompanyMaster: async (data) => {
    const sessionUserName = (() => {
      try {
<<<<<<< HEAD
        const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
=======
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
        if (raw) {
          const s = JSON.parse(raw);
          return s?.data?.user?.loginName || s?.data?.user?.LoginName || s?.data?.user?.EmployeeId || s?.data?.user?.name || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
      } catch {
        return '';
      }
    })();

    const userName = data.CreatedByUserName || sessionUserName;

    return apiClient.post(API_ROUTES.COMPANY_MASTER.ADD_COMPANY_MASTER, {
      flagId: 2,
      CompanyName: data.CompanyName || data.companyName || '',
      CompanyCode: data.CompanyCode || data.companyCode || '',
      ContactNumber: data.ContactNumber || data.contactNumber || data.PhoneNumber || data.phoneNumber || '',
      EmailId: data.EmailId || data.emailId || data.Email || data.email || '',
      GSTNo: data.GSTNo || data.gstNo || data.GstNo || '',
      PanNo: data.PanNo || data.panNo || '',
      Address: data.Address || data.address || '',
      CreatedByUserName: userName
    });
  },

  /**
   * Update company master entry (flagId: 3)
   * Route: /verp-service/companyMaster/updateCompanyMaster
   */
  updateCompanyMaster: async (data) => {
    const sessionUserName = (() => {
      try {
<<<<<<< HEAD
        const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
=======
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
        if (raw) {
          const s = JSON.parse(raw);
          const user = s?.data?.user || s?.user || s;
          return user?.loginName || user?.LoginName || user?.EmployeeId || user?.name || user?.userName || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
      } catch {
        return '';
      }
    })();

    const userName = data.UpdatedByUserName || sessionUserName;
    const companyMasterId = Number(
      data.CompanyMasterId ?? data.companyMasterId ?? data.CompanyId ?? data.companyId ?? data.id
    );

    const payload = {
      flagId: 3,
      CompanyMasterId: companyMasterId,
      CompanyName: data.CompanyName || data.companyName || '',
      CompanyCode: data.CompanyCode || data.companyCode || '',
      ContactNumber: data.ContactNumber || data.contactNumber || data.PhoneNumber || data.phoneNumber || data.phone || '',
      EmailId: data.EmailId || data.emailId || data.Email || data.email || '',
      GSTNo: data.GSTNo || data.gstNo || data.GstNo || '',
      PanNo: data.PanNo || data.panNo || '',
      Address: data.Address || data.address || '',
      UpdatedByUserName: userName
    };

    return apiClient.patch(API_ROUTES.COMPANY_MASTER.UPDATE_COMPANY_MASTER, payload);
  },

  /**
   * Toggle company master status (flagId: 4)
   * Route: /verp-service/companyMaster/toggleCompanyMasterStatus
   */
  toggleCompanyMasterStatus: async (data) => {
    const sessionUserName = (() => {
      try {
<<<<<<< HEAD
        const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
=======
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
        if (raw) {
          const s = JSON.parse(raw);
          const user = s?.data?.user || s?.user || s;
          return user?.loginName || user?.LoginName || user?.EmployeeId || user?.name || user?.userName || '';
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
      } catch {
        return '';
      }
    })();

    const userName = data.UpdatedByUserName || sessionUserName;
    const companyMasterId = Number(
      data.CompanyMasterId ?? data.companyMasterId ?? data.CompanyId ?? data.companyId ?? data.id
    );

    const payload = {
      flagId: 4,
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled),
      UpdatedByUserName: userName,
      CompanyMasterId: companyMasterId
    };

    return apiClient.patch(API_ROUTES.COMPANY_MASTER.TOGGLE_COMPANY_MASTER_STATUS, payload);
  },

  /**
   * Delete company master (flagId: 5)
   * Route: /verp-service/companyMaster/deleteCompanyMaster
   */
  deleteCompanyMaster: async (data) => {
    const companyMasterId = Number(
      typeof data === 'object'
        ? (data.CompanyMasterId ?? data.companyMasterId ?? data.CompanyId ?? data.companyId ?? data.id)
        : data
    );

    const payload = {
      flagId: 5,
      CompanyMasterId: companyMasterId
    };

    return apiClient.post(API_ROUTES.COMPANY_MASTER.DELETE_COMPANY_MASTER, payload);
  },

  /**
   * Add a new company (flagId: 2)
   */
  addCompany: async (companyData) => {
    return apiClient.post(API_ROUTES.COMPANY.ADD_COMPANY, {
      flagId: 2,
      CompanyName: companyData.CompanyName || companyData.companyName || '',
      CompanyCode: companyData.CompanyCode || companyData.companyCode || '',
      CreatedByUserName: companyData.CreatedByUserName || '',
      UpdatedByUserName: companyData.UpdatedByUserName || '',
      IsDisabled: typeof companyData.IsDisabled === 'boolean' ? companyData.IsDisabled : false,
      Email: companyData.Email || companyData.email || '',
      PhoneNumber: companyData.PhoneNumber || companyData.phone || '',
      Address: companyData.Address || companyData.address || ''
    });
  },

  /**
   * Update existing company (flagId: 3)
   */
  updateCompany: async (companyData) => {
    return apiClient.patch(API_ROUTES.COMPANY.UPDATE_COMPANY, {
      flagId: 3,
      CompanyId: Number(companyData.CompanyId ?? companyData.id),
      CompanyName: companyData.CompanyName || companyData.companyName || '',
      CompanyCode: companyData.CompanyCode || companyData.companyCode || '',
      UpdatedByUserName: companyData.UpdatedByUserName || '',
      Email: companyData.Email || companyData.email || '',
      PhoneNumber: companyData.PhoneNumber || companyData.phone || '',
      Address: companyData.Address || companyData.address || ''
    });
  },

  /**
   * Toggle company status (flagId: 4)
   */
  toggleCompanyStatus: async (statusData) => {
    return apiClient.patch(API_ROUTES.COMPANY.TOGGLE_STATUS, {
      flagId: 4,
      CompanyId: Number(statusData.CompanyId ?? statusData.id),
      IsDisabled: typeof statusData.IsDisabled === 'boolean' ? statusData.IsDisabled : Boolean(statusData.IsDisabled),
      UpdatedByUserName: statusData.UpdatedByUserName || ''
    });
  },

  /**
   * Delete / Disable company (flagId: 5)
   */
  deleteCompany: async (deleteData) => {
    return apiClient.post(API_ROUTES.COMPANY.DELETE_COMPANY, {
      flagId: 5,
      ...deleteData
    });
  }
};

export default companyService;

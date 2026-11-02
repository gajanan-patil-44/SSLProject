// src/services/locationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

// Helper to extract session username
const getSessionUserName = () => {
  try {
    const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const user = s?.data?.user || s?.user || s;
      return user?.loginName || user?.LoginName || user?.EmployeeId || user?.userName || user?.name || '';
    }
    const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
    return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
  } catch {
    return '';
  }
};

export const locationService = {
  /**
   * Fetch Location Types dropdown
   * Route: /verp-service/locationMaster/getLocationTypes
   * Payload: { "flagId": 1 }
   */
  getLocationTypes: async () => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.GET_LOCATION_TYPES ||
      API_ROUTES?.LOCATION?.GET_LOCATION_TYPES ||
      '/verp-service/locationMaster/getLocationTypes';

    return apiClient.post(endpoint, {
      flagId: 1
    });
  },

  /**
   * Fetch Company Master dropdown for selected Location Type
   * Route: /verp-service/locationMaster/getParentLocationTypes
   * Payload: { "flagId": 2, "LocationTypeMasterId": number }
   */
  getParentLocationTypes: async (data) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.GET_PARENT_LOCATION_TYPES ||
      API_ROUTES?.LOCATION?.GET_PARENT_LOCATION_TYPES ||
      '/verp-service/locationMaster/getParentLocationTypes';

    const locTypeId = data?.LocationTypeMasterId !== undefined && data?.LocationTypeMasterId !== null
      ? Number(data.LocationTypeMasterId)
      : null;

    return apiClient.post(endpoint, {
      flagId: 2,
      LocationTypeMasterId: locTypeId
    });
  },

  /**
   * Fetch Parent Location Master dropdown for selected Location Type and Company
   * Route: /verp-service/locationMaster/getParentLocations
   * Payload: { "flagId": 3, "LocationTypeMasterId": number, "CompanyMasterId": number }
   */
  getParentLocations: async (data) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.GET_PARENT_LOCATIONS ||
      API_ROUTES?.LOCATION?.GET_PARENT_LOCATIONS ||
      '/verp-service/locationMaster/getParentLocations';

    const locTypeId = data?.LocationTypeMasterId !== undefined && data?.LocationTypeMasterId !== null
      ? Number(data.LocationTypeMasterId)
      : null;

    const companyId = data?.CompanyMasterId !== undefined && data?.CompanyMasterId !== null
      ? Number(data.CompanyMasterId)
      : null;

    return apiClient.post(endpoint, {
      flagId: 3,
      LocationTypeMasterId: locTypeId,
      CompanyMasterId: companyId
    });
  },

  /**
   * View all locations
   * Route: /verp-service/locationMaster/view (flagId: 1)
   */
  getLocationMaster: async () => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.VIEW ||
      API_ROUTES?.LOCATION?.VIEW ||
      '/verp-service/locationMaster/view';

    return apiClient.post(endpoint, {
      flagId: 1
    });
  },

  /**
   * Add a new location
   * Route: /verp-service/locationMaster/addLocationMaster
   * Payload:
   * {
   *   "flagId": 4,
   *   "CompanyMasterId": number | null,
   *   "LocationTypeMasterId": number,
   *   "ParentLocationMasterId": number | null,
   *   "LocationName": string,
   *   "ContactPerson": string,
   *   "ContactNumber": string,
   *   "EmailId": string,
   *   "Address": string,
   *   "CreatedByUserName": string
   * }
   */
  addLocationMaster: async (data) => {
    const sessionUser = getSessionUserName() || 'Admin';

    const companyId = data.CompanyMasterId !== undefined && data.CompanyMasterId !== '' && data.CompanyMasterId !== null
      ? Number(data.CompanyMasterId)
      : null;

    const parentLocationId = data.ParentLocationMasterId !== undefined && data.ParentLocationMasterId !== '' && data.ParentLocationMasterId !== null
      ? Number(data.ParentLocationMasterId)
      : null;

    const locationTypeId = Number(data.LocationTypeMasterId);

    const endpoint = API_ROUTES?.LOCATION_MASTER?.ADD_LOCATION_MASTER ||
      API_ROUTES?.LOCATION_MASTER?.ADD ||
      '/verp-service/locationMaster/addLocationMaster';

    const payload = {
      flagId: 4,
      CompanyMasterId: companyId,
      LocationTypeMasterId: locationTypeId,
      ParentLocationMasterId: parentLocationId,
      LocationName: String(data.LocationName || '').trim(),
      ContactPerson: String(data.ContactPerson || '').trim(),
      ContactNumber: String(data.ContactNumber || '').trim(),
      EmailId: String(data.EmailId || '').trim(),
      Address: String(data.Address || '').trim(),
      CreatedByUserName: data.CreatedByUserName || sessionUser
    };

    return apiClient.post(endpoint, payload);
  },

  /**
   * Get location dropdown list
   * Route: /verp-service/locationMaster/dropdown (flagId: 3)
   */
  getLocationDropdown: async () => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.DROPDOWN ||
      API_ROUTES?.LOCATION?.DROPDOWN ||
      '/verp-service/locationMaster/dropdown';

    return apiClient.post(endpoint, {
      flagId: 3
    });
  },

  /**
   * Update / Edit location
   */
  editLocationMaster: async (data) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.EDIT ||
      API_ROUTES?.LOCATION?.EDIT ||
      '/verp-service/locationMaster/edit';

    const sessionUser = getSessionUserName() || 'Admin';

    const payload = {
      flagId: 2,
      LocationMasterId: Number(data.LocationMasterId),
      CompanyMasterId: data.CompanyMasterId ? Number(data.CompanyMasterId) : null,
      LocationTypeMasterId: Number(data.LocationTypeMasterId),
      ParentLocationMasterId: data.ParentLocationMasterId ? Number(data.ParentLocationMasterId) : null,
      LocationName: String(data.LocationName || '').trim(),
      ContactPerson: String(data.ContactPerson || '').trim(),
      ContactNumber: String(data.ContactNumber || '').trim(),
      EmailId: String(data.EmailId || '').trim(),
      Address: String(data.Address || '').trim(),
      UpdatedByUserName: data.UpdatedByUserName || sessionUser
    };

    try {
      return await apiClient.patch(endpoint, payload);
    } catch (err) {
      if (err?.response?.status === 405) {
        return await apiClient.post(endpoint, payload);
      }
      throw err;
    }
  }
};

export default locationService;

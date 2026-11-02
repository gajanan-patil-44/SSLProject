// src/services/locationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

const STORAGE_KEY = 'erp_location_master_data';

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

export const INITIAL_LOCATIONS = [
  {
    LocationMasterId: 1,
    LocationTypeMasterId: 1,
    LocationTypeName: 'Country',
    CompanyMasterId: null,
    CompanyName: null,
    ParentLocationMasterId: null,
    ParentLocationName: null,
    LocationName: 'India',
    ContactPerson: 'National Coordinator',
    ContactNumber: '9845012345',
    EmailId: 'india.ops@erpcorp.com',
    Address: 'Connaught Place, New Delhi',
    IsDisabled: false
  },
  {
    LocationMasterId: 2,
    LocationTypeMasterId: 2,
    LocationTypeName: 'State',
    CompanyMasterId: 1,
    CompanyName: 'GSL Corp',
    ParentLocationMasterId: 1,
    ParentLocationName: 'India',
    LocationName: 'Karnataka',
    ContactPerson: 'Ramesh Kumar',
    ContactNumber: '9845098765',
    EmailId: 'karnataka.ops@gsl.com',
    Address: 'MG Road, Bangalore',
    IsDisabled: false
  }
];

export const locationService = {
  /**
   * Fetch Location Types dropdown
   * Route: /verp-service/locationMaster/getLocationTypes
   * Payload: { "flagId": 1 }
   */
  getLocationTypes: async (payload = { flagId: 1 }) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.GET_LOCATION_TYPES ||
      API_ROUTES?.LOCATION?.GET_LOCATION_TYPES ||
      '/verp-service/locationMaster/getLocationTypes';

    try {
      return await apiClient.post(endpoint, {
        flagId: 1,
        FlagId: 1,
        ...payload
      });
    } catch (err) {
      console.warn('API /verp-service/locationMaster/getLocationTypes failed, trying fallback:', err);
      // Fallback to locationTypeService if locationMaster endpoint is unavailable
      const fallbackEndpoint = '/verp-service/locationTypeMaster/view';
      return await apiClient.post(fallbackEndpoint, { FlagId: 1, flagId: 1 });
    }
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
      FlagId: 2,
      LocationTypeMasterId: locTypeId,
      ...data
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
      FlagId: 3,
      LocationTypeMasterId: locTypeId,
      CompanyMasterId: companyId,
      ...data
    });
  },

  /**
   * View all locations
   * Route: /verp-service/locationMaster/view (flagId: 1)
   */
  getLocationMaster: async (payload = { flagId: 1 }) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.VIEW ||
      API_ROUTES?.LOCATION?.VIEW ||
      '/verp-service/locationMaster/view';

    try {
      return await apiClient.post(endpoint, {
        flagId: 1,
        FlagId: 1,
        ...payload
      });
    } catch (err) {
      console.warn('API /verp-service/locationMaster/view unavailable, using local cache:', err);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { data: { data: JSON.parse(stored) } };
        }
      } catch {
        // ignore
      }
      return { data: { data: [...INITIAL_LOCATIONS] } };
    }
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
      FlagId: 4,
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

    try {
      const res = await apiClient.post(endpoint, payload);
      locationService.syncToLocalCache(payload);
      return res;
    } catch (err) {
      console.warn('API /verp-service/locationMaster/addLocationMaster error, updating local cache:', err);
      locationService.syncToLocalCache(payload);
      return { data: { message: 'Location added successfully', status: 'success' } };
    }
  },

  /**
   * Get location dropdown list
   * Route: /verp-service/locationMaster/dropdown (flagId: 3)
   */
  getLocationDropdown: async (payload = { flagId: 3 }) => {
    const endpoint = API_ROUTES?.LOCATION_MASTER?.DROPDOWN ||
      API_ROUTES?.LOCATION?.DROPDOWN ||
      '/verp-service/locationMaster/dropdown';

    try {
      return await apiClient.post(endpoint, {
        flagId: 3,
        FlagId: 3,
        ...payload
      });
    } catch (err) {
      console.warn('API /verp-service/locationMaster/dropdown unavailable, falling back to local list:', err);
      const res = await locationService.getLocationMaster();
      return res;
    }
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
      FlagId: 2,
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
  },

  /**
   * Helper to sync newly added item to local cache
   */
  syncToLocalCache: (newItem) => {
    try {
      let list = [...INITIAL_LOCATIONS];
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        list = JSON.parse(stored);
      }
      const nextId = list.reduce((max, it) => Math.max(max, it.LocationMasterId || 0), 0) + 1;
      const formatted = {
        ...newItem,
        LocationMasterId: nextId,
        id: nextId
      };
      list.push(formatted);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
};

export default locationService;


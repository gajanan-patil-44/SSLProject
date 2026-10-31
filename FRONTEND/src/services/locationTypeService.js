// src/services/locationTypeService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

const STORAGE_KEY = 'erp_location_type_flow';

export const INITIAL_LOCATION_FLOW = [
  { LocationTypeMasterId: 1, LocationTypeMasterName: 'Country', ParentTypeId: null, ParentLocationTypeName: null, childName: 'Country', parentName: '-' },
  { LocationTypeMasterId: 2, LocationTypeMasterName: 'State', ParentTypeId: 1, ParentLocationTypeName: 'Country', childName: 'State', parentName: 'Country' },
  { LocationTypeMasterId: 3, LocationTypeMasterName: 'District', ParentTypeId: 2, ParentLocationTypeName: 'State', childName: 'District', parentName: 'State' },
  { LocationTypeMasterId: 4, LocationTypeMasterName: 'Taluk', ParentTypeId: 3, ParentLocationTypeName: 'District', childName: 'Taluk', parentName: 'District' }
];

export const locationTypeService = {
  /**
   * View / Fetch all location types (FlagId: 1)
   * Route: /verp-service/locationTypeMaster/view
   * @param {Object} payload - { FlagId: 1 }
   */
  getLocationTypeMaster: async (payload = { FlagId: 1 }) => {
    const endpoint = API_ROUTES?.LOCATION_TYPE_MASTER?.VIEW ||
      API_ROUTES?.LOCATION_TYPE?.VIEW ||
      '/verp-service/locationTypeMaster/view';

    return apiClient.post(endpoint, {
      FlagId: 1,
      ...payload
    });
  },

  /**
   * Fetch parent location dropdown (FlagId: 3)
   * Route: /verp-service/locationTypeMaster/dropdown
   * @param {Object} payload - { FlagId: 3 }
   */
  getParentDropdown: async (payload = { FlagId: 3 }) => {
    const endpoint = API_ROUTES?.LOCATION_TYPE_MASTER?.DROPDOWN ||
      API_ROUTES?.LOCATION_TYPE?.DROPDOWN ||
      '/verp-service/locationTypeMaster/dropdown';

    return apiClient.post(endpoint, {
      FlagId: 3,
      ...payload
    });
  },

  /**
   * Fetch all location flow types with fallback to cached storage
   */
  getLocationTypes: async () => {
    try {
      const res = await locationTypeService.getLocationTypeMaster({ FlagId: 1 });
      const rawList = res?.data?.data || res?.data || res;
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList;
      }
    } catch (err) {
      console.warn('API /verp-service/locationTypeMaster/view unavailable, falling back to local flow cache:', err);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }

    // initialize storage with default flow if empty
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOCATION_FLOW));
    } catch {}
    return [...INITIAL_LOCATION_FLOW];
  },

  /**
   * Add a new location type master entry (FlagId: 2)
   * Route: /verp-service/locationTypeMaster/add
   * @param {Object} data - { LocationTypeMasterName, ParentTypeId, CreatedByUserName }
   */
  addLocationTypeMaster: async (data) => {
    const sessionUserName = (() => {
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
    })();

    const userName = data.CreatedByUserName || sessionUserName;
    const parentTypeId = data.ParentTypeId !== undefined && data.ParentTypeId !== '' && data.ParentTypeId !== null
      ? Number(data.ParentTypeId)
      : null;

    const endpoint = API_ROUTES?.LOCATION_TYPE_MASTER?.ADD ||
      API_ROUTES?.LOCATION_TYPE?.ADD ||
      '/verp-service/locationTypeMaster/add';

    const payload = {
      FlagId: 2,
      LocationTypeMasterName: data.LocationTypeMasterName || data.childName || '',
      ParentTypeId: parentTypeId,
      CreatedByUserName: userName
    };

    return apiClient.post(endpoint, payload);
  },

  /**
   * Edit / Update existing location type master entry (FlagId: 4)
   * Route: /verp-service/locationTypeMaster/edit
   * @param {Object} data - { LocationTypeMasterId, LocationTypeMasterName, ParentTypeId, UpdatedByUserName }
   */
  editLocationTypeMaster: async (data) => {
    const sessionUserName = (() => {
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
    })();

    const userName = data.UpdatedByUserName || sessionUserName;
    const locationTypeId = Number(
      data.LocationTypeMasterId ?? data.LocationTypeId ?? data.id
    );
    const parentTypeId = data.ParentTypeId !== undefined && data.ParentTypeId !== '' && data.ParentTypeId !== null
      ? Number(data.ParentTypeId)
      : null;

    const endpoint = API_ROUTES?.LOCATION_TYPE_MASTER?.EDIT ||
      API_ROUTES?.LOCATION_TYPE?.EDIT ||
      '/verp-service/locationTypeMaster/edit';

    const payload = {
      FlagId: 4,
      LocationTypeMasterId: locationTypeId,
      LocationTypeMasterName: data.LocationTypeMasterName || data.childName || '',
      ParentTypeId: parentTypeId,
      UpdatedByUserName: userName
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
   * Save a new location type flow entry
   */
  addLocationType: async ({ childName, parentName }) => {
    const list = await locationTypeService.getLocationTypes();
    const newId = list.length > 0 ? Math.max(...list.map(item => Number(item.id) || 0)) + 1 : 1;
    const newItem = {
      id: newId,
      childName: childName.trim(),
      parentName: parentName ? parentName.trim() : '-'
    };
    const updated = [...list, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  },

  /**
   * Update an existing location type flow entry
   */
  updateLocationType: async (id, { childName, parentName }) => {
    const list = await locationTypeService.getLocationTypes();
    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          childName: childName.trim(),
          parentName: parentName ? parentName.trim() : '-'
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(item => item.id === id);
  },

  /**
   * Delete a location type flow entry
   */
  deleteLocationType: async (id) => {
    const list = await locationTypeService.getLocationTypes();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  /**
   * Reset flow to initial mock data
   */
  resetToDefault: async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOCATION_FLOW));
    return [...INITIAL_LOCATION_FLOW];
  }
};

export default locationTypeService;


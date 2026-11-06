// src/services/locationTypeService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

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
   * Fetch all location flow types
   */
  getLocationTypes: async () => {
    const res = await locationTypeService.getLocationTypeMaster({ FlagId: 1 });
    const rawList = res?.data?.data || res?.data || res;
    return Array.isArray(rawList) ? rawList : [];
  },

  /**
   * Add a new location type master entry (FlagId: 2)
   * Route: /verp-service/locationTypeMaster/add
   * @param {Object} data - { LocationTypeMasterName, ParentTypeId, CreatedByUserName }
   */
  addLocationTypeMaster: async (data) => {
    const sessionUserName = (() => {
      try {
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
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
        const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
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
  }
};

export default locationTypeService;

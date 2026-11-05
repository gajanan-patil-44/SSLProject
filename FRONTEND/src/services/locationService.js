// src/services/locationService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

// Helper to extract session username dynamically (loginName)
const getSessionUserName = () => {
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      return s?.data?.user?.loginName || s?.user?.loginName || '';
    }
  } catch {
    return '';
  }
  return '';
};

// Helper to extract session company ID dynamically from session context.companies
const getSessionCompanyId = () => {
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const companies = s?.data?.context?.companies || s?.context?.companies;
      if (Array.isArray(companies) && companies.length > 0) {
        const id = companies[0]?.CompanyId ?? companies[0]?.CompanyMasterId;
        if (id !== undefined && id !== null && id !== '') return Number(id);
      }
    }
  } catch {
    return null;
  }
  return null;
};

export const locationService = {
  /**
   * 1. Fetch Location Types dropdown
   * Route: POST /verp-service/locationMaster/locationType
   * Payload: { "flagId": 1 }
   */
  getLocationTypes: async () => {
    return apiClient.post(API_ROUTES.LOCATION_MASTER.LOCATION_TYPE, {
      flagId: 1
    });
  },

  /**
   * 2. Fetch Parent Location Type dropdown for selected Location Type
   * Route: POST /verp-service/locationMaster/parentLocationType
   * Payload: { "flagId": 2, "LocationTypeMasterId": number }
   */
  getParentLocationType: async (data) => {
    const locTypeId = typeof data === 'object' && data !== null
      ? Number(data.LocationTypeMasterId)
      : Number(data);

    return apiClient.post(API_ROUTES.LOCATION_MASTER.PARENT_LOCATION_TYPE, {
      flagId: 2,
      LocationTypeMasterId: locTypeId
    });
  },

  // Backward compatibility alias
  getParentLocationTypes: async (data) => {
    return locationService.getParentLocationType(data);
  },

  /**
   * 3. Fetch Parent Location Master dropdown for selected Parent Location Type
   * Route: POST /verp-service/locationMaster/parentLocationMaster
   * Payload: { "flagId": 3, "ParentLocationTypeMasterId": number }
   */
  getParentLocationMaster: async (data) => {
    const parentLocTypeId = typeof data === 'object' && data !== null
      ? Number(data.ParentLocationTypeMasterId)
      : Number(data);

    return apiClient.post(API_ROUTES.LOCATION_MASTER.PARENT_LOCATION_MASTER, {
      flagId: 3,
      ParentLocationTypeMasterId: parentLocTypeId
    });
  },

  // Backward compatibility alias
  getParentLocations: async (data) => {
    return locationService.getParentLocationMaster(data);
  },

  /**
   * View all locations
   * Route: /verp-service/locationMaster/view (flagId: 1)
   */
  getLocationMaster: async () => {
    return apiClient.post(API_ROUTES.LOCATION_MASTER.VIEW, {
      flagId: 1
    });
  },

  /**
   * 4. Add a new location
   * Route: POST /verp-service/locationMaster/addLocationMaster
   * Dynamic payload strictly matching API requirements without hardcoding or fallbacks
   */
  addLocationMaster: async (data) => {
    const sessionCompanyId = getSessionCompanyId();
    const sessionUser = getSessionUserName();

    const companyId = data.CompanyMasterId !== undefined && data.CompanyMasterId !== null && data.CompanyMasterId !== ''
      ? Number(data.CompanyMasterId)
      : (sessionCompanyId !== null ? Number(sessionCompanyId) : null);

    const parentLocationTypeId = data.ParentLocationTypeMasterId !== undefined && data.ParentLocationTypeMasterId !== '' && data.ParentLocationTypeMasterId !== null
      ? Number(data.ParentLocationTypeMasterId)
      : null;

    const parentLocationId = data.ParentLocationMasterId !== undefined && data.ParentLocationMasterId !== '' && data.ParentLocationMasterId !== null
      ? Number(data.ParentLocationMasterId)
      : null;

    const createdBy = data.CreatedByUserName || sessionUser;

    const payload = {
      flagId: 4,
      CompanyMasterId: companyId,
      LocationTypeMasterId: Number(data.LocationTypeMasterId),
      ParentLocationTypeMasterId: parentLocationTypeId,
      ParentLocationMasterId: parentLocationId,
      LocationName: data.LocationName ? String(data.LocationName).trim() : '',
      ContactPerson: data.ContactPerson ? String(data.ContactPerson).trim() : '',
      ContactNumber: data.ContactNumber ? String(data.ContactNumber).trim() : '',
      EmailId: data.EmailId ? String(data.EmailId).trim() : '',
      Address: data.Address ? String(data.Address).trim() : '',
      CreatedByUserName: createdBy
    };

    return apiClient.post(API_ROUTES.LOCATION_MASTER.ADD_LOCATION_MASTER, payload);
  },

  /**
   * Get location dropdown list
   * Route: /verp-service/locationMaster/dropdown (flagId: 3)
   */
  getLocationDropdown: async () => {
    return apiClient.post(API_ROUTES.LOCATION_MASTER.DROPDOWN, {
      flagId: 3
    });
  },

  /**
   * Update / Edit location
   */
  editLocationMaster: async (data) => {
    const sessionCompanyId = getSessionCompanyId();
    const sessionUser = getSessionUserName();

    const companyId = data.CompanyMasterId !== undefined && data.CompanyMasterId !== null && data.CompanyMasterId !== ''
      ? Number(data.CompanyMasterId)
      : (sessionCompanyId !== null ? Number(sessionCompanyId) : null);

    const parentLocationTypeId = data.ParentLocationTypeMasterId !== undefined && data.ParentLocationTypeMasterId !== '' && data.ParentLocationTypeMasterId !== null
      ? Number(data.ParentLocationTypeMasterId)
      : null;

    const parentLocationId = data.ParentLocationMasterId !== undefined && data.ParentLocationMasterId !== '' && data.ParentLocationMasterId !== null
      ? Number(data.ParentLocationMasterId)
      : null;

    const updatedBy = data.UpdatedByUserName || sessionUser;

    const payload = {
      flagId: 2,
      LocationMasterId: Number(data.LocationMasterId),
      CompanyMasterId: companyId,
      LocationTypeMasterId: Number(data.LocationTypeMasterId),
      ParentLocationTypeMasterId: parentLocationTypeId,
      ParentLocationMasterId: parentLocationId,
      LocationName: data.LocationName ? String(data.LocationName).trim() : '',
      ContactPerson: data.ContactPerson ? String(data.ContactPerson).trim() : '',
      ContactNumber: data.ContactNumber ? String(data.ContactNumber).trim() : '',
      EmailId: data.EmailId ? String(data.EmailId).trim() : '',
      Address: data.Address ? String(data.Address).trim() : '',
      UpdatedByUserName: updatedBy
    };

    return apiClient.post(API_ROUTES.LOCATION_MASTER.EDIT, payload);
  }
};

export default locationService;

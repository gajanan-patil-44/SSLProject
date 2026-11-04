// src/services/gstService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { getSessionCompanyId } from './departmentService';

export const gstService = {
  /**
   * Fetch GST rates list for viewing in table
   * Endpoint: /verp-service/gstRate/view
   * Method: POST
   * Payload: { FlagId: 3, CompanyId }
   */
  getGSTList: async (params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 3,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    return apiClient.post(API_ROUTES.GST_RATE.VIEW, payload);
  },

  /**
   * Fetch GST Types dropdown
   * Endpoint: /verp-service/gstRate/dropdown
   * Method: POST
   * Payload: { FlagId: 1, CompanyId }
   */
  getGSTTypes: async () => {
    const compId = getSessionCompanyId();
    const payload = {
      FlagId: 1,
      ...(compId ? { CompanyId: compId } : {})
    };
    return apiClient.post(API_ROUTES.GST_RATE.DROPDOWN, payload);
  },

  /**
   * Add new GST Rate
   * Endpoint: /verp-service/gstRate/add
   * Method: POST
   * Payload: { FlagId: 2, GSTTypeId, GSTPercentage, CreatedByUserName, CompanyId }
   */
  addGST: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 2,
      GSTTypeId: Number(data.GSTTypeId),
      GSTPercentage: String(data.GSTPercentage ?? '').trim(),
      CreatedByUserName: data.CreatedByUserName || '',
      ...(compId ? { CompanyId: compId } : {})
    };
    return apiClient.post(API_ROUTES.GST_RATE.ADD, payload);
  },

  /**
   * Update GST Rate
   * Endpoint: /verp-service/gstRate/edit
   * Method: PATCH
   * Payload: { FlagId: 3, GSTRateId, GSTTypeId, GSTPercentage, UpdatedByUserName, CompanyId }
   */
  updateGST: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 3,
      GSTRateId: Number(data.GSTRateId ?? data.id),
      GSTTypeId: Number(data.GSTTypeId),
      GSTPercentage: String(data.GSTPercentage ?? '').trim(),
      UpdatedByUserName: data.UpdatedByUserName || '',
      ...(compId ? { CompanyId: compId } : {})
    };
    return apiClient.patch(API_ROUTES.GST_RATE.EDIT, payload);
  },

  /**
   * Toggle GST status (enable / disable)
   * Endpoint: /verp-service/gstRate/status
   * Method: PATCH
   * Payload: { FlagId: 4, GSTRateId, IsDisabled, UpdatedByUserName, CompanyId }
   */
  toggleGSTStatus: async (data = {}) => {
    const compId = data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 4,
      GSTRateId: Number(data.GSTRateId ?? data.id),
      IsDisabled: Boolean(data.IsDisabled),
      UpdatedByUserName: data.UpdatedByUserName || '',
      ...(compId ? { CompanyId: compId } : {})
    };
    return apiClient.patch(API_ROUTES.GST_RATE.STATUS, payload);
  }
};

export default gstService;

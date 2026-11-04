import apiClient from './apiClient';
import { getSessionCompanyId } from './departmentService';

// Configured API Routes
const API_ENDPOINTS = {
  fetch: '/verp-service/materialSubCategoryType/view',
  create: '/verp-service/materialSubCategoryType/add',
  update: '/verp-service/materialSubCategoryType/edit',
  delete: '/verp-service/materialSubCategoryType/delete',
  status: '/verp-service/materialSubCategoryType/status',
  dropdown: '/verp-service/materialSubCategoryType/dropdown'
};

const materialSubCategoryTypeService = {
  // Fetch all sub categories (FlagId: 1)
  getSubCategories: async (params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 1,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    const response = await apiClient.post(API_ENDPOINTS.fetch, payload);
    if (response && response.status === 'success') {
      return (response.data || []).map((item) => ({
        id: item.MaterialSubCategoryTypeId,
        category: item.MaterialCategoryTypeName,
        code: item.MaterialSubCategoryTypeCode,
        name: item.MaterialSubCategoryTypeName,
        status: item.IsDisabled ? 'Inactive' : 'Active',
        createdBy: item.CreatedByUserName,
        createdAt: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-GB') : undefined,
        CompanyId: item.CompanyId ?? compId
      }));
    }
    return [];
  },

  // Fetch Category Dropdown (FlagId: 3)
  getCategoryDropdown: async (params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 3,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
    if (response && response.status === 'success') {
      return response.data || [];
    }
    return [];
  },

  // Create Sub Category (FlagId: 2)
  createSubCategory: async (payload = {}) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      FlagId: 2,
      ...(compId ? { CompanyId: compId } : {}),
      ...payload
    };
    return await apiClient.post(API_ENDPOINTS.create, body);
  },

  // Update Sub Category (FlagId: 4)
  updateSubCategory: async (payload = {}) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      FlagId: 4,
      ...(compId ? { CompanyId: compId } : {}),
      ...payload
    };
    return await apiClient.patch(API_ENDPOINTS.update, body);
  },

  // Delete Sub Category (FlagId: 5)
  deleteSubCategory: async (id, params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 5,
      MaterialSubCategoryTypeId: id,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    return await apiClient.post(API_ENDPOINTS.delete, payload);
  },

  // Toggle Sub Category Status (FlagId: 5)
  toggleStatus: async (idOrPayload, isDisabled, explicitCompanyId) => {
    let body = {};
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      const compId = idOrPayload.CompanyId !== undefined && idOrPayload.CompanyId !== null && idOrPayload.CompanyId !== ''
        ? Number(idOrPayload.CompanyId)
        : getSessionCompanyId();
      body = {
        FlagId: 5,
        ...(compId ? { CompanyId: compId } : {}),
        ...idOrPayload
      };
    } else {
      const compId = explicitCompanyId !== undefined && explicitCompanyId !== null && explicitCompanyId !== ''
        ? Number(explicitCompanyId)
        : getSessionCompanyId();
      body = {
        FlagId: 5,
        MaterialSubCategoryTypeId: idOrPayload,
        IsDisabled: isDisabled,
        ...(compId ? { CompanyId: compId } : {})
      };
    }
    return await apiClient.patch(API_ENDPOINTS.status, body);
  }
};

export default materialSubCategoryTypeService;

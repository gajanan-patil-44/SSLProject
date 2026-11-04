import apiClient from './apiClient';
import { getSessionCompanyId } from './departmentService';

// Configured API Routes
const API_ENDPOINTS = {
  fetch: '/verp-service/itemCategoryCreation/getMaterialCategoryType',
  create: '/verp-service/itemCategoryCreation/addMaterialCategoryType',
  update: '/verp-service/itemCategoryCreation/updateMaterialCategoryType',
  delete: '/verp-service/materialCategoryType/delete',
  status: '/verp-service/itemCategoryCreation/toggleMaterialCategoryTypeStatus',
  dropdown: '/verp-service/materialCategoryType/dropdown'
};

const materialCategoryTypeService = {
  // Fetch all categories (flagId: 1)
  getCategories: async (params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      flagId: 1,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    const response = await apiClient.post(API_ENDPOINTS.fetch, payload);
    if (response && (response.status === 'success' || response.success === true)) {
      return (response.data || []).map((item) => ({
        id: item.MaterialCategoryTypeId ?? item.PageId ?? item.id,
        category: item.MaterialCategoryTypeName ?? item.PageName ?? item.category,
        code: item.MaterialCategoryTypeCode ?? item.IconName ?? item.code,
        name: item.MaterialCategoryTypeName ?? item.PageName ?? item.name,
        status: (item.IsDisabled === true || item.isDisabled === true) ? 'Inactive' : 'Active',
        createdBy: item.CreatedByUserName || '—',
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

  // Create Category (flagId: 2)
  createCategory: async (payload = {}) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      flagId: 2,
      ...(compId ? { CompanyId: compId } : {}),
      ...payload
    };
    return await apiClient.post(API_ENDPOINTS.create, body);
  },

  // Update Category (flagId: 3)
  updateCategory: async (payload = {}) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      flagId: 3,
      ...(compId ? { CompanyId: compId } : {}),
      ...payload
    };
    return await apiClient.patch(API_ENDPOINTS.update, body);
  },

  // Delete Category (FlagId: 5)
  deleteCategory: async (id, params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 5,
      MaterialCategoryTypeId: id,
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    return await apiClient.post(API_ENDPOINTS.delete, payload);
  },

  // Toggle Category Status (flagId: 4)
  toggleStatus: async (payload = {}) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      flagId: 4,
      ...(compId ? { CompanyId: compId } : {}),
      ...payload
    };
    return await apiClient.patch(API_ENDPOINTS.status, body);
  }
};

export default materialCategoryTypeService;

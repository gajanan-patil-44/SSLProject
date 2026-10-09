import apiClient from './apiClient';

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
  // Fetch all sub categories
  getSubCategories: async () => {
    const response = await apiClient.post(API_ENDPOINTS.fetch, { FlagId: 1 });
    if (response && response.status === 'success') {
      return (response.data || []).map((item) => ({
        id: item.MaterialSubCategoryTypeId,
        category: item.MaterialCategoryTypeName,
        code: item.MaterialSubCategoryTypeCode,
        name: item.MaterialSubCategoryTypeName,
        status: item.IsDisabled ? 'Inactive' : 'Active',
        createdBy: item.CreatedByUserName,
        createdAt: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-GB') : undefined
      }));
    }
    return [];
  },

  // Fetch Category Dropdown (FlagId: 3)
  getCategoryDropdown: async () => {
    const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 3 });
    if (response && response.status === 'success') {
      return response.data || [];
    }
    return [];
  },

  // Create Sub Category
  createSubCategory: async (payload) => {
    return await apiClient.post(API_ENDPOINTS.create, payload);
  },

  // Update Sub Category
  updateSubCategory: async (payload) => {
    return await apiClient.post(API_ENDPOINTS.update, payload);
  },

  // Delete Sub Category
  deleteSubCategory: async (id) => {
    const payload = { FlagId: 5, MaterialSubCategoryTypeId: id };
    return await apiClient.post(API_ENDPOINTS.delete, payload);
  },

  // Toggle Sub Category Status
  toggleStatus: async (id, isDisabled) => {
    const payload = {
      FlagId: 5,
      MaterialSubCategoryTypeId: id,
      IsDisabled: isDisabled
    };
    return await apiClient.patch(API_ENDPOINTS.status, payload);
  }
};

export default materialSubCategoryTypeService;

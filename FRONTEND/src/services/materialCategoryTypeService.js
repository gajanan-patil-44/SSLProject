import apiClient from './apiClient';

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
  // Fetch all categories
  getCategories: async () => {
    const response = await apiClient.post(API_ENDPOINTS.fetch, { flagId: 1 });
    if (response && (response.status === 'success' || response.success === true)) {
      return (response.data || []).map((item) => ({
        id: item.MaterialCategoryTypeId ?? item.PageId ?? item.id,
        category: item.MaterialCategoryTypeName ?? item.PageName ?? item.category,
        code: item.MaterialCategoryTypeCode ?? item.IconName ?? item.code,
        name: item.MaterialCategoryTypeName ?? item.PageName ?? item.name,
        status: (item.IsDisabled === true || item.isDisabled === true) ? 'Inactive' : 'Active',
        createdBy: item.CreatedByUserName ?? 'System',
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

  // Create Category
  createCategory: async (payload) => {
    return await apiClient.post(API_ENDPOINTS.create, payload);
  },

  // Update Category
  updateCategory: async (payload) => {
    return await apiClient.post(API_ENDPOINTS.update, payload);
  },

  // Delete Category
  deleteCategory: async (id) => {
    const payload = { FlagId: 5, MaterialCategoryTypeId: id };
    return await apiClient.post(API_ENDPOINTS.delete, payload);
  },

  // Toggle Category Status
  toggleStatus: async (payload) => {
    return await apiClient.post(API_ENDPOINTS.status, payload);
  }
};

export default materialCategoryTypeService;

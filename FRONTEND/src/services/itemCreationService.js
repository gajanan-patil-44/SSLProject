import apiClient from './apiClient';

// Configured API Routes for Material / Item Operations
const API_ENDPOINTS = {
  view: '/verp-service/material/view',
  add: '/verp-service/material/add',
  edit: '/verp-service/material/edit',
  status: '/verp-service/material/status',
  dropdown: '/verp-service/material/dropdown'
};

const itemCreationService = {
  /**
   * Fetch all materials / items
   * Hits POST /verp-service/material/view with payload: { FlagId: 1 }
   */
  getItems: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.view, { FlagId: 1 });
      if (response && (response.status === 'success' || response.success === true) && Array.isArray(response.data)) {
        return (response.data || []).map((item) => ({
          id: item.MaterialId,
          code: item.MaterialCode || '',
          name: item.MaterialName || '',
          categoryId: item.MaterialCategoryTypeId || null,
          category: item.MaterialCategoryTypeName || '',
          subCategoryId: item.MaterialSubCategoryTypeId || null,
          subCategory: item.MaterialSubCategoryTypeName || '',
          brand: item.MaterialBrandName || '',
          model: item.ModelNo || '',
          uomId: item.UOMId || null,
          uom: item.UOMName || '',
          gstTypeId: item.GSTTypeId || null,
          gstTypeName: item.GSTTypeName || '',
          gstRateId: item.GSTRateId || null,
          gstPercentage: item.GSTPercentage || '',
          hsnSac: item.HSNSAC || '',
          warrantyYears: item.WarrantyYears || '',
          description: item.DescriptionSpecification || '',
          status: item.IsDisabled ? 'Inactive' : 'Active',
          isDisabled: Boolean(item.IsDisabled),
          createdBy: item.CreatedByUserName || item.CreatedByUserId ? String(item.CreatedByUserName || `User #${item.CreatedByUserId}`) : 'System',
          userName: item.CreatedByUserName || item.CreatedByUserId ? String(item.CreatedByUserName || `User #${item.CreatedByUserId}`) : 'System',
          createdAt: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-GB') : '—',
          updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt).toLocaleDateString('en-GB') : '—',
          raw: item
        }));
      }
    } catch (error) {
      console.error("Failed to fetch materials from /verp-service/material/view:", error);
    }
    return [];
  },

  /**
   * Fetch Category Dropdown (FlagId: 2)
   */
  getCategoryDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 2 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(c => ({
          id: c.MaterialCategoryTypeId,
          name: c.MaterialCategoryTypeName,
          code: c.MaterialCategoryTypeCode
        }));
      }
    } catch (error) {
      console.error("Failed to load category dropdown:", error);
    }
    return [];
  },

  /**
   * Fetch Sub Category Dropdown (FlagId: 3)
   */
  getSubCategoryDropdown: async (categoryId = null) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 3 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        const list = response.data.map(sc => ({
          id: sc.MaterialSubCategoryTypeId,
          categoryId: sc.MaterialCategoryTypeId,
          categoryName: sc.MaterialCategoryTypeName,
          name: sc.MaterialSubCategoryTypeName,
          code: sc.MaterialSubCategoryTypeCode
        }));
        if (categoryId) {
          return list.filter(sc => String(sc.categoryId) === String(categoryId));
        }
        return list;
      }
    } catch (error) {
      console.error("Failed to load subcategory dropdown:", error);
    }
    return [];
  },

  /**
   * Fetch UOM Dropdown (FlagId: 4)
   */
  getUOMDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 4 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(u => ({
          id: u.UOMId,
          name: u.UOMName,
          code: u.UOMCode
        }));
      }
    } catch (error) {
      console.error("Failed to load UOM dropdown:", error);
    }
    return [];
  },

  /**
   * Fetch GST Types (FlagId: 5)
   */
  getGSTTypeDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 5 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error("Failed to load GST types:", error);
    }
    return [];
  },

  /**
   * Fetch GST Rates (FlagId: 6)
   */
  getGSTRateDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 6 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(r => ({
          id: r.GSTRateId,
          gstTypeId: r.GSTTypeId,
          gstTypeName: r.GSTTypeName,
          percentage: r.GSTPercentage
        }));
      }
    } catch (error) {
      console.error("Failed to load GST rates:", error);
    }
    return [];
  },

  /**
   * Fetch File Types (FlagId: 7)
   * Dynamically filters for FileTypeId 4 from backend response
   */
  getFileTypeDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 7 });
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        const materialOnly = response.data.filter(f => Number(f.FileTypeId) === 4);
        if (materialOnly.length > 0) {
          return materialOnly.map(f => ({
            id: Number(f.FileTypeId),
            name: f.FileTypeName,
            description: f.Description
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load file types:", error);
    }
    return [];
  },

  /**
   * Fetch all 6 dropdowns in parallel
   * Hits /verp-service/material/dropdown with FlagIds 2, 3, 4, 5, 6, 7
   */
  getAllDropdowns: async () => {
    const [categories, subCategories, uoms, gstTypes, gstRates, fileTypes] = await Promise.all([
      itemCreationService.getCategoryDropdown(),   // FlagId: 2
      itemCreationService.getSubCategoryDropdown(),// FlagId: 3
      itemCreationService.getUOMDropdown(),        // FlagId: 4
      itemCreationService.getGSTTypeDropdown(),    // FlagId: 5
      itemCreationService.getGSTRateDropdown(),    // FlagId: 6
      itemCreationService.getFileTypeDropdown()    // FlagId: 7
    ]);
    return {
      categories: categories || [],
      subCategories: subCategories || [],
      uoms: uoms || [],
      gstTypes: gstTypes || [],
      gstRates: gstRates || [],
      fileTypes: fileTypes || []
    };
  },

  /**
   * Create Material (FlagId: 8)
   * Target Route: POST /verp-service/material/add
   */
  createItem: async (data) => {
    if (data instanceof FormData) {
      return await apiClient.post(API_ENDPOINTS.add, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    if (data.file || data.files) {
      const formData = new FormData();
      formData.append('FlagId', 8);
      formData.append('MaterialName', data.MaterialName || '');
      formData.append('MaterialCode', data.MaterialCode || '');
      formData.append('MaterialCategoryTypeId', Number(data.MaterialCategoryTypeId));
      formData.append('MaterialSubCategoryTypeId', Number(data.MaterialSubCategoryTypeId));
      formData.append('MaterialBrandName', data.MaterialBrandName || '');
      formData.append('ModelNo', data.ModelNo || '');
      formData.append('UOMId', Number(data.UOMId));
      formData.append('GSTTypeId', Number(data.GSTTypeId));
      formData.append('GSTRateId', Number(data.GSTRateId));
      formData.append('HSNSAC', data.HSNSAC || '');
      formData.append('WarrantyYears', Number(data.WarrantyYears) || 0);
      formData.append('DescriptionSpecification', data.DescriptionSpecification || '');
      if (data.CreatedByUserId) formData.append('CreatedByUserId', Number(data.CreatedByUserId));
      if (data.UpdatedByUserId) formData.append('UpdatedByUserId', Number(data.UpdatedByUserId));
      if (data.UpdatedAt) formData.append('UpdatedAt', data.UpdatedAt);

      const fileTypeId = data.FileTypeIds || data.fileTypeId;
      if (fileTypeId) {
        formData.append('FileTypeIds', Number(fileTypeId));
      }
      formData.append('files', data.file || data.files);

      return await apiClient.post(API_ENDPOINTS.add, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    const payload = {
      FlagId: 8,
      MaterialName: data.MaterialName || '',
      MaterialCode: data.MaterialCode || '',
      MaterialCategoryTypeId: Number(data.MaterialCategoryTypeId),
      MaterialSubCategoryTypeId: Number(data.MaterialSubCategoryTypeId),
      MaterialBrandName: data.MaterialBrandName || '',
      ModelNo: data.ModelNo || '',
      UOMId: Number(data.UOMId),
      GSTTypeId: Number(data.GSTTypeId),
      GSTRateId: Number(data.GSTRateId),
      HSNSAC: data.HSNSAC || '',
      WarrantyYears: Number(data.WarrantyYears) || 0,
      DescriptionSpecification: data.DescriptionSpecification || '',
      CreatedByUserId: data.CreatedByUserId ? Number(data.CreatedByUserId) : undefined,
      UpdatedByUserId: data.UpdatedByUserId ? Number(data.UpdatedByUserId) : undefined,
      UpdatedAt: data.UpdatedAt || undefined
    };

    return await apiClient.post(API_ENDPOINTS.add, payload);
  },

  /**
   * Update Material (FlagId: 9)
   * Target Route: PATCH /verp-service/material/edit
   */
  updateItem: async (data) => {
    if (data instanceof FormData) {
      return await apiClient.patch(API_ENDPOINTS.edit, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    if (data.file || data.files) {
      const formData = new FormData();
      formData.append('FlagId', 9);
      formData.append('MaterialId', Number(data.MaterialId || data.id));
      formData.append('MaterialName', data.MaterialName || '');
      formData.append('MaterialCode', data.MaterialCode || '');
      formData.append('MaterialCategoryTypeId', Number(data.MaterialCategoryTypeId));
      formData.append('MaterialSubCategoryTypeId', Number(data.MaterialSubCategoryTypeId));
      formData.append('MaterialBrandName', data.MaterialBrandName || '');
      formData.append('ModelNo', data.ModelNo || '');
      formData.append('UOMId', Number(data.UOMId));
      formData.append('GSTTypeId', Number(data.GSTTypeId));
      formData.append('GSTRateId', Number(data.GSTRateId));
      formData.append('HSNSAC', data.HSNSAC || '');
      formData.append('WarrantyYears', Number(data.WarrantyYears) || 0);
      formData.append('DescriptionSpecification', data.DescriptionSpecification || '');
      if (data.CreatedByUserId) formData.append('CreatedByUserId', Number(data.CreatedByUserId));
      if (data.UpdatedByUserId) formData.append('UpdatedByUserId', Number(data.UpdatedByUserId));
      if (data.UpdatedAt) formData.append('UpdatedAt', data.UpdatedAt);

      const fileTypeId = data.FileTypeIds || data.fileTypeId;
      if (fileTypeId) {
        formData.append('FileTypeIds', Number(fileTypeId));
      }
      formData.append('files', data.file || data.files);

      return await apiClient.patch(API_ENDPOINTS.edit, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    const payload = {
      FlagId: 9,
      MaterialId: Number(data.MaterialId || data.id),
      MaterialName: data.MaterialName || '',
      MaterialCode: data.MaterialCode || '',
      MaterialCategoryTypeId: Number(data.MaterialCategoryTypeId),
      MaterialSubCategoryTypeId: Number(data.MaterialSubCategoryTypeId),
      MaterialBrandName: data.MaterialBrandName || '',
      ModelNo: data.ModelNo || '',
      UOMId: Number(data.UOMId),
      GSTTypeId: Number(data.GSTTypeId),
      GSTRateId: Number(data.GSTRateId),
      HSNSAC: data.HSNSAC || '',
      WarrantyYears: Number(data.WarrantyYears) || 0,
      DescriptionSpecification: data.DescriptionSpecification || '',
      CreatedByUserId: data.CreatedByUserId ? Number(data.CreatedByUserId) : undefined,
      UpdatedByUserId: data.UpdatedByUserId ? Number(data.UpdatedByUserId) : undefined,
      UpdatedAt: data.UpdatedAt || undefined
    };

    return await apiClient.patch(API_ENDPOINTS.edit, payload);
  },

  /**
   * Toggle Material Status (FlagId: 10)
   * Endpoint: PATCH /verp-service/material/status
   */
  toggleStatus: async (payload) => {
    const body = {
      FlagId: 10,
      MaterialId: Number(payload.MaterialId ?? payload.id),
      IsDisabled: Boolean(payload.IsDisabled),
      UpdatedByUserId: payload.UpdatedByUserId ? Number(payload.UpdatedByUserId) : undefined,
      UpdatedAt: payload.UpdatedAt || undefined
    };
    return await apiClient.patch(API_ENDPOINTS.status, body);
  }
};

export default itemCreationService;

import apiClient from './apiClient';
import { MATERIAL_ROUTES, API_ROUTES } from '../routes/apiRoutes';

// Configured API Routes for Material / Item Operations
const API_ENDPOINTS = {
  view: MATERIAL_ROUTES?.VIEW || '/verp-service/material/view',
  add: MATERIAL_ROUTES?.ADD || '/verp-service/material/add',
  edit: MATERIAL_ROUTES?.EDIT || '/verp-service/material/edit',
  status: MATERIAL_ROUTES?.STATUS || '/verp-service/material/status',
  dropdown: MATERIAL_ROUTES?.DROPDOWN || '/verp-service/material/dropdown',
  viewFile: MATERIAL_ROUTES?.VIEW_FILE || '/verp-service/material/view-file'
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
          createdBy: item.CreatedByUserName || item.CreatedByUserId ? String(item.CreatedByUserName || `User #${item.CreatedByUserId}`) : '',
          userName: item.CreatedByUserName || item.CreatedByUserId ? String(item.CreatedByUserName || `User #${item.CreatedByUserId}`) : '',
          createdAt: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-GB') : '—',
          updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt).toLocaleDateString('en-GB') : '—',
          files: Array.isArray(item.Files) ? item.Files.map(f => {
            const rawPath = f.FilePatch || f.FilePath || '';
            const path = rawPath ? rawPath.replace(/\\/g, '/') : '';
            const name = path ? path.split('/').pop() : 'Material Document';
            return {
              id: f.MaterialFileId,
              fileTypeId: f.FileTypeId,
              filePath: path,
              fileName: name
            };
          }) : [],
          raw: item
        }));
      }
    } catch (error) {
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
    }
    return [];
  },

  /**
   * Fetch Sub Category Dropdown (FlagId: 3)
   * Sends FlagId: 3 along with MaterialCategoryTypeId
   */
  getSubCategoryDropdown: async (categoryId = null) => {
    try {
      const payload = { FlagId: 3 };
      if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
        payload.MaterialCategoryTypeId = Number(categoryId);
      }
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(sc => ({
          id: sc.MaterialSubCategoryTypeId,
          categoryId: sc.MaterialCategoryTypeId,
          categoryName: sc.MaterialCategoryTypeName,
          name: sc.MaterialSubCategoryTypeName,
          code: sc.MaterialSubCategoryTypeCode
        }));
      }
    } catch (error) {
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
    }
    return [];
  },

  /**
   * Fetch GST Rates (FlagId: 6)
   * Sends FlagId: 6 along with GSTTypeId
   */
  getGSTRateDropdown: async (gstTypeId = null) => {
    try {
      const payload = { FlagId: 6 };
      if (gstTypeId !== null && gstTypeId !== undefined && gstTypeId !== '') {
        payload.GSTTypeId = Number(gstTypeId);
      }
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(r => ({
          id: r.GSTRateId,
          gstTypeId: r.GSTTypeId,
          gstTypeName: r.GSTTypeName,
          percentage: r.GSTPercentage
        }));
      }
    } catch (error) {
    }
    return [];
  },

  /**
   * Fetch File Types (FlagId: 7)
   * Hits POST /verp-service/material/dropdown with payload { FlagId: 7 }
   */
  getFileTypeDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 7 });
      let list = [];
      if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      } else if (Array.isArray(response)) {
        list = response;
      }
      return list.map(f => ({
        id: Number(f.FileTypeId ?? f.fileTypeId ?? f.id),
        FileTypeId: Number(f.FileTypeId ?? f.fileTypeId ?? f.id),
        name: f.FileTypeName || f.fileTypeName || f.name || '',
        FileTypeName: f.FileTypeName || f.fileTypeName || f.name || '',
        description: f.Description || f.description || '',
        Description: f.Description || f.description || ''
      }));
    } catch (error) {
    }
    return [];
  },

  getFileTypes: async () => {
    return await itemCreationService.getFileTypeDropdown();
  },

  /**
   * Fetch dropdowns
   * Hits /verp-service/material/dropdown
   * Pass categoryId to fetch subcategories with FlagId: 3 and MaterialCategoryTypeId
   * Pass gstTypeId to fetch GST rates with FlagId: 6 and GSTTypeId
   */
  getAllDropdowns: async (categoryId = null, gstTypeId = null) => {
    const [categories, subCategories, uoms, gstTypes, gstRates, fileTypes] = await Promise.all([
      itemCreationService.getCategoryDropdown(),   // FlagId: 2
      categoryId ? itemCreationService.getSubCategoryDropdown(categoryId) : Promise.resolve([]), // FlagId: 3
      itemCreationService.getUOMDropdown(),        // FlagId: 4
      itemCreationService.getGSTTypeDropdown(),    // FlagId: 5
      gstTypeId ? itemCreationService.getGSTRateDropdown(gstTypeId) : Promise.resolve([]),       // FlagId: 6
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
      formData.append('MaterialName', data.MaterialName || data.name || '');
      formData.append('MaterialCode', data.MaterialCode || data.code || '');
      formData.append('MaterialCategoryTypeId', Number(data.MaterialCategoryTypeId || data.categoryId));
      formData.append('MaterialSubCategoryTypeId', Number(data.MaterialSubCategoryTypeId || data.subCategoryId));
      formData.append('MaterialBrandName', data.MaterialBrandName || data.brand || '');
      formData.append('ModelNo', data.ModelNo || data.model || '');
      formData.append('UOMId', Number(data.UOMId || data.uomId));
      formData.append('GSTTypeId', Number(data.GSTTypeId || data.gstTypeId));
      formData.append('GSTRateId', Number(data.GSTRateId || data.gstRateId));
      formData.append('HSNSAC', data.HSNSAC || data.hsnSac || '');
      formData.append('WarrantyYears', Number(data.WarrantyYears || data.warrantyYears) || 0);
      formData.append('DescriptionSpecification', data.DescriptionSpecification || data.description || '');
      if (data.CreatedByUserId) formData.append('CreatedByUserId', Number(data.CreatedByUserId));
      if (data.UpdatedByUserId) formData.append('UpdatedByUserId', Number(data.UpdatedByUserId));
      if (data.UpdatedAt) formData.append('UpdatedAt', data.UpdatedAt);

      const fileTypeId = data.FileTypeId ?? data.fileTypeId;
      if (fileTypeId !== undefined && fileTypeId !== null && fileTypeId !== '') {
        formData.append('FileTypeId', Number(fileTypeId));
      }
      formData.append('files', data.file || data.files);

      return await apiClient.post(API_ENDPOINTS.add, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    const payload = {
      FlagId: 8,
      MaterialName: data.MaterialName || data.name || '',
      MaterialCode: data.MaterialCode || data.code || '',
      MaterialCategoryTypeId: Number(data.MaterialCategoryTypeId || data.categoryId),
      MaterialSubCategoryTypeId: Number(data.MaterialSubCategoryTypeId || data.subCategoryId),
      MaterialBrandName: data.MaterialBrandName || data.brand || '',
      ModelNo: data.ModelNo || data.model || '',
      UOMId: Number(data.UOMId || data.uomId),
      GSTTypeId: Number(data.GSTTypeId || data.gstTypeId),
      GSTRateId: Number(data.GSTRateId || data.gstRateId),
      HSNSAC: data.HSNSAC || data.hsnSac || '',
      WarrantyYears: Number(data.WarrantyYears || data.warrantyYears) || 0,
      DescriptionSpecification: data.DescriptionSpecification || data.description || '',
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
      formData.append('MaterialName', data.MaterialName || data.name || '');
      formData.append('MaterialCode', data.MaterialCode || data.code || '');
      formData.append('MaterialCategoryTypeId', Number(data.MaterialCategoryTypeId || data.categoryId));
      formData.append('MaterialSubCategoryTypeId', Number(data.MaterialSubCategoryTypeId || data.subCategoryId));
      formData.append('MaterialBrandName', data.MaterialBrandName || data.brand || '');
      formData.append('ModelNo', data.ModelNo || data.model || '');
      formData.append('UOMId', Number(data.UOMId || data.uomId));
      formData.append('GSTTypeId', Number(data.GSTTypeId || data.gstTypeId));
      formData.append('GSTRateId', Number(data.GSTRateId || data.gstRateId));
      formData.append('HSNSAC', data.HSNSAC || data.hsnSac || '');
      formData.append('WarrantyYears', Number(data.WarrantyYears || data.warrantyYears) || 0);
      formData.append('DescriptionSpecification', data.DescriptionSpecification || data.description || '');
      if (data.CreatedByUserId) formData.append('CreatedByUserId', Number(data.CreatedByUserId));
      if (data.UpdatedByUserId) formData.append('UpdatedByUserId', Number(data.UpdatedByUserId));
      if (data.UpdatedAt) formData.append('UpdatedAt', data.UpdatedAt);

      const fileTypeId = data.FileTypeId ?? data.fileTypeId;
      if (fileTypeId !== undefined && fileTypeId !== null && fileTypeId !== '') {
        formData.append('FileTypeId', Number(fileTypeId));
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
  },

  /**
   * View Material File
   * Hits POST /verp-service/material/view-file with payload: { FlagId: 11, MaterialFileId: <id> }
   */
  viewFile: async (materialFileId) => {
    const response = await apiClient.post(API_ENDPOINTS.viewFile, {
      FlagId: 11,
      MaterialFileId: Number(materialFileId)
    }, {
      responseType: 'blob'
    });

    if (response instanceof Blob) {
      if (response.type.includes('json') || response.type.includes('text')) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return { raw: text };
        }
      }
      return response;
    }
    return response;
  }
};

export default itemCreationService;

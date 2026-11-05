import apiClient from './apiClient';
import { MATERIAL_ROUTES } from '../routes/apiRoutes';
import { getSessionCompanyId } from './departmentService';

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
   * Hits POST /verp-service/material/view with payload: { FlagId: 1, CompanyId }
   */
  getItems: async (params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 1,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      const response = await apiClient.post(API_ENDPOINTS.view, payload);
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
          CompanyId: item.CompanyId ?? compId,
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
   * Fetch Company Dropdown (FlagId: 12)
   * Hits POST /verp-service/material/dropdown with { FlagId: 12 }
   */
  getCompanyDropdown: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.dropdown, { FlagId: 12 });
      if (response && (response.status === 'success' || response.success === true) && Array.isArray(response.data)) {
        return response.data.map(c => ({
          id: c.CompanyId ?? c.id,
          name: c.CompanyName ?? c.name ?? `Company #${c.CompanyId}`,
          code: c.CompanyCode ?? c.code ?? ''
        }));
      }
    } catch (error) {
    }
    return [];
  },

  /**
   * Fetch Category Dropdown (FlagId: 2)
   */
  getCategoryDropdown: async (params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 2,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
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
   * Sends FlagId: 3 along with MaterialCategoryTypeId and CompanyId
   */
  getSubCategoryDropdown: async (categoryId = null, params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 3,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
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
  getUOMDropdown: async (params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 4,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
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
   * Fetch GST Type Dropdown (FlagId: 5)
   */
  getGSTTypeDropdown: async (params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 5,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
    }
    return [];
  },

  /**
   * Fetch GST Rates Dropdown (FlagId: 6)
   * Sends FlagId: 6 along with GSTTypeId and CompanyId
   */
  getGSTRateDropdown: async (gstTypeId = null, params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 6,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      if (gstTypeId !== null && gstTypeId !== undefined && gstTypeId !== '') {
        payload.GSTTypeId = Number(gstTypeId);
      }
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(r => ({
          id: r.GSTRateId,
          percentage: r.GSTPercentage,
          gstTypeId: r.GSTTypeId,
          gstTypeName: r.GSTTypeName
        }));
      }
    } catch (error) {
    }
    return [];
  },

  /**
   * Fetch File Types Dropdown (FlagId: 7)
   */
  getFileTypeDropdown: async (params = {}) => {
    try {
      const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
        ? Number(params.CompanyId)
        : getSessionCompanyId();
      const payload = {
        FlagId: 7,
        ...(compId ? { CompanyId: compId } : {}),
        ...params
      };
      const response = await apiClient.post(API_ENDPOINTS.dropdown, payload);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map(ft => ({
          id: ft.FileTypeId,
          name: ft.FileType,
          description: ft.FileDescription
        }));
      }
    } catch (error) {
    }
    return [];
  },

  /**
   * Pre-fetch all dropdowns in parallel
   */
  getAllDropdowns: async (categoryId = null, gstTypeId = null, companyId = null) => {
    const compId = companyId !== undefined && companyId !== null && companyId !== ''
      ? Number(companyId)
      : getSessionCompanyId();
    const dropdownParams = compId ? { CompanyId: compId } : {};

    const [companies, categories, subCategories, uoms, gstTypes, gstRates, fileTypes] = await Promise.all([
      itemCreationService.getCompanyDropdown(),
      compId ? itemCreationService.getCategoryDropdown(dropdownParams) : Promise.resolve([]),
      categoryId ? itemCreationService.getSubCategoryDropdown(categoryId, dropdownParams) : Promise.resolve([]),
      itemCreationService.getUOMDropdown(dropdownParams),
      itemCreationService.getGSTTypeDropdown(dropdownParams),
      gstTypeId ? itemCreationService.getGSTRateDropdown(gstTypeId, dropdownParams) : Promise.resolve([]),
      itemCreationService.getFileTypeDropdown(dropdownParams)
    ]);
    return {
      companies: companies || [],
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
    const compId = data?.CompanyId !== undefined && data?.CompanyId !== null && data?.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();

    if (data instanceof FormData) {
      if (compId && !data.has('CompanyId')) {
        data.append('CompanyId', compId);
      }
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
      if (compId) formData.append('CompanyId', compId);

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
      UpdatedAt: data.UpdatedAt || undefined,
      ...(compId ? { CompanyId: compId } : {})
    };

    return await apiClient.post(API_ENDPOINTS.add, payload);
  },

  /**
   * Alias for createItem
   */
  addItem: async (data) => {
    return await itemCreationService.createItem(data);
  },

  /**
   * Update Material (FlagId: 9)
   * Target Route: PATCH /verp-service/material/edit
   */
  updateItem: async (data) => {
    const compId = data?.CompanyId !== undefined && data?.CompanyId !== null && data?.CompanyId !== ''
      ? Number(data.CompanyId)
      : getSessionCompanyId();

    if (data instanceof FormData) {
      if (compId && !data.has('CompanyId')) {
        data.append('CompanyId', compId);
      }
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
      if (compId) formData.append('CompanyId', compId);

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
      UpdatedAt: data.UpdatedAt || undefined,
      ...(compId ? { CompanyId: compId } : {})
    };

    return await apiClient.patch(API_ENDPOINTS.edit, payload);
  },

  /**
   * Toggle Material Status (FlagId: 10)
   * Endpoint: PATCH /verp-service/material/status
   */
  toggleStatus: async (payload) => {
    const compId = payload.CompanyId !== undefined && payload.CompanyId !== null && payload.CompanyId !== ''
      ? Number(payload.CompanyId)
      : getSessionCompanyId();
    const body = {
      FlagId: 10,
      MaterialId: Number(payload.MaterialId ?? payload.id),
      IsDisabled: Boolean(payload.IsDisabled),
      UpdatedByUserId: payload.UpdatedByUserId ? Number(payload.UpdatedByUserId) : undefined,
      UpdatedAt: payload.UpdatedAt || undefined,
      ...(compId ? { CompanyId: compId } : {})
    };
    return await apiClient.patch(API_ENDPOINTS.status, body);
  },

  /**
   * View Material File
   * Hits POST /verp-service/material/view-file with payload: { FlagId: 11, MaterialFileId: <id>, CompanyId }
   */
  viewFile: async (materialFileId, params = {}) => {
    const compId = params.CompanyId !== undefined && params.CompanyId !== null && params.CompanyId !== ''
      ? Number(params.CompanyId)
      : getSessionCompanyId();
    const payload = {
      FlagId: 11,
      MaterialFileId: Number(materialFileId),
      ...(compId ? { CompanyId: compId } : {}),
      ...params
    };
    const response = await apiClient.post(API_ENDPOINTS.viewFile, payload, {
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

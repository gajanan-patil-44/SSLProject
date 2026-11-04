// src/services/vendorService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';
import { useERPStore } from '../store/useERPStore';

/**
 * Universal dynamic helper to extract active session company ID
 * Exhaustively checks:
 * 1. Explicit argument
 * 2. Unified session object in localStorage / sessionStorage:
 *    - context.companies
 *    - context.products
 *    - user.CompanyId
 *    - root session.CompanyId
 *    - decoded JWT accessToken
 *    - deep recursive object search
 * 3. Zustand store (userContext.companies, userContext.products, user.CompanyId, session.CompanyId)
 * 4. Direct storage keys (CompanyId, companyId, erp_company_id, erp_company, erp_user)
 */
export const getSessionCompanyId = (explicitId) => {
  // 1. Explicit ID if provided and valid
  if (explicitId !== undefined && explicitId !== null && explicitId !== '') {
    const num = Number(explicitId);
    if (!isNaN(num) && num > 0) return num;
  }

  // 2. Parse session from localStorage or sessionStorage
  try {
    const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (raw) {
      const s = typeof raw === 'string' ? JSON.parse(raw) : raw;

      // 2a. context.companies list
      const companies = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
      if (Array.isArray(companies) && companies.length > 0) {
        for (const c of companies) {
          const id = c?.CompanyId ?? c?.CompanyMasterId ?? c?.companyId ?? c?.companyMasterId ?? c?.id ?? c?.Id ?? c?.company_id ?? c?.value;
          if (id !== undefined && id !== null && id !== '') {
            const num = Number(id);
            if (!isNaN(num) && num > 0) return num;
          }
        }
      }

      // 2b. context.products list (contains CompanyId for each allocated product)
      const products = s?.data?.context?.products || s?.context?.products || s?.data?.products || s?.products;
      if (Array.isArray(products) && products.length > 0) {
        for (const p of products) {
          const id = p?.CompanyId ?? p?.companyId ?? p?.CompanyMasterId ?? p?.company_id;
          if (id !== undefined && id !== null && id !== '') {
            const num = Number(id);
            if (!isNaN(num) && num > 0) return num;
          }
        }
      }

      // 2c. user object in session
      const user = s?.data?.user || s?.user;
      const userCid = user?.CompanyId ?? user?.companyId ?? user?.CompanyMasterId ?? user?.company_id;
      if (userCid !== undefined && userCid !== null && userCid !== '') {
        const num = Number(userCid);
        if (!isNaN(num) && num > 0) return num;
      }

      // 2d. root session object
      const rootCid = s?.CompanyId ?? s?.companyId ?? s?.CompanyMasterId ?? s?.data?.CompanyId ?? s?.data?.companyId;
      if (rootCid !== undefined && rootCid !== null && rootCid !== '') {
        const num = Number(rootCid);
        if (!isNaN(num) && num > 0) return num;
      }

      // 2e. Decoded JWT accessToken
      const token = s?.token?.accessToken || s?.accessToken || s?.token || localStorage.getItem('erp_token') || sessionStorage.getItem('erp_token');
      if (token && typeof token === 'string') {
        const parts = token.split('.');
        if (parts[1]) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonStr = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const jwt = JSON.parse(jsonStr);
          const jwtCid = jwt?.CompanyId ?? jwt?.companyId ?? jwt?.CompanyMasterId ?? jwt?.company_id;
          if (jwtCid !== undefined && jwtCid !== null && jwtCid !== '') {
            const num = Number(jwtCid);
            if (!isNaN(num) && num > 0) return num;
          }
        }
      }

      // 2f. Deep scan of session object for any key matching companyId / CompanyId
      const deepScan = (obj, depth = 0) => {
        if (!obj || typeof obj !== 'object' || depth > 5) return null;
        for (const k of Object.keys(obj)) {
          if (/^company_?id$/i.test(k) || /^companymaster_?id$/i.test(k)) {
            const v = obj[k];
            if (v !== undefined && v !== null && v !== '') {
              const num = Number(v);
              if (!isNaN(num) && num > 0) return num;
            }
          }
          if (typeof obj[k] === 'object') {
            const res = deepScan(obj[k], depth + 1);
            if (res !== null) return res;
          }
        }
        return null;
      };
      const foundDeep = deepScan(s);
      if (foundDeep !== null) return foundDeep;
    }
  } catch (err) {
  }

  // 3. Zustand ERP store state
  try {
    const state = useERPStore.getState?.();
    if (state) {
      const comps = state.userContext?.companies;
      if (Array.isArray(comps) && comps.length > 0) {
        const id = comps[0]?.CompanyId ?? comps[0]?.CompanyMasterId ?? comps[0]?.companyId ?? comps[0]?.id;
        if (id !== undefined && id !== null && id !== '') {
          const num = Number(id);
          if (!isNaN(num) && num > 0) return num;
        }
      }
      const prods = state.userContext?.products;
      if (Array.isArray(prods) && prods.length > 0) {
        const id = prods[0]?.CompanyId ?? prods[0]?.companyId;
        if (id !== undefined && id !== null && id !== '') {
          const num = Number(id);
          if (!isNaN(num) && num > 0) return num;
        }
      }
      const user = state.user;
      const id = user?.CompanyId ?? user?.companyId ?? user?.CompanyMasterId ?? state.session?.CompanyId;
      if (id !== undefined && id !== null && id !== '') {
        const num = Number(id);
        if (!isNaN(num) && num > 0) return num;
      }
    }
  } catch {}

  // 4. Standalone storage keys
  try {
    for (const key of ['CompanyId', 'companyId', 'erp_company_id', 'erp_company', 'erp_user']) {
      const val = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (val) {
        const num = Number(val);
        if (!isNaN(num) && num > 0) return num;
        try {
          const parsed = JSON.parse(val);
          const cid = parsed?.CompanyId ?? parsed?.companyId ?? parsed?.CompanyMasterId ?? parsed?.id;
          if (cid !== undefined && cid !== null && cid !== '') {
            const n = Number(cid);
            if (!isNaN(n) && n > 0) return n;
          }
        } catch {}
      }
    }
  } catch {}

  return null;
};

export const vendorService = {
  /**
   * Fetch all vendors from /verp-service/vendor/view with FlagId: 1 and CompanyId
   */
  getVendors: async (params = {}) => {
    try {
      const companyId = getSessionCompanyId(params?.CompanyId ?? params?.companyId);
      const payload = {
        FlagId: 1
      };
      if (companyId !== null && companyId !== undefined) {
        payload.CompanyId = Number(companyId);
      }

      const response = await apiClient.post(API_ROUTES.VENDOR.VIEW, payload);

      let list = [];
      if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      } else if (Array.isArray(response)) {
        list = response;
      }

      return list.map((item) => {
        const isDisabled =
          item.IsDisabled === true ||
          item.isDisabled === true ||
          item.status === 'Inactive' ||
          item.Status === 'Inactive' ||
          item.status === 'Disabled';

        return {
          id: item.VendorId ?? item.id,
          VendorId: item.VendorId ?? item.id,
          vendorCode: item.VendorCode || item.vendorCode || '',
          VendorCode: item.VendorCode || item.vendorCode || '',
          vendorName: item.VendorName || item.vendorName || '',
          VendorName: item.VendorName || item.vendorName || '',
          contactPerson: item.ContactPerson || item.contactPerson || '',
          ContactPerson: item.ContactPerson || item.contactPerson || '',
          email: item.Email || item.email || '',
          Email: item.Email || item.email || '',
          phone: item.MobileNumber || item.phone || '',
          Phone: item.MobileNumber || item.phone || '',
          MobileNumber: item.MobileNumber || item.phone || '',
          category: item.VendorTypeName || item.vendorTypeName || '',
          Category: item.VendorTypeName || item.vendorTypeName || '',
          vendorTypeName: item.VendorTypeName || item.vendorTypeName || '',
          VendorTypeName: item.VendorTypeName || item.vendorTypeName || '',
          vendorTypeId: item.VendorTypeId ?? null,
          VendorTypeId: item.VendorTypeId ?? null,
          gstNumber: item.GSTINUINNumber || item.gstNumber || '',
          GSTNumber: item.GSTINUINNumber || item.gstNumber || '',
          GSTINUINNumber: item.GSTINUINNumber || item.gstNumber || '',
          address: [item.VendorAddress1, item.VendorAddress2].filter(Boolean).join(', '),
          Address: [item.VendorAddress1, item.VendorAddress2].filter(Boolean).join(', '),
          vendorAddress1: item.VendorAddress1 || '',
          VendorAddress1: item.VendorAddress1 || '',
          vendorAddress2: item.VendorAddress2 || '',
          VendorAddress2: item.VendorAddress2 || '',
          remarks: item.Remarks || '',
          Remarks: item.Remarks || '',
          city: item.City || '',
          City: item.City || '',
          bankName: item.BankName || '',
          BankName: item.BankName || '',
          accountHolderName: item.AccountHolderName || '',
          AccountHolderName: item.AccountHolderName || '',
          ifscCode: item.IFSCCode || '',
          IFSCCode: item.IFSCCode || '',
          status: isDisabled ? 'Inactive' : 'Active',
          Status: isDisabled ? 'Inactive' : 'Active',
          IsDisabled: Boolean(isDisabled),
          isDisabled: Boolean(isDisabled),
          isEnabled: !Boolean(isDisabled),
          Files: item.Files || [],
          createdBy: item.CreatedByUserName || item.CreatedByUserId || '',
          createdAt: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-GB') : '',
          updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt).toLocaleDateString('en-GB') : '',
          raw: item
        };
      });
    } catch (error) {
      return [];
    }
  },

  /**
   * Fetch Vendor Types Dropdown
   * POST /verp-service/vendor/dropdown with { FlagId: 2, CompanyId: <id> }
   */
  getVendorTypes: async (params = {}) => {
    try {
      const companyId = getSessionCompanyId(params?.CompanyId ?? params?.companyId);
      const payload = {
        FlagId: 2
      };
      if (companyId !== null && companyId !== undefined) {
        payload.CompanyId = Number(companyId);
      }

      const response = await apiClient.post(API_ROUTES.VENDOR.DROPDOWN, payload);

      const rawList = response?.data?.VendorTypes
        || response?.data?.vendorTypes
        || (Array.isArray(response?.data) ? response.data : null)
        || response?.VendorTypes
        || (Array.isArray(response) ? response : []);

      const list = Array.isArray(rawList) ? rawList : [];

      return list.map((item) => ({
        id: item.VendorTypeId ?? item.id,
        VendorTypeId: item.VendorTypeId ?? item.id,
        name: item.VendorTypeName ?? item.name ?? '',
        VendorTypeName: item.VendorTypeName ?? item.name ?? '',
        value: item.VendorTypeId ?? item.id,
        label: item.VendorTypeName ?? item.name ?? ''
      }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Fetch Vendor File Types Dropdown
   * POST /verp-service/vendor/dropdown with { FlagId: 3, CompanyId: <id> }
   */
  getVendorFileTypes: async (params = {}) => {
    try {
      const companyId = getSessionCompanyId(params?.CompanyId ?? params?.companyId);
      const payload = {
        FlagId: 3
      };
      if (companyId !== null && companyId !== undefined) {
        payload.CompanyId = Number(companyId);
      }

      const response = await apiClient.post(API_ROUTES.VENDOR.DROPDOWN, payload);

      const rawList = response?.data?.VendorFileTypes
        || response?.data?.vendorFileTypes
        || (Array.isArray(response?.data) ? response.data : null)
        || response?.VendorFileTypes
        || (Array.isArray(response) ? response : []);

      const list = Array.isArray(rawList) ? rawList : [];

      return list.map((item) => ({
        id: item.VendorFileTypeId ?? item.id,
        VendorFileTypeId: item.VendorFileTypeId ?? item.id,
        name: item.VendorFileTypeName ?? item.name ?? '',
        VendorFileTypeName: item.VendorFileTypeName ?? item.name ?? '',
        value: item.VendorFileTypeId ?? item.id,
        label: item.VendorFileTypeName ?? item.name ?? ''
      }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Add new vendor
   * Hits POST /verp-service/vendor/add with Multipart Form payload (FlagId: 4, CompanyId: <id>)
   */
  addVendor: async (data) => {
    const companyId = getSessionCompanyId(data?.CompanyId ?? data?.companyId);
    let body;

    if (data instanceof FormData) {
      body = data;
      if (companyId !== null && companyId !== undefined && !body.has('CompanyId')) {
        body.append('CompanyId', Number(companyId));
      }
    } else {
      const formData = new FormData();
      formData.append('FlagId', 4);
      if (companyId !== null && companyId !== undefined) {
        formData.append('CompanyId', Number(companyId));
      }
      formData.append('VendorName', data.VendorName || data.vendorName || '');
      formData.append('VendorCode', data.VendorCode || data.vendorCode || '');
      formData.append('ContactPerson', data.ContactPerson || data.contactPerson || '');
      formData.append('MobileNumber', data.MobileNumber || data.phone || data.mobileNumber || '');
      formData.append('Email', data.Email || data.email || '');
      formData.append('GSTINUINNumber', data.GSTINUINNumber || data.gstNumber || '');
      formData.append('City', data.City || data.city || '');
      formData.append('BankName', data.BankName || data.bankName || '');
      formData.append('AccountHolderName', data.AccountHolderName || data.accountHolderName || '');
      formData.append('IFSCCode', data.IFSCCode || data.ifscCode || '');
      formData.append('VendorAddress1', data.VendorAddress1 || data.vendorAddress1 || data.address || '');
      formData.append('VendorAddress2', data.VendorAddress2 || data.vendorAddress2 || '');
      formData.append('Remarks', data.Remarks || data.remarks || '');
      if (data.VendorTypeId || data.vendorTypeId) {
        formData.append('VendorTypeId', Number(data.VendorTypeId || data.vendorTypeId));
      }

      const userId = data.CreatedByUserId ?? data.createdByUserId ?? data.userId;
      if (userId !== undefined && userId !== null) {
        formData.append('CreatedByUserId', Number(userId));
      }

      // Append files and their corresponding file types if available
      const rawFiles = data.files || data.Files || (data.file ? [data.file] : []);
      const fileList = Array.isArray(rawFiles)
        ? rawFiles
        : (data.file instanceof File ? [{ fileInstance: data.file, VendorFileTypeId: data.VendorFileTypeId }] : []);

      fileList.forEach((f) => {
        const fileObj = f instanceof File ? f : (f.fileInstance instanceof File ? f.fileInstance : null);
        const fileTypeId = f.VendorFileTypeId ?? f.vendorFileTypeId ?? f.FileTypeId ?? f.fileTypeId ?? data.VendorFileTypeId ?? data.vendorFileTypeId;
        if (fileObj) {
          if (fileTypeId !== undefined && fileTypeId !== null && fileTypeId !== '') {
            formData.append('VendorFileTypeIds', Number(fileTypeId));
          }
          formData.append('VendorFiles', fileObj);
        }
      });

      body = formData;
    }

    return await apiClient.post(API_ROUTES.VENDOR.ADD, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Update existing vendor
   * Hits PATCH /verp-service/vendor/edit with same payload as add (FlagId: 5, CompanyId: <id>)
   */
  updateVendor: async (data) => {
    const companyId = getSessionCompanyId(data?.CompanyId ?? data?.companyId);
    let body;

    if (data instanceof FormData) {
      body = data;
      if (companyId !== null && companyId !== undefined && !body.has('CompanyId')) {
        body.append('CompanyId', Number(companyId));
      }
    } else {
      const formData = new FormData();
      formData.append('FlagId', 5);
      if (companyId !== null && companyId !== undefined) {
        formData.append('CompanyId', Number(companyId));
      }
      if (data.VendorId || data.id) {
        formData.append('VendorId', Number(data.VendorId || data.id));
      }
      formData.append('VendorName', data.VendorName || data.vendorName || '');
      formData.append('VendorCode', data.VendorCode || data.vendorCode || '');
      formData.append('ContactPerson', data.ContactPerson || data.contactPerson || '');
      formData.append('MobileNumber', data.MobileNumber || data.phone || data.mobileNumber || '');
      formData.append('Email', data.Email || data.email || '');
      formData.append('GSTINUINNumber', data.GSTINUINNumber || data.gstNumber || '');
      formData.append('City', data.City || data.city || '');
      formData.append('BankName', data.BankName || data.bankName || '');
      formData.append('AccountHolderName', data.AccountHolderName || data.accountHolderName || '');
      formData.append('IFSCCode', data.IFSCCode || data.ifscCode || '');
      formData.append('VendorAddress1', data.VendorAddress1 || data.vendorAddress1 || data.address || '');
      formData.append('VendorAddress2', data.VendorAddress2 || data.vendorAddress2 || '');
      formData.append('Remarks', data.Remarks || data.remarks || '');
      if (data.VendorTypeId || data.vendorTypeId) {
        formData.append('VendorTypeId', Number(data.VendorTypeId || data.vendorTypeId));
      }

      const userId = data.UpdatedByUserId ?? data.CreatedByUserId ?? data.updatedByUserId ?? data.createdByUserId;
      if (userId !== undefined && userId !== null) {
        formData.append('CreatedByUserId', Number(userId));
        formData.append('UpdatedByUserId', Number(userId));
      }
      if (data.UpdatedByUserName || data.updatedByUserName || data.CreatedByUserName) {
        formData.append('UpdatedByUserName', data.UpdatedByUserName || data.updatedByUserName || data.CreatedByUserName);
      }

      // Append files and their corresponding file types if available
      const rawFiles = data.files || data.Files || (data.file ? [data.file] : []);
      const fileList = Array.isArray(rawFiles)
        ? rawFiles
        : (data.file instanceof File ? [{ fileInstance: data.file, VendorFileTypeId: data.VendorFileTypeId }] : []);

      fileList.forEach((f) => {
        const fileObj = f instanceof File ? f : (f.fileInstance instanceof File ? f.fileInstance : null);
        const fileTypeId = f.VendorFileTypeId ?? f.vendorFileTypeId ?? f.FileTypeId ?? f.fileTypeId ?? data.VendorFileTypeId ?? data.vendorFileTypeId;
        if (fileObj) {
          if (fileTypeId !== undefined && fileTypeId !== null && fileTypeId !== '') {
            formData.append('VendorFileTypeIds', Number(fileTypeId));
          }
          formData.append('VendorFiles', fileObj);
        }
      });

      body = formData;
    }

    return await apiClient.patch(API_ROUTES.VENDOR.EDIT, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Toggle vendor status
   * Hits PATCH /verp-service/vendor/status with:
   * {
   *   "FlagId": 6,
   *   "CompanyId": <CompanyId>,
   *   "VendorId": <VendorId>,
   *   "IsDisabled": <boolean>
   * }
   */
  toggleStatus: async (idOrData, currentStatus) => {
    const vendor = typeof idOrData === 'object' ? idOrData : {};
    const vendorId = typeof idOrData === 'object'
      ? Number(idOrData.VendorId ?? idOrData.id)
      : Number(idOrData);

    const isCurrentlyDisabled =
      vendor.IsDisabled === true ||
      vendor.isDisabled === true ||
      currentStatus === 'Inactive' ||
      vendor.status === 'Inactive';

    const nextIsDisabled = !isCurrentlyDisabled;
    const nextStatus = nextIsDisabled ? 'Inactive' : 'Active';

    const companyId = getSessionCompanyId(vendor?.CompanyId ?? vendor?.companyId);
    const payload = {
      FlagId: 6,
      VendorId: vendorId,
      IsDisabled: nextIsDisabled
    };
    if (companyId !== null && companyId !== undefined) {
      payload.CompanyId = Number(companyId);
    }

    const response = await apiClient.patch(API_ROUTES.VENDOR.STATUS, payload);
    return { status: 'success', nextStatus, data: response };
  },

  /**
   * Delete vendor
   * Hits POST /verp-service/vendor/delete with FlagId: 5, VendorId, CompanyId
   */
  deleteVendor: async (idOrData) => {
    const vendor = typeof idOrData === 'object' ? idOrData : {};
    const id = typeof idOrData === 'object' ? (idOrData.VendorId ?? idOrData.id) : idOrData;
    const companyId = getSessionCompanyId(vendor?.CompanyId ?? vendor?.companyId);

    const payload = {
      FlagId: 5,
      flagId: 5,
      VendorId: id,
      id
    };
    if (companyId !== null && companyId !== undefined) {
      payload.CompanyId = Number(companyId);
    }

    return await apiClient.post(API_ROUTES.VENDOR.DELETE, payload);
  }
};

export default vendorService;

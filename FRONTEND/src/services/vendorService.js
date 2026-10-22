// src/services/vendorService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const vendorService = {
  /**
   * Fetch all vendors from /verp-service/vendor/view with FlagId: 1
   */
  getVendors: async () => {
    try {
      const response = await apiClient.post(API_ROUTES.VENDOR.VIEW, {
        FlagId: 1
      });

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
      console.error('Failed to fetch vendors from API:', error);
      return [];
    }
  },

  /**
   * Fetch Vendor Types Dropdown
   * POST /verp-service/vendor/dropdown with { FlagId: 2 }
   */
  getVendorTypes: async () => {
    try {
      const response = await apiClient.post(API_ROUTES.VENDOR.DROPDOWN, {
        FlagId: 2
      });

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
      console.error('Failed to fetch vendor types:', error);
      return [];
    }
  },

  /**
   * Fetch Vendor File Types Dropdown
   * POST /verp-service/vendor/dropdown with { FlagId: 3 }
   */
  getVendorFileTypes: async () => {
    try {
      const response = await apiClient.post(API_ROUTES.VENDOR.DROPDOWN, {
        FlagId: 3
      });

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
      console.error('Failed to fetch vendor file types:', error);
      return [];
    }
  },

  /**
   * Add new vendor
   * Hits POST /verp-service/vendor/add with Multipart Form payload (FlagId: 4)
   */
  addVendor: async (data) => {
    let body;

    if (data instanceof FormData) {
      body = data;
    } else {
      const formData = new FormData();
      formData.append('FlagId', 4);
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
   * Hits PATCH /verp-service/vendor/edit with same payload as add
   */
  updateVendor: async (data) => {
    let body;

    if (data instanceof FormData) {
      body = data;
    } else {
      const formData = new FormData();
      formData.append('FlagId', 5);
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

    const response = await apiClient.patch(API_ROUTES.VENDOR.STATUS, {
      FlagId: 6,
      VendorId: vendorId,
      IsDisabled: nextIsDisabled
    });
    return { status: 'success', nextStatus, data: response };
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (idOrData) => {
    const id = typeof idOrData === 'object' ? (idOrData.VendorId ?? idOrData.id) : idOrData;
    return await apiClient.post(API_ROUTES.VENDOR.DELETE, {
      FlagId: 5,
      flagId: 5,
      VendorId: id,
      id
    });
  }
};

export default vendorService;

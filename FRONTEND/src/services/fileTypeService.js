// src/services/fileTypeService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const fileTypeService = {
  /**
   * Get all file types (FlagId: 1)
   */
  getFileTypes: async () => {
    return apiClient.post(API_ROUTES.FILE_TYPE.GET_FILE_TYPES, {
      FlagId: 1
    });
  },

  /**
   * Add a new file type (FlagId: 2)
   * @param {Object} data - { FileTypeName, Description, CreatedByUserName }
   */
  addFileType: async (data) => {
    return apiClient.post(API_ROUTES.FILE_TYPE.ADD_FILE_TYPE, {
      FlagId: 2,
      ...data
    });
  },

  /**
   * Update existing file type (FlagId: 3)
   * @param {Object} data - { FileTypeId, FileTypeName, Description, UpdatedByUserName }
   */
  updateFileType: async (data) => {
    return apiClient.post(API_ROUTES.FILE_TYPE.UPDATE_FILE_TYPE, {
      FlagId: 3,
      ...data
    });
  },

  /**
   * Delete file type (FlagId: 4)
   * @param {number|string} fileTypeId 
   */
  deleteFileType: async (fileTypeId) => {
    return apiClient.post(API_ROUTES.FILE_TYPE.DELETE_FILE_TYPE, {
      FlagId: 4,
      FileTypeId: fileTypeId
    });
  },

  /**
   * Update file type status (FlagId: 5)
   * @param {number|string} fileTypeId 
   * @param {boolean} isDisabled 
   * @param {string} updatedBy 
   */
  updateFileTypeStatus: async (fileTypeId, isDisabled, updatedBy) => {
    return apiClient.post(API_ROUTES.FILE_TYPE.UPDATE_STATUS, {
      FlagId: 5,
      FileTypeId: fileTypeId,
      IsDisabled: isDisabled,
      UpdatedByUserName: updatedBy
    });
  }
};

export default fileTypeService;

// src/services/projectService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const projectService = {
  /**
   * View all projects (flagId: 1)
   */
  getProjects: async (flagId = 1) => {
    return apiClient.post(API_ROUTES.PROJECT.GET_PROJECTS, {
      flagId: Number(flagId),
      FlagId: Number(flagId)
    });
  },

  /**
   * Get company products dropdown for project creation (flagId: 1)
   */
  getCompanyProductsDropdown: async () => {
    return apiClient.post(API_ROUTES.PROJECT.ADD_PROJECT, {
      flagId: 1,
      FlagId: 1
    });
  },

  /**
   * Add a new project (flagId: 2)
   * @param {Object} data - { CompanyProductId, ProjectName, ProjectCode, IsDisabled, Description, CreatedByUserId, CreatedByUserName }
   */
  addProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.ADD_PROJECT, {
      flagId: 2,
      FlagId: 2,
      CompanyProductId: Number(data.CompanyProductId || data.companyProductId),
      ProjectName: data.ProjectName || data.projectName || '',
      ProjectCode: data.ProjectCode || data.projectCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      Description: data.Description || data.description || '',
      CreatedByUserId: Number(data.CreatedByUserId ?? data.UserId ?? data.userId ?? 1),
      CreatedByUserName: String(data.CreatedByUserName || 'admin')
    });
  },

  /**
   * Get company products dropdown for project edit (flagId: 1)
   */
  getCompanyProductsForEditDropdown: async () => {
    return apiClient.post(API_ROUTES.PROJECT.EDIT_PROJECT, {
      flagId: 1,
      FlagId: 1
    });
  },

  /**
   * Edit existing project (flagId: 2)
   * @param {Object} data - { ProjectId, CompanyProductId, ProjectName, ProjectCode, IsDisabled, Description, UpdatedByUserId, UpdatedByUserName }
   */
  editProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.EDIT_PROJECT, {
      flagId: 2,
      FlagId: 2,
      ProjectId: Number(data.ProjectId ?? data.id),
      CompanyProductId: Number(data.CompanyProductId || data.companyProductId),
      ProjectName: data.ProjectName || data.projectName || '',
      ProjectCode: data.ProjectCode || data.projectCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      Description: data.Description || data.description || '',
      UpdatedByUserId: Number(data.UpdatedByUserId ?? data.UserId ?? data.userId ?? 1),
      UpdatedByUserName: String(data.UpdatedByUserName || data.UpdateByUserName || 'admin')
    });
  },

  /**
   * Toggle project status (flagId: 4)
   * @param {Object} data - { ProjectId, IsDisabled, UpdatedByUserId, UpdatedByUserName }
   */
  toggleProjectStatus: async (data) => {
    const id = typeof data === 'object' ? (data.ProjectId ?? data.id) : data;
    const isDisabled = typeof data.IsDisabled === 'boolean'
      ? data.IsDisabled
      : (data.IsDisabled === 'true' || data.IsDisabled === 'Inactive' || data.IsDisabled === 'Disabled' || data.status === 'Inactive');

    return apiClient.post(API_ROUTES.PROJECT.TOGGLE_STATUS, {
      flagId: 4,
      FlagId: 4,
      ProjectId: Number(id),
      IsDisabled: Boolean(isDisabled),
      UpdatedByUserId: Number(data.UpdatedByUserId ?? 1),
      UpdatedByUserName: String(data.UpdatedByUserName || data.UpdateByUserName || 'admin')
    });
  },

  /**
   * Delete project (flagId: 1)
   * @param {number|string|Object} idOrData 
   */
  deleteProject: async (idOrData) => {
    const id = typeof idOrData === 'object' ? (idOrData.ProjectId ?? idOrData.id) : idOrData;
    return apiClient.post(API_ROUTES.PROJECT.DELETE_PROJECT, {
      flagId: 1,
      FlagId: 1,
      ProjectId: Number(id)
    });
  }
};

export default projectService;

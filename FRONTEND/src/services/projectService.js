// src/services/projectService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const projectService = {
  /**
   * View all projects (flagId: 1)
   */
  getProjects: async () => {
    return apiClient.post(API_ROUTES.PROJECT.GET_PROJECTS, {
      flagId: 1
    });
  },

  /**
   * Get company products dropdown for project creation (flagId: 1)
   */
  getCompanyProductsDropdown: async () => {
    return apiClient.post(API_ROUTES.PROJECT.DROPDOWN_OR_ADD, {
      flagId: 1
    });
  },

  /**
   * Add a new project (flagId: 2)
   * @param {Object} data - { CompanyProductId, ProjectName, ProjectCode, IsDisabled, Description, CreatedByUserId }
   */
  addProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.DROPDOWN_OR_ADD, {
      flagId: 2,
      ...data
    });
  },

  /**
   * Edit existing project (flagId: 2)
   * @param {Object} data - { ProjectId, CompanyProductId, ProjectName, ProjectCode, Description, UpdatedByUserId }
   */
  editProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.EDIT_PROJECT, {
      flagId: 2,
      ...data
    });
  },

  /**
   * Toggle project status (flagId: 3)
   * @param {Object} data - { ProjectId, IsDisabled, UpdatedByUserId }
   */
  toggleProjectStatus: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.TOGGLE_STATUS, {
      flagId: 3,
      ...data
    });
  },

  /**
   * Delete project (flagId: 4)
   * @param {number|string} projectId 
   */
  deleteProject: async (projectId) => {
    return apiClient.post(API_ROUTES.PROJECT.DELETE_PROJECT, {
      flagId: 4,
      ProjectId: projectId
    });
  }
};

export default projectService;

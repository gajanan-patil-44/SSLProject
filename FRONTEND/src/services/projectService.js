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
    return apiClient.post(API_ROUTES.PROJECT.ADD_PROJECT, {
      flagId: 1
    });
  },

  /**
   * Add a new project (flagId: 2)
   * @param {Object} data - { CompanyProductId, ProjectName, ProjectCode, IsDisabled, Description, CreatedByUserId }
   */
  addProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.ADD_PROJECT, {
      flagId: 2,
      CompanyProductId: Number(data.CompanyProductId || data.companyProductId),
      ProjectName: data.ProjectName || data.projectName || '',
      ProjectCode: data.ProjectCode || data.projectCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      Description: data.Description || data.description || '',
      CreatedByUserId: Number(data.CreatedByUserId ?? data.UserId ?? data.userId ?? 1)
    });
  },

  /**
   * Get company products dropdown for project edit (flagId: 1)
   */
  getCompanyProductsForEditDropdown: async () => {
    return apiClient.post(API_ROUTES.PROJECT.EDIT_PROJECT, {
      flagId: 1
    });
  },

  /**
   * Edit existing project (flagId: 2)
   * @param {Object} data - { ProjectId, CompanyProductId, ProjectName, ProjectCode, IsDisabled, Description, UpdatedByUserId }
   */
  editProject: async (data) => {
    return apiClient.post(API_ROUTES.PROJECT.EDIT_PROJECT, {
      flagId: 2,
      ProjectId: Number(data.ProjectId ?? data.id),
      CompanyProductId: Number(data.CompanyProductId || data.companyProductId),
      ProjectName: data.ProjectName || data.projectName || '',
      ProjectCode: data.ProjectCode || data.projectCode || '',
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : false,
      Description: data.Description || data.description || '',
      UpdatedByUserId: Number(data.UpdatedByUserId ?? data.UserId ?? data.userId ?? 1)
    });
  },

  /**
   * Toggle project status (flagId: 4)
   * @param {Object} data - { ProjectId, IsDisabled, UpdatedByUserId }
   */
  toggleProjectStatus: async (data) => {
    const userState = (typeof window !== 'undefined' && window.localStorage) ? (() => {
      try {
        const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
        if (raw) {
          const s = JSON.parse(raw);
          const u = s?.data?.user;
          return {
            userId: Number(u?.UserId ?? u?.id ?? 1),
            userName: u?.loginName || u?.LoginName || u?.EmployeeId || ''
          };
        }
        const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
        return {
          userId: Number(u?.UserId ?? u?.id ?? 1),
          userName: u?.loginName || u?.LoginName || u?.EmployeeId || ''
        };
      } catch { return { userId: 1, userName: '' }; }
    })() : { userId: 1, userName: '' };

    const userId = Number(data.UpdatedByUserId ?? data.UserId ?? data.userId ?? userState.userId);
    const userName = data.UpdatedByUserName || data.UpdateByUserName || userState.userName;

    return apiClient.post(API_ROUTES.PROJECT.TOGGLE_STATUS, {
      flagId: 4,
      ProjectId: Number(data.ProjectId ?? data.id),
      IsDisabled: typeof data.IsDisabled === 'boolean' ? data.IsDisabled : Boolean(data.IsDisabled),
      UpdatedByUserId: userId,
      UpdatedByUserName: userName,
      UpdateByUserName: userName
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
      ProjectId: Number(id)
    });
  }
};

export default projectService;

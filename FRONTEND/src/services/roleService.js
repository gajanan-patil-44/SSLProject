// src/services/roleService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const roleService = {
  /**
   * Get all roles (FlagId: 1)
   */
  getRoles: async () => {
    return apiClient.post(API_ROUTES.ROLE.GET_ROLE, {
      FlagId: 1
    });
  },

  /**
   * Add a new role (FlagId: 2)
   * @param {Object} roleData 
   */
  addRole: async (roleData) => {
    if (!API_ROUTES.ROLE.ADD_ROLE) {
      throw new Error('ADD_ROLE endpoint has not been registered yet.');
    }
    return apiClient.post(API_ROUTES.ROLE.ADD_ROLE, {
      FlagId: 2,
      ...roleData
    });
  },

  /**
   * Get companies dropdown for role creation
   */
  getCompaniesForRole: async () => {
    if (!API_ROUTES.ROLE.DROPDOWN) {
      return { data: [] };
    }
    return apiClient.post(API_ROUTES.ROLE.DROPDOWN, {
      FlagId: 1
    });
  },

  /**
   * Update existing role (FlagId: 4)
   * @param {Object} roleData 
   */
  updateRole: async (roleData) => {
    if (!API_ROUTES.ROLE.UPDATE_ROLE) {
      throw new Error('UPDATE_ROLE endpoint has not been registered yet.');
    }
    return apiClient.post(API_ROUTES.ROLE.UPDATE_ROLE, {
      FlagId: 4,
      ...roleData
    });
  },

  /**
   * Delete role (FlagId: 5)
   * @param {number|string} roleId 
   */
  deleteRole: async (roleId) => {
    if (!API_ROUTES.ROLE.DELETE_ROLE) {
      throw new Error('DELETE_ROLE endpoint has not been registered yet.');
    }
    return apiClient.post(API_ROUTES.ROLE.DELETE_ROLE, {
      RoleId: Number(roleId),
      FlagId: 5
    });
  },

  /**
   * Update role enabled/disabled status (FlagId: 6)
   * @param {number|string} roleId 
   * @param {boolean} isDisabled 
   */
  updateRoleStatus: async (roleId, isDisabled) => {
    if (!API_ROUTES.ROLE.UPDATE_ROLE_STATUS) {
      throw new Error('UPDATE_ROLE_STATUS endpoint has not been registered yet.');
    }
    return apiClient.post(API_ROUTES.ROLE.UPDATE_ROLE_STATUS, {
      FlagId: 6,
      RoleId: Number(roleId),
      IsDisabled: Boolean(isDisabled)
    });
  }
};

export default roleService;

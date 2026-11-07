// src/services/prRequestService.js
import apiClient from './apiClient';

const PR_ROUTES = {
  GET_DROPDOWNS:   '/verp-service/purchaseRequisition/dropdown',
  SUBMIT:          '/verp-service/purchaseRequisition/add',
  SAVE_DRAFT:      '/verp-service/purchaseRequisition/saveDraft',
  GET_ITEMS_DD:    '/verp-service/material/dropdown',
  GET_PROJECTS_DD: '/verp-service/projectCreation/project',
};

const prRequestService = {
  /**
   * Fetch form dropdowns: projects, priorities, items
   */
  getDropdowns: async (userId) => {
    try {
      const res = await apiClient.post(PR_ROUTES.GET_DROPDOWNS, { flagId: 1, UserId: userId });
      return res;
    } catch {
      return null;
    }
  },

  /**
   * Fetch items / materials dropdown
   */
  getItemsDropdown: async () => {
    try {
      const res = await apiClient.post(PR_ROUTES.GET_ITEMS_DD, { FlagId: 1 });
      return res;
    } catch {
      return null;
    }
  },

  /**
   * Fetch projects dropdown
   */
  getProjectsDropdown: async () => {
    try {
      const res = await apiClient.post(PR_ROUTES.GET_PROJECTS_DD, { flagId: 1 });
      return res;
    } catch {
      return null;
    }
  },

  /**
   * Submit a Purchase Requisition
   */
  submitPR: async (payload) => {
    return apiClient.post(PR_ROUTES.SUBMIT, { flagId: 2, ...payload });
  },

  /**
   * Save as Draft
   */
  saveDraft: async (payload) => {
    return apiClient.post(PR_ROUTES.SAVE_DRAFT, { flagId: 2, ...payload });
  }
};

export default prRequestService;


// src/services/birthdayService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const birthdayService = {
  processBirthdayMail: async () => {
    return apiClient.post(API_ROUTES.BIRTHDAY.PROCESS_MAIL);
  },

  getBirthdayMailLogs: async () => {
    return apiClient.get(API_ROUTES.BIRTHDAY.GET_LOGS);
  },

  getBirthdayMailLogById: async (id) => {
    return apiClient.get(API_ROUTES.BIRTHDAY.GET_LOG_BY_ID(id));
  }
};

export default birthdayService;

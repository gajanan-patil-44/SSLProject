// src/services/api.js
import apiClient from './apiClient';
import authService from './authService';
import companyService from './companyService';
import productService from './productService';
import roleService from './roleService';
import designationService from './designationService';
import projectService from './projectService';
import companyProductService from './companyProductService';
import fileTypeService from './fileTypeService';
import userService from './userService';
import birthdayService from './birthdayService';

export const api = {
  auth: authService,
  company: companyService,
  product: productService,
  role: roleService,
  designation: designationService,
  project: projectService,
  companyProduct: companyProductService,
  fileType: fileTypeService,
  user: userService,
  birthday: birthdayService,
  client: apiClient
};

export default api;

// src/services/api.js
import apiClient from './apiClient';
import authService from './authService';
import companyService from './companyService';
import productService from './productService';
import roleService from './roleService';
import designationService from './designationService';
import projectService from './projectService';
import fileTypeService from './fileTypeService';
import userService from './userService';
import birthdayService from './birthdayService';
import companyProductService from './companyProductService';
import pageService from './pageService';
import vendorService from './vendorService';
import itemCreationService from './itemCreationService';
import materialCategoryTypeService from './materialCategoryTypeService';
import materialSubCategoryTypeService from './materialSubCategoryTypeService';

export const api = {
  auth: authService,
  company: companyService,
  product: productService,
  companyProduct: companyProductService,
  role: roleService,
  designation: designationService,
  project: projectService,
  fileType: fileTypeService,
  user: userService,
  birthday: birthdayService,
  page: pageService,
  vendor: vendorService,
  item: itemCreationService,
  material: itemCreationService,
  materialCategory: materialCategoryTypeService,
  materialSubCategory: materialSubCategoryTypeService,
  client: apiClient
};

export default api;

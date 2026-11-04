// src/routes/apiRoutes.js

/**
 * ============================================================================
 * BASE URL CONFIGURATION
 * ============================================================================
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ============================================================================
 * 1. AUTHENTICATION ROUTES
 * ============================================================================
 */
export const AUTH_ROUTES = {
  LOGIN: '/verp-service/auth/login',
  LOGIN_DETAIL: '/verp-service/auth/logindetail'
};

/**
 * ============================================================================
 * 2. ROLE CREATION ROUTES
 * ============================================================================
 */
export const ROLE_ROUTES = {
  GET_ROLE: '/verp-service/roleCreation/getRole',
  ADD_ROLE: '/verp-service/roleCreation/addRole',
  UPDATE_ROLE: '/verp-service/roleCreation/updateRole',
  UPDATE_ROLE_STATUS: '/verp-service/roleCreation/updateRoleStatus',
  DELETE_ROLE: '/verp-service/roleCreation/deleteRole',
  DROPDOWN: '/verp-service/roleCreation/dropdown'
};

/**
 * ============================================================================
 * 3. PRODUCT CREATION ROUTES
 * ============================================================================
 */
export const PRODUCT_ROUTES = {
  GET_PRODUCTS: '/verp-service/productCreation/getProduct',
  ADD_PRODUCT: '/verp-service/productCreation/addProduct',
  UPDATE_PRODUCT: '/verp-service/productCreation/updateProduct',
  TOGGLE_STATUS: '/verp-service/productCreation/toggleProductStatus',
  DELETE_PRODUCT: '/verp-service/productCreation/deleteProduct'
};

/**
 * ============================================================================
 * 4. COMPANY CREATION (Standard Companies) ROUTES
 * ============================================================================
 */
export const COMPANY_ROUTES = {
  GET_COMPANIES: '/verp-service/companyCreation/getCompany',
  ADD_COMPANY: '/verp-service/companyCreation/addCompany',
  UPDATE_COMPANY: '/verp-service/companyCreation/updateCompany',
  TOGGLE_STATUS: '/verp-service/companyCreation/toggleCompanyStatus',
  DELETE_COMPANY: '/verp-service/companyCreation/deleteCompany'
};

/**
 * ============================================================================
 * 5. COMPANY MASTER (Enterprise Profile & Tax) ROUTES
 * ============================================================================
 */
export const COMPANY_MASTER_ROUTES = {
  GET_COMPANY_MASTER: '/verp-service/companyMaster/getCompanyMaster',
  ADD_COMPANY_MASTER: '/verp-service/companyMaster/addCompanyMaster',
  UPDATE_COMPANY_MASTER: '/verp-service/companyMaster/updateCompanyMaster',
  TOGGLE_COMPANY_MASTER_STATUS: '/verp-service/companyMaster/toggleCompanyMasterStatus',
  DELETE_COMPANY_MASTER: '/verp-service/companyMaster/deleteCompanyMaster'
};

/**
 * ============================================================================
 * 6. LOCATION TYPE MASTER ROUTES
 * ============================================================================
 */
export const LOCATION_TYPE_MASTER_ROUTES = {
  VIEW: '/verp-service/locationTypeMaster/view',
  ADD: '/verp-service/locationTypeMaster/add',
  DROPDOWN: '/verp-service/locationTypeMaster/dropdown',
  EDIT: '/verp-service/locationTypeMaster/edit'
};

/**
 * ============================================================================
 * 7. LOCATION MASTER ROUTES
 * ============================================================================
 */
export const LOCATION_MASTER_ROUTES = {
  VIEW: '/verp-service/locationMaster/view',
  LOCATION_TYPE: '/verp-service/locationMaster/locationType',
  PARENT_LOCATION_TYPE: '/verp-service/locationMaster/parentLocationType',
  PARENT_LOCATION_MASTER: '/verp-service/locationMaster/parentLocationMaster',
  ADD_LOCATION_MASTER: '/verp-service/locationMaster/addLocationMaster',
  DROPDOWN: '/verp-service/locationMaster/dropdown',
  EDIT: '/verp-service/locationMaster/edit',
  TOGGLE_STATUS: '/verp-service/locationMaster/toggleStatus',
  DELETE: '/verp-service/locationMaster/delete'
};

/**
 * ============================================================================
 * 8. COMPANY PRODUCT ROUTES
 * ============================================================================
 */
export const COMPANY_PRODUCT_ROUTES = {
  VIEW: '/verp-service/companyProductCreation/view',
  COMPANY_PRODUCT: '/verp-service/companyProductCreation/companyProduct',
  EDIT_COMPANY_PRODUCT: '/verp-service/companyProductCreation/editcompanyproduct',
  DELETE_COMPANY_PRODUCT: '/verp-service/companyProductCreation/deleteCompanyProduct',
  UPDATE_STATUS: '/verp-service/companyProductCreation/updateCompanyProductstatus'
};

/**
 * ============================================================================
 * 9. DESIGNATION ROUTES
 * ============================================================================
 */
export const DESIGNATION_ROUTES = {
  GET_DESIGNATIONS: '/verp-service/designationCreation/view',
  DROPDOWN_OR_ADD: '/verp-service/designationCreation/designation',
  ADD_DESIGNATION: '/verp-service/designationCreation/designation',
  EDIT_DESIGNATION: '/verp-service/designationCreation/editdesignation',
  TOGGLE_STATUS: '/verp-service/designationCreation/toggleDesignationStatus',
  DELETE_DESIGNATION: '/verp-service/designationCreation/deleteDesignation'
};

/**
 * ============================================================================
 * 10. PROJECT ROUTES
 * ============================================================================
 */
export const PROJECT_ROUTES = {
  GET_PROJECTS: '/verp-service/projectCreation/view',
  ADD_PROJECT: '/verp-service/projectCreation/project',
  EDIT_PROJECT: '/verp-service/projectCreation/editproject',
  TOGGLE_STATUS: '/verp-service/projectCreation/toggleProjectStatus',
  DELETE_PROJECT: '/verp-service/projectCreation/deleteProject'
};

/**
 * ============================================================================
 * 11. USER CREATION ROUTES
 * ============================================================================
 */
export const USER_ROUTES = {
  CREATE_USER: '/verp-service/userCreation/createuser',
  USERDROPDOWNS: '/verp-service/userCreation/userdropdowns',
  CPP_DROPDOWN: '/verp-service/userCreation/companyproductprojectdropdown',
  DEPARTMENT_DROPDOWN: '/verp-service/userCreation/companyproductprojectdropdown'
};

/**
 * ============================================================================
 * 12. FILE TYPE ROUTES
 * ============================================================================
 */
export const FILE_TYPE_ROUTES = {
  GET_FILE_TYPES: '/verp-service/fileType/getfiletypes',
  ADD_FILE_TYPE: '/verp-service/fileType/addfiletype',
  UPDATE_FILE_TYPE: '/verp-service/fileType/updatefiletype',
  DELETE_FILE_TYPE: '/verp-service/fileType/deletefiletype',
  UPDATE_STATUS: '/verp-service/fileType/updatefiletypestatus'
};

/**
 * ============================================================================
 * 13. PAGE MANAGEMENT ROUTES
 * ============================================================================
 */
export const PAGE_ROUTES = {
  VIEW: '/verp-service/managePages/view',
  DROPDOWN: '/verp-service/managePages/dropdown',
  STATUS: '/verp-service/managePages/status',
  ADD: '/verp-service/managePages/add',
  EDIT: '/verp-service/managePages/edit'
};

/**
 * ============================================================================
 * 14. USER EDIT & MANAGE ROUTES
 * ============================================================================
 */
export const USER_EDIT_ROUTES = {
  GET_ALL_USER_DETAILS: '/verp-service/userEdit/getAllUserDetails',
  EDIT_USER_DETAILS: '/verp-service/userEdit/editUserdetails',
  TOGGLE_USER_STATUS: '/verp-service/userEdit/toggleUserStatus',
  CHANGE_PASSWORD: '/verp-service/userEdit/change-password',
  GET_GENDER: '/verp-service/userEdit/getGender',
  GET_MARITAL_STATUS: '/verp-service/userEdit/getMaritalStatus',
  GET_DESIGNATION: '/verp-service/userEdit/getDesignation',
  GET_COMPANY: '/verp-service/userEdit/getCompany',
  GET_REPORTING_MANAGER: '/verp-service/userEdit/getReportingManager',
  GET_COMPANY_PRODUCT: '/verp-service/userEdit/getCompanyProduct',
  GET_PROJECT: '/verp-service/userEdit/getProject',
  GET_ROLE: '/verp-service/userEdit/getRole'
};

/**
 * ============================================================================
 * 15. BIRTHDAY EMAIL ROUTES
 * ============================================================================
 */
export const BIRTHDAY_ROUTES = {
  PROCESS_MAIL: '/verp-service/birthdayEmails/process',
  GET_LOGS: '/verp-service/birthdayEmails/logs',
  GET_LOG_BY_ID: (id) => `/verp-service/birthdayEmails/logs/${id}`
};

/**
 * ============================================================================
 * 16. MATERIAL / ITEM CREATION ROUTES
 * ============================================================================
 */
export const MATERIAL_ROUTES = {
  VIEW: '/verp-service/material/view',
  ADD: '/verp-service/material/add',
  EDIT: '/verp-service/material/edit',
  STATUS: '/verp-service/material/status',
  DROPDOWN: '/verp-service/material/dropdown',
  VIEW_FILE: '/verp-service/material/view-file'
};

/**
 * ============================================================================
 * 17. VENDOR MANAGEMENT ROUTES
 * ============================================================================
 */
export const VENDOR_ROUTES = {
  VIEW: '/verp-service/vendor/view',
  DROPDOWN: '/verp-service/vendor/dropdown',
  ADD: '/verp-service/vendor/add',
  EDIT: '/verp-service/vendor/edit',
  STATUS: '/verp-service/vendor/status',
  DELETE: '/verp-service/vendor/delete'
};

/**
 * ============================================================================
 * 18. DEPARTMENT ROUTES
 * ============================================================================
 */
export const DEPARTMENT_ROUTES = {
  GET_DEPARTMENTS: '/verp-service/department/getDepartment',
  ADD_DEPARTMENT: '/verp-service/department/addDepartment',
  UPDATE_DEPARTMENT: '/verp-service/department/updateDepartment',
  TOGGLE_DEPARTMENT_STATUS: '/verp-service/department/toggleDepartmentStatus'
};

/**
 * ============================================================================
 * 19. GST RATE / CREATION ROUTES
 * ============================================================================
 */
export const GST_RATE_ROUTES = {
  VIEW: '/verp-service/gstRate/view',
  ADD: '/verp-service/gstRate/add',
  EDIT: '/verp-service/gstRate/edit',
  STATUS: '/verp-service/gstRate/status',
  DROPDOWN: '/verp-service/gstRate/dropdown'
};

export const GST_ROUTES = GST_RATE_ROUTES;

/**
 * ============================================================================
 * API ENDPOINTS AGGREGATOR
 * ============================================================================
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ROLE: ROLE_ROUTES,
  PRODUCT: PRODUCT_ROUTES,
  COMPANY: COMPANY_ROUTES,
  COMPANY_MASTER: COMPANY_MASTER_ROUTES,
  LOCATION_TYPE_MASTER: LOCATION_TYPE_MASTER_ROUTES,
  LOCATION_MASTER: LOCATION_MASTER_ROUTES,
  COMPANY_PRODUCT: COMPANY_PRODUCT_ROUTES,
  DESIGNATION: DESIGNATION_ROUTES,
  PROJECT: PROJECT_ROUTES,
  USER: USER_ROUTES,
  USER_EDIT: USER_EDIT_ROUTES,
  FILE_TYPE: FILE_TYPE_ROUTES,
  PAGE: PAGE_ROUTES,
  BIRTHDAY: BIRTHDAY_ROUTES,
  ITEM: MATERIAL_ROUTES,
  MATERIAL: MATERIAL_ROUTES,
  VENDOR: VENDOR_ROUTES,
  DEPARTMENT: DEPARTMENT_ROUTES,
  GST: GST_RATE_ROUTES,
  GST_RATE: GST_RATE_ROUTES
};

export default API_ROUTES;

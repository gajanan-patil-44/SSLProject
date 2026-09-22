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
  LOGIN: '/verp-service/auth/login'
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
  DELETE_ROLE: '/verp-service/roleCreation/deleteRole'
};

/**
 * ============================================================================
 * 3. PRODUCT CREATION ROUTES
 * ============================================================================
 */
export const PRODUCT_ROUTES = {
  GET_PRODUCT: '/verp-service/productCreation/getProduct',
  GET_PRODUCTS: '/verp-service/productCreation/getProduct',
  ADD_PRODUCT: '/verp-service/productCreation/addProduct',
  UPDATE_PRODUCT: '/verp-service/productCreation/updateProduct',
  DELETE_PRODUCT: '/verp-service/productCreation/deleteProduct',
  TOGGLE_PRODUCT_STATUS: '/verp-service/productCreation/toggleProductStatus',
  TOGGLE_STATUS: '/verp-service/productCreation/toggleProductStatus'
};

/**
 * ============================================================================
 * 5. COMPANY CREATION ROUTES
 * ============================================================================
 */
export const COMPANY_ROUTES = {
  GET_COMPANY: '/verp-service/companyCreation/getCompany',
  GET_COMPANIES: '/verp-service/companyCreation/getCompany',
  ADD_COMPANY: '/verp-service/companyCreation/addCompany',
  UPDATE_COMPANY: '/verp-service/companyCreation/updateCompany',
  TOGGLE_COMPANY_STATUS: '/verp-service/companyCreation/toggleCompanyStatus',
  TOGGLE_STATUS: '/verp-service/companyCreation/toggleCompanyStatus'
};

/**
 * ============================================================================
 * 5.1. COMPANY PRODUCT CREATION ROUTES
 * ============================================================================
 */
export const COMPANY_PRODUCT_ROUTES = {
  VIEW: '/verp-service/companyProductCreation/view',
  GET_COMPANY_PRODUCTS: '/verp-service/companyProductCreation/view',
  GET_COMPANY_PRODUCT: '/verp-service/companyProductCreation/view',
  COMPANY_PRODUCT: '/verp-service/companyProductCreation/companyProduct',
  DROPDOWN: '/verp-service/companyProductCreation/companyProduct',
  DROPDOWN_OR_ADD: '/verp-service/companyProductCreation/companyProduct',
  EDIT_COMPANY_PRODUCT: '/verp-service/companyProductCreation/editcompanyproduct',
  UPDATE_COMPANY_PRODUCT: '/verp-service/companyProductCreation/editcompanyproduct',
  DELETE_COMPANY_PRODUCT: '/verp-service/companyProductCreation/deleteCompanyProduct',
  DELETE: '/verp-service/companyProductCreation/deleteCompanyProduct',
  UPDATE_STATUS: '/verp-service/companyProductCreation/updateCompanyProductstatus',
  TOGGLE_STATUS: '/verp-service/companyProductCreation/updateCompanyProductstatus'
};

/**
 * ============================================================================
 * 6. DESIGNATION CREATION ROUTES
 * ============================================================================
 */
export const DESIGNATION_ROUTES = {
  VIEW: '/verp-service/designationCreation/view',
  GET_DESIGNATIONS: '/verp-service/designationCreation/view',
  GET_DESIGNATION: '/verp-service/designationCreation/view',
  ADD_DESIGNATION: '/verp-service/designationCreation/designation',
  DESIGNATION: '/verp-service/designationCreation/designation',
  DROPDOWN_OR_ADD: '/verp-service/designationCreation/designation',
  EDIT_DESIGNATION: '/verp-service/designationCreation/editdesignation',
  UPDATE_DESIGNATION: '/verp-service/designationCreation/editdesignation',
  TOGGLE_DESIGNATION_STATUS: '/verp-service/designationCreation/toggleDesignationStatus',
  TOGGLE_STATUS: '/verp-service/designationCreation/toggleDesignationStatus',
  DELETE_DESIGNATION: '/verp-service/designationCreation/deleteDesignation',
  DELETE: '/verp-service/designationCreation/deleteDesignation'
};

/**
 * ============================================================================
 * 7. PROJECT CREATION ROUTES
 * ============================================================================
 */
export const PROJECT_ROUTES = {
  VIEW: '/verp-service/projectCreation/view',
  GET_PROJECTS: '/verp-service/projectCreation/view',
  GET_PROJECT: '/verp-service/projectCreation/view',
  ADD_PROJECT: '/verp-service/projectCreation/project',
  PROJECT: '/verp-service/projectCreation/project',
  DROPDOWN_OR_ADD: '/verp-service/projectCreation/project',
  EDIT_PROJECT: '/verp-service/projectCreation/editproject',
  UPDATE_PROJECT: '/verp-service/projectCreation/editproject',
  TOGGLE_PROJECT_STATUS: '/verp-service/projectCreation/toggleProjectStatus',
  TOGGLE_STATUS: '/verp-service/projectCreation/toggleProjectStatus',
  DELETE_PROJECT: '/verp-service/projectCreation/deleteProject',
  DELETE: '/verp-service/projectCreation/deleteProject'
};

/**
 * ============================================================================
 * 8. USER CREATION ROUTES
 * ============================================================================
 */
export const USER_ROUTES = {
  CREATE_USER: '/verp-service/userCreation/createuser',
  USERDROPDOWNS: '/verp-service/userCreation/userdropdowns',
  DROPDOWNS: '/verp-service/userCreation/dropdowns',
  // Old placeholder kept for reference
  COMPANY_PRODUCT_PROJECT_DROPDOWN: '/verp-service/userCreation/companyProductProjectDropdown',
  // New confirmed endpoint for company → product → project → role cascade
  CPP_DROPDOWN: '/verp-service/userCreation/companyproductprojectdropdown',
  GET_ALL_USER_DETAILS: '/verp-service/userEdit/getAllUserDetails',
  EDIT_USER_DETAILS: '/verp-service/userEdit/editUserdetails',
  TOGGLE_USER_STATUS: '/verp-service/userEdit/toggleUserStatus'
};

/**
 * ============================================================================
 * 9. FILE TYPE ROUTES
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
 * 10. PAGE MANAGEMENT ROUTES
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
 * 11. USER EDIT & MANAGE ROUTES
 * ============================================================================
 */
export const USER_EDIT_ROUTES = {
  GET_ALL_USER_DETAILS: '/verp-service/userEdit/getAllUserDetails',
  EDIT_USER_DETAILS: '/verp-service/userEdit/editUserdetails',
  TOGGLE_USER_STATUS: '/verp-service/userEdit/toggleUserStatus',
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
 * 12. BIRTHDAY EMAIL ROUTES
 * ============================================================================
 */
export const BIRTHDAY_ROUTES = {
  PROCESS_MAIL: '/verp-service/birthdayEmails/process',
  GET_LOGS: '/verp-service/birthdayEmails/logs',
  GET_LOG_BY_ID: (id) => `/verp-service/birthdayEmails/logs/${id}`
};

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
  COMPANY_PRODUCT: COMPANY_PRODUCT_ROUTES,
  DESIGNATION: DESIGNATION_ROUTES,
  PROJECT: PROJECT_ROUTES,
  USER: USER_ROUTES,
  USER_EDIT: USER_EDIT_ROUTES,
  FILE_TYPE: FILE_TYPE_ROUTES,
  PAGE: PAGE_ROUTES,
  BIRTHDAY: BIRTHDAY_ROUTES
};

export default API_ROUTES;



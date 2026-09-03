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
 * 4. COMPANY PRODUCT ROUTES
 * ============================================================================
 */
export const COMPANY_PRODUCT_ROUTES = {
  VIEW: '/verp-service/companyProductCreation/view',
  GET_COMPANY_PRODUCTS: '/verp-service/companyProductCreation/view',
  ADD_COMPANY_PRODUCT: '/verp-service/companyProductCreation/companyProduct',
  COMPANY_PRODUCT: '/verp-service/companyProductCreation/companyProduct',
  DROPDOWN_OR_ADD: '/verp-service/companyProductCreation/companyProduct',
  EDIT_COMPANY_PRODUCT: '/verp-service/companyProductCreation/editcompanyproduct',
  UPDATE_COMPANY_PRODUCT: '/verp-service/companyProductCreation/editcompanyproduct',
  DELETE_COMPANY_PRODUCT: '/verp-service/companyProductCreation/deleteCompanyProduct',
  UPDATE_STATUS: '/verp-service/companyProductCreation/updateCompanyProductstatus',
  TOGGLE_STATUS: '/verp-service/companyProductCreation/updateCompanyProductstatus'
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
  TOGGLE_PROJECT_STATUS: '/verp-service/projectCreation/editproject/toggleProjectStatus',
  TOGGLE_STATUS: '/verp-service/projectCreation/editproject/toggleProjectStatus',
  DELETE_PROJECT: '/verp-service/projectCreation/deleteProject',
  DELETE: '/verp-service/projectCreation/deleteProject'
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
  COMPANY_PRODUCT: COMPANY_PRODUCT_ROUTES,
  COMPANY: COMPANY_ROUTES,
  DESIGNATION: DESIGNATION_ROUTES,
  PROJECT: PROJECT_ROUTES
};

export default API_ROUTES;

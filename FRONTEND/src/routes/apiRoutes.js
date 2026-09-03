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
  UPDATE_ROLE: '/verp-service/roleCreation/updateRole',
  UPDATE_ROLE_STATUS: '/verp-service/roleCreation/updateRoleStatus',
  DELETE_ROLE: '/verp-service/roleCreation/deleteRole'
};

/**
 * ============================================================================
 * API ENDPOINTS AGGREGATOR
 * ============================================================================
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ROLE: ROLE_ROUTES
};

export default API_ROUTES;

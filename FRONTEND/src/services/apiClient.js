import axios from 'axios';
import { BASE_URL } from '../routes/apiRoutes';
import { useERPStore } from '../store/useERPStore';

/**
 * Axios instance with Base URL configuration and interceptors
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isHandlingSessionExpiry = false;

/**
 * Request Interceptor: Attach JWT Token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    let token = null;
    const sessionStr = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (sessionStr) {
      try {
        const sessionObj = JSON.parse(sessionStr);
        token = sessionObj?.token?.accessToken;
      } catch (e) {
        // ignore parse error
      }
    }
    if (!token) {
      token = localStorage.getItem('erp_token') || sessionStorage.getItem('erp_token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CompanyId from active session to outgoing payloads across all screens/APIs
    const sessionCompanyId = (() => {
      try {
        const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
        if (raw) {
          const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const active = s?.data?.context?.activeCompany || s?.context?.activeCompany;
          const activeId = active?.CompanyId ?? active?.companyId ?? active?.id;
          if (activeId !== undefined && activeId !== null && activeId !== '') return Number(activeId);

          const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
          if (Array.isArray(comps) && comps.length > 0) {
            const cId = comps[0]?.CompanyId ?? comps[0]?.CompanyMasterId ?? comps[0]?.companyId ?? comps[0]?.id;
            if (cId !== undefined && cId !== null && cId !== '') return Number(cId);
          }

          const u = s?.data?.user || s?.user;
          const uCid = u?.CompanyId ?? u?.companyId ?? u?.CompanyMasterId;
          if (uCid !== undefined && uCid !== null && uCid !== '') return Number(uCid);
        }
      } catch {}
      return null;
    })();

    const isAuthUrl = config.url && (config.url.includes('/login') || config.url.includes('/auth/'));
    if (!isAuthUrl && sessionCompanyId && config.data) {
      if (config.data instanceof FormData) {
        if (!config.data.has('CompanyId') && !config.data.has('companyId')) {
          config.data.append('CompanyId', String(sessionCompanyId));
        }
      } else if (typeof config.data === 'object' && config.data !== null) {
        if (config.data.CompanyId === undefined && config.data.companyId === undefined) {
          config.data.CompanyId = sessionCompanyId;
        }
      }
    }

    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Extract data and handle success/error messages gracefully
 */
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    const config = response.config || {};

    // Automatically detect successful actions and display backend message
    if (data && typeof data === 'object') {
      const message = data.message || data.msg;
      const isSuccess =
        data.status === 'success' ||
        data.success === true ||
        (response.status >= 200 && response.status < 300 && data.status !== 'error' && data.success !== false);

      if (isSuccess && message && typeof message === 'string') {
        const lowerMsg = message.toLowerCase();
        // Skip routine read/fetch/dropdown messages from popping up
        const isFetchMessage =
          lowerMsg.includes('fetched') ||
          lowerMsg.includes('retrieved') ||
          lowerMsg.includes('dropdown') ||
          lowerMsg.includes('loaded') ||
          lowerMsg.includes('found');

        const method = (config.method || 'get').toLowerCase();
        let isAction = method === 'put' || method === 'delete' || method === 'patch';

        if (method === 'post') {
          let flagId = null;
          try {
            if (config.data) {
              const parsedBody = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
              if (parsedBody && parsedBody.flagId !== undefined) {
                flagId = Number(parsedBody.flagId);
              }
            }
          } catch (e) {
            // FormData or binary
          }

          // flagId > 1 signifies an action in this ERP (add=2, update=3, status=4, delete=5)
          if (flagId && flagId > 1) {
            isAction = true;
          } else if (config.url) {
            const url = config.url.toLowerCase();
            const actionKeywords = [
              'add', 'create', 'update', 'edit', 'delete', 'toggle', 'status', 'save', 'submit', 'approve', 'reject'
            ];
            if (actionKeywords.some((kw) => url.includes(kw))) {
              isAction = true;
            }
          }
        }

        if (config.showSuccessToast === true) isAction = true;
        if (config.showSuccessToast === false) isAction = false;

        if (isAction && !isFetchMessage) {
          try {
            useERPStore.getState().showToast(message, 'success');
          } catch (e) {
            // ignore
          }
        }
      }
    }

    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const responseData = error.response ? error.response.data : null;
    const message = responseData?.message || responseData?.error || error.message || 'An unexpected error occurred';

    // Handle token expiration or unauthorized access
    if (status === 401) {
      // If token expired or invalid (not during login endpoint itself)
      const isLoginRequest = error.config?.url?.includes('/login');
      if (!isLoginRequest) {
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');

        try {
          useERPStore.getState().logout();
        } catch (e) {
          // ignore
        }

        if (!isHandlingSessionExpiry) {
          isHandlingSessionExpiry = true;
          try {
            useERPStore.getState().showToast('Your session has expired. Please log in again.', 'warning');
          } catch (e) {
            // ignore
          }

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/pages/auth/')) {
            setTimeout(() => {
              window.location.href = '/pages/auth/login';
            }, 300);
          }

          setTimeout(() => {
            isHandlingSessionExpiry = false;
          }, 3000);
        }
      }
    } else {
      // Display error toast for failed API actions (excluding login which has dedicated inline alert)
      const isLoginRequest = error.config?.url?.includes('/login');
      if (!isLoginRequest && message) {
        try {
          useERPStore.getState().showToast(message, 'error');
        } catch (e) {
          // ignore
        }
      }
    }

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.data = responseData;
    enhancedError.rawError = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;

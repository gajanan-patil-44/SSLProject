// src/services/authService.js
import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

export const purgeStorage = () => {
  try {
    if (typeof window === 'undefined') return;
    const allowedKeys = new Set(['session', 'erp_theme', 'erp_sidebar_collapsed', 'erp_lang', 'remembered_credentials', 'UserLoginDetailId']);
    if (window.localStorage) {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !allowedKeys.has(key)) toRemove.push(key);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    }
    if (window.sessionStorage) {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !allowedKeys.has(key)) toRemove.push(key);
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch {}
};

export const authService = {
  /**
   * Helper to get parsed session from storage
   */
  getSession: () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * User login with username and password
   * Stores ONLY the unified login response object
   * @param {string} username 
   * @param {string} password 
   */
  login: async (username, password) => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, {
      username: username?.trim(),
      password: password
    });

    if (response?.success && response?.token?.accessToken) {
      // Purge all legacy and mock keys from storage
      purgeStorage();

      // Store ONLY the unified login response object
      localStorage.setItem('session', JSON.stringify(response));

      // Hit login detail API
      try {
        const userId = response.data?.user?.id || response.data?.user?.UserId || 0;
        if (userId) {
          let ip = "";
          try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            ip = ipData.ip || "";
          } catch (e) {}

          let lat = null, lng = null, acc = null;
          try {
            if (navigator.geolocation) {
              const geo = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
              });
              lat = geo.coords.latitude;
              lng = geo.coords.longitude;
              acc = geo.coords.accuracy;
            }
          } catch(e) {}

          const ua = navigator.userAgent;
          let bName = "", bVer = "";
          if (/firefox/i.test(ua)) { bName = "Firefox"; bVer = ua.match(/Firefox\/([0-9.]+)/)?.[1]; }
          else if (/edg/i.test(ua)) { bName = "Edge"; bVer = ua.match(/Edg\/([0-9.]+)/)?.[1]; }
          else if (/chrome/i.test(ua)) { bName = "Chrome"; bVer = ua.match(/Chrome\/([0-9.]+)/)?.[1]; }
          else if (/safari/i.test(ua)) { bName = "Safari"; bVer = ua.match(/Version\/([0-9.]+)/)?.[1]; }

          let osName = "", osVer = "";
          if (/windows/i.test(ua)) { osName = "Windows"; osVer = ua.match(/Windows NT ([0-9.]+)/)?.[1]; }
          else if (/mac os/i.test(ua)) { osName = "Mac OS"; osVer = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.'); }
          else if (/android/i.test(ua)) { osName = "Android"; osVer = ua.match(/Android ([0-9.]+)/)?.[1]; }
          else if (/linux/i.test(ua)) { osName = "Linux"; }
          else if (/iphone|ipad|ios/i.test(ua)) { osName = "iOS"; osVer = ua.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.'); }

          let dType = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
          let dName = dType;
          if (/iphone/i.test(ua)) dName = "iPhone";
          else if (/ipad/i.test(ua)) dName = "iPad";

          const detailPayload = {
            FlagId: 1,
            UserId: Number(userId),
            PublicIPAddress: ip,
            HostName: window.location.hostname || "",
            SystemName: navigator.platform || "",
            OperatingSystem: osName || "",
            OSVersion: osVer || "",
            BrowserName: bName || "",
            BrowserVersion: bVer || "",
            UserAgent: navigator.userAgent || "",
            DeviceType: dType,
            DeviceName: dName,
            Latitude: lat,
            Longitude: lng,
            LocationAccuracy: acc,
            NetworkType: navigator.connection?.effectiveType || "",
            ApplicationName: "BOMS",
            ApplicationVersion: "1.0.0"
          };
          const detailResp = await apiClient.post(API_ROUTES.AUTH.LOGIN_DETAIL, detailPayload);
          const detailId = detailResp?.data?.UserLoginDetailId || detailResp?.UserLoginDetailId || (detailResp?.value && detailResp.value[0]?.UserLoginDetailId) || detailResp?.value?.UserLoginDetailId;
          if (detailId) {
            localStorage.setItem('UserLoginDetailId', detailId);
          }
        }
      } catch (err) {
        // ignore login detail errors
      }
    }

    return response;
  },

  /**
   * Logout user and clear stored auth credentials
   */
  logout: async () => {
    const session = authService.getSession();
    const userId = session?.data?.user?.id || session?.data?.user?.UserId;
    const loginDetailId = localStorage.getItem('UserLoginDetailId');

    if (userId && loginDetailId) {
      try {
        await apiClient.post(API_ROUTES.AUTH.LOGIN_DETAIL, {
          FlagId: 2,
          UserLoginDetailId: Number(loginDetailId),
          UserId: Number(userId),
          LogoutReason: "User Logout"
        });
      } catch (err) {
        // ignore logout detail errors
      }
    }

    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    localStorage.removeItem('UserLoginDetailId');
    purgeStorage();
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: () => {
    const session = authService.getSession();
    return Boolean(session?.token?.accessToken);
  },

  /**
   * Retrieve active stored JWT token
   */
  getToken: () => {
    const session = authService.getSession();
    return session?.token?.accessToken || null;
  },

  /**
   * Retrieve active user data
   */
  getCurrentUser: () => {
    const session = authService.getSession();
    return session?.data?.user || null;
  },

  /**
   * Retrieve current user context (companies, products, projects, roles)
   */
  getUserContext: () => {
    const session = authService.getSession();
    return session?.data?.context || null;
  }
};

export default authService;


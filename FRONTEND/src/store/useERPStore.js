// src/store/useERPStore.js
import { create } from 'zustand';

// Helper to check if a JWT token has expired
const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
};

// Safe parse helper for session
const safeParseSession = () => {
  try {
    const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = parsed?.token?.accessToken || localStorage.getItem('erp_token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('session');
      sessionStorage.removeItem('session');
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const initialSession = safeParseSession();
const initialUser = initialSession?.data?.user;
const initialContext = initialSession?.data?.context;
const initialToken = initialSession?.token?.accessToken || null;
const initialPhoto = initialSession?.photo || null;
const initialSessionMeta = initialSession?.session || null;

let initialDisplayName = 'User';
if (initialUser?.name) {
  if (typeof initialUser.name === 'string') {
    initialDisplayName = initialUser.name;
  } else if (typeof initialUser.name === 'object') {
    initialDisplayName = [initialUser.name.first, initialUser.name.middle, initialUser.name.last].filter(Boolean).join(' ') || initialUser.loginName || 'User';
  }
} else if (initialUser?.loginName) {
  initialDisplayName = initialUser.loginName;
}

const initialDisplayRole = initialUser?.designation?.name || initialContext?.roles?.[0]?.RoleName || 'Administrator';
const initialAvatarUrl = initialPhoto ? (initialPhoto.startsWith('data:') ? initialPhoto : `data:image/jpeg;base64,${initialPhoto}`) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';

const normalizedInitialUser = initialUser ? {
  ...initialUser,
  name: initialDisplayName,
  role: initialDisplayRole,
  email: initialUser?.email || '',
  avatar: initialAvatarUrl
} : null;

const firstCompany = initialContext?.companies?.[0]?.name || '';

const initialMenu = initialSession?.data?.userMenu || initialSession?.data?.menu || initialSession?.userMenu || null;

export const useERPStore = create((set) => ({
  theme: localStorage.getItem('erp_theme') || 'light',
  sidebarOpen: false,
  sidebarCollapsed: localStorage.getItem('erp_sidebar_collapsed') === 'true',
  activeCompany: firstCompany,
  language: localStorage.getItem('erp_lang') || 'EN',
  
  // Auth state - initialized from unified 'session' object
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  user: normalizedInitialUser,
  userContext: initialContext || null,
  userMenu: initialMenu,
  session: initialSessionMeta,
  userPhoto: initialPhoto,

  setUserMenu: (menu) => set({ userMenu: menu }),

  setAuthData: ({ token, user, context, session, photo, rawResponse, userMenu }) => {
    let displayName = 'User';
    if (user?.name) {
      if (typeof user.name === 'string') {
        displayName = user.name;
      } else if (typeof user.name === 'object') {
        displayName = [user.name.first, user.name.middle, user.name.last].filter(Boolean).join(' ') || user.loginName || 'User';
      }
    } else if (user?.loginName) {
      displayName = user.loginName;
    }

    const displayRole = user?.designation?.name || context?.roles?.[0]?.RoleName || 'Administrator';
    const avatarUrl = photo ? (photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`) : (user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80');

    const normalizedUser = {
      ...user,
      name: displayName,
      role: displayRole,
      email: user?.email || '',
      avatar: avatarUrl
    };

    const firstCompanyName = context?.companies?.[0]?.name || 'Falcon LLP';
    const dynamicMenu = userMenu || rawResponse?.data?.userMenu || rawResponse?.data?.menu || rawResponse?.userMenu || null;

    // Purge any legacy individual storage items
    const legacyKeys = [
      'erp_token',
      'erp_user',
      'erp_user_context',
      'erp_session',
      'erp_photo',
      'erp_company'
    ];
    legacyKeys.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    if (rawResponse) {
      localStorage.setItem('session', JSON.stringify(rawResponse));
    }

    set({
      token: token || null,
      isAuthenticated: Boolean(token),
      user: normalizedUser,
      userContext: context || null,
      userMenu: dynamicMenu,
      session: session || null,
      userPhoto: photo || null,
      activeCompany: firstCompanyName
    });
  },

  logout: () => {
    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    const legacyKeys = [
      'erp_token',
      'erp_user',
      'erp_user_context',
      'erp_session',
      'erp_photo',
      'erp_company'
    ];
    legacyKeys.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    set({
      token: null,
      isAuthenticated: false,
      user: null,
      userContext: null,
      userMenu: null,
      session: null,
      userPhoto: null,
      activeCompany: ''
    });
  },

  toasts: [],
  showToast: (message, type = 'success', title = null) => {
    if (!message || typeof message !== 'string') return;
    const cleanMsg = message.trim();
    if (!cleanMsg) return;

    const now = Date.now();
    const currentToasts = useERPStore.getState().toasts || [];
    
    // Ignore duplicate triggers for the same message within 2 seconds
    const isDuplicate = currentToasts.some(
      (t) => t.message === cleanMsg && (now - (t.createdAt || 0)) < 2000
    );
    if (isDuplicate) return;

    const id = now + Math.random();
    // Only 1 single active card at any time in the center of the screen!
    set({
      toasts: [{ id, message: cleanMsg, type, title, createdAt: now }]
    });
  },
  removeToast: (id) => set((state) => ({ toasts: (state.toasts || []).filter(t => t.id !== id) })),
  notifications: [
    { id: 1, text: "New leave request from Evelyn Hayes", time: "5m ago", type: "leave", read: false },
    { id: 2, text: "Low stock alert: Product 'iPhone 15 Pro' is low", time: "15m ago", type: "stock", read: false },
    { id: 3, text: "New support ticket #TC-8291 created", time: "1h ago", type: "ticket", read: false },
    { id: 4, text: "Payment of $1,248.00 received from client", time: "2h ago", type: "payment", read: true },
    { id: 5, text: "Interview scheduled with candidate Regina Bryant", time: "3h ago", type: "interview", read: true }
  ],
  setTheme: (theme) => {
    localStorage.setItem('erp_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => {
    const collapsed = !state.sidebarCollapsed;
    localStorage.setItem('erp_sidebar_collapsed', String(collapsed));
    return { sidebarCollapsed: collapsed };
  }),
  setActiveCompany: (company) => {
    set({ activeCompany: company });
  },
  setLanguage: (language) => {
    localStorage.setItem('erp_lang', language);
    set({ language });
  },
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
  addNotification: (noti) => set((state) => ({
    notifications: [
      { id: Date.now(), read: false, time: "Just now", ...noti },
      ...state.notifications
    ]
  }))
}));

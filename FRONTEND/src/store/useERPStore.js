// src/store/useERPStore.js
import { create } from 'zustand';

// Safe parse helper for session
const safeParseSession = () => {
  try {
    const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
    return raw ? JSON.parse(raw) : null;
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
  session: initialSessionMeta,
  userPhoto: initialPhoto,

  setAuthData: ({ token, user, context, session, photo, rawResponse }) => {
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
      session: null,
      userPhoto: null,
      activeCompany: ''
    });
  },

  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
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

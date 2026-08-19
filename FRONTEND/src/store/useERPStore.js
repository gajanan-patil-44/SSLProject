// src/store/useERPStore.js
import { create } from 'zustand';

export const useERPStore = create((set) => ({
  theme: localStorage.getItem('erp_theme') || 'light',
  sidebarOpen: false,
  sidebarCollapsed: localStorage.getItem('erp_sidebar_collapsed') === 'true',
  activeCompany: localStorage.getItem('erp_company') || 'Falcon LLP',
  language: localStorage.getItem('erp_lang') || 'EN',
  user: {
    name: 'Andrew',
    role: 'Administrator',
    email: 'andrew@vishvin-erp.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
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
    localStorage.setItem('erp_company', company);
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

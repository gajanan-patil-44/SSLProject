import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useERPStore } from '../../store/useERPStore';
import ToastContainer from '../ui/Toast';
import { isRouteAllowed } from '../../utils/permissionGuard';

export default function AppLayout() {
  const { pathname } = useLocation();
  const theme = useERPStore((state) => state.theme);
  const isAuthenticated = useERPStore((state) => state.isAuthenticated);
  const user = useERPStore((state) => state.user);
  const userContext = useERPStore((state) => state.userContext);
  const userMenu = useERPStore((state) => state.userMenu);
  const showToast = useERPStore((state) => state.showToast);
  const mainContentRef = useRef(null);
  const lastDeniedRef = useRef(null);

  // Directly retrieve session menu as fallback to eliminate any store sync delay
  const sessionMenu = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data?.menuPage || parsed?.menuPage || parsed?.data?.userMenu || parsed?.userMenu || null;
    } catch {
      return null;
    }
  }, []);

  const activeMenu = Array.isArray(userMenu) && userMenu.length > 0
    ? userMenu
    : (Array.isArray(sessionMenu) ? sessionMenu : []);

  // Determine if it is a full-page view (like login, signup, errors)
  const isAuthOrErrorPage = pathname.includes('/pages/auth/') || pathname.includes('/pages/error/');

  // Permission Guard: Validate whether user is authorized to access the requested route
  const isPermitted = isAuthOrErrorPage || isRouteAllowed(pathname, activeMenu, user, userContext);

  // Show notification when unauthorized URL access is blocked
  useEffect(() => {
    if (isAuthenticated && !isAuthOrErrorPage && !isPermitted) {
      if (lastDeniedRef.current !== pathname) {
        lastDeniedRef.current = pathname;
        showToast('Access Denied: You do not have permission to access this screen.', 'error');
      }
    }
  }, [pathname, isAuthenticated, isAuthOrErrorPage, isPermitted, showToast]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  // Synchronize theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (isAuthOrErrorPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  // Guard protected routes against unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/pages/auth/login" replace state={{ from: pathname }} />;
  }

  // Guard protected routes against unauthorized users (no permission for this URL)
  if (!isPermitted) {
    return <Navigate to="/pages/error/403" replace state={{ attemptedPath: pathname }} />;
  }

  return (
    <div className="relative flex h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* Ambient background glowing orbs (Vibrant colors!) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-70 dark:opacity-35">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/25 to-violet-600/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/4 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Content Shell */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Independent Scrollable Page Viewport */}
        <div ref={mainContentRef} className="flex-1 overflow-y-auto min-h-0 flex flex-col w-full">
          <main className="flex-1 p-4 md:p-7 w-full">
            <Outlet />
          </main>
        </div>

        {/* Fixed Non-scrollable Footer */}
        <footer className="relative py-3 px-6 border-t border-indigo-100/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">Vishvin ERP</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Enterprise Cloud</span>
          </div>
          <span className="font-medium text-slate-400 dark:text-slate-500">2026 © Vishvin ERP Portal. All Rights Reserved.</span>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
}

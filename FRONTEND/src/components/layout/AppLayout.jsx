import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useERPStore } from '../../store/useERPStore';
import ToastContainer from '../ui/Toast';

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useERPStore((state) => state.theme);
  const isAuthenticated = useERPStore((state) => state.isAuthenticated);
  const mainContentRef = useRef(null);

  // Determine if it is a full-page view (like login, signup, errors)
  const isAuthOrErrorPage = pathname.includes('/pages/auth/') || pathname.includes('/pages/error/');

  // Redirect to main page (/dashboard) on browser page refresh
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType('navigation');
      const isReload = navEntries && navEntries.length > 0 
        ? navEntries[0].type === 'reload' 
        : (performance.navigation && performance.navigation.type === 1);

      if (isReload && pathname !== '/dashboard' && !isAuthOrErrorPage) {
        navigate('/dashboard', { replace: true });
      }
    } catch {}
  }, []);

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

  // Guard protected routes
  if (!isAuthenticated) {
    return <Navigate to="/pages/auth/login" replace state={{ from: pathname }} />;
  }

  return (
    <div className="relative flex h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* Ambient background glowing orbs (Light & Dark) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] bg-cyan-500/15 dark:bg-violet-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/15 dark:bg-indigo-700/15 rounded-full blur-3xl"></div>
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

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-slate-200/70 dark:border-slate-800/60 text-xs text-slate-400 bg-white/60 dark:bg-[#0b0f19]/60 backdrop-blur-md mt-auto shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Vishvin ERP</span>
            </div>
            <span>2026 © Vishvin ERP Portal. All Rights Reserved.</span>
          </footer>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

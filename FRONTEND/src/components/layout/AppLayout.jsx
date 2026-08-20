// src/components/layout/AppLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useERPStore } from '../../store/useERPStore';
import ToastContainer from '../ui/Toast';


export default function AppLayout() {
  const { pathname } = useLocation();
  const theme = useERPStore((state) => state.theme);

  // Scroll to top on route change
  useEffect(() => {
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

  // Determine if it is a full-page view (like login, signup, errors)
  const isAuthOrErrorPage = pathname.includes('/pages/auth/') || pathname.includes('/pages/error/');

  if (isAuthOrErrorPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Inner Page Viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-slate-200/50 dark:border-slate-800/80 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 mt-auto shrink-0">
          <span>2026 © Vishvin ERP. All Rights Reserved.</span>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
}

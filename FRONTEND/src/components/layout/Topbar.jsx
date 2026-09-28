import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { authService } from '../../services';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { Avatar } from '../ui/index';

export default function Topbar() {
  const navigate = useNavigate();
  const theme = useERPStore((state) => state.theme);
  const setTheme = useERPStore((state) => state.setTheme);
  const toggleSidebar = useERPStore((state) => state.toggleSidebar);
  const language = useERPStore((state) => state.language);
  const setLanguage = useERPStore((state) => state.setLanguage);
  const user = useERPStore((state) => state.user);
  const logout = useERPStore((state) => state.logout);
  const notifications = useERPStore((state) => state.notifications);
  const markNotificationRead = useERPStore((state) => state.markNotificationRead);
  const clearNotifications = useERPStore((state) => state.clearNotifications);

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/pages/auth/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between px-5 md:px-7 transition-colors shrink-0">
      {/* Mobile Toggle & Left Search Pill */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-slate-400 text-xs hover:border-indigo-400/50 dark:hover:border-indigo-500/40 cursor-pointer transition-all w-56 md:w-64">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-slate-400 font-medium">Search modules...</span>
        </div>
      </div>

      {/* Right Icons Panel */}
      <div className="flex items-center gap-1.5">
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 cursor-pointer transition-all duration-200"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4.5 h-4.5 transition-transform hover:-rotate-12" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform hover:rotate-45" />
          )}
        </button>

        {/* Language Selector */}
        <Dropdown
          trigger={
            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer transition-colors" title="Language">
              <Globe className="w-4.5 h-4.5" />
            </button>
          }
        >
          <DropdownItem onClick={() => setLanguage('EN')}>English (US)</DropdownItem>
          <DropdownItem onClick={() => setLanguage('ES')}>Español</DropdownItem>
          <DropdownItem onClick={() => setLanguage('FR')}>Français</DropdownItem>
          <DropdownItem onClick={() => setLanguage('DE')}>Deutsch</DropdownItem>
        </Dropdown>

        {/* Notifications Dropdown */}
        <Dropdown
          widthClass="w-80"
          trigger={
            <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer transition-colors" title="Notifications">
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-[#0b0f19]"></span>
                </span>
              )}
            </button>
          }
        >
          <div className="text-xs">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                {unreadNotifications.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {unreadNotifications.length}
                  </span>
                )}
              </div>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-400">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.type === 'leave') navigate('/hrm/leave');
                      if (n.type === 'stock') navigate('/inventory/products');
                      if (n.type === 'ticket') navigate('/support/tickets');
                    }}
                    className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex gap-2.5 items-start ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'stock' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className={`text-[11px] leading-relaxed text-slate-700 dark:text-slate-400 ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                        {n.text}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dropdown>

        <div className="w-px h-5 bg-slate-200 dark:border-slate-800 mx-1.5"></div>

        {/* User Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 py-1 px-2 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <div className="relative">
                <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" className="ring-2 ring-indigo-500/30" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900"></span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'User'}</span>
                <span className="text-[10px] font-medium text-slate-400 leading-none">{user?.role || ''}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          }
        >
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-col">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-400">{user?.email || ''}</span>
          </div>
          <DropdownItem icon={User} onClick={() => navigate('/hrm/employees')}>Profile</DropdownItem>
          <DropdownItem icon={Settings} onClick={() => navigate('/system/settings')}>My Account</DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

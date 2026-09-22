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
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { authService } from '../../services';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { Avatar } from '../ui/index';
import logo from '../../assets/vite.svg';

export default function Topbar() {
  const navigate = useNavigate();
  const theme = useERPStore((state) => state.theme);
  const setTheme = useERPStore((state) => state.setTheme);
  const toggleSidebar = useERPStore((state) => state.toggleSidebar);
  const activeCompany = useERPStore((state) => state.activeCompany);
  const setActiveCompany = useERPStore((state) => state.setActiveCompany);
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
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-5">
      {/* Mobile Toggle & Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Topbar Logo - Click to refresh site and navigate to main page */}
        <button
          type="button"
          onClick={() => {
            window.location.href = '/dashboard';
          }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
          title="Refresh & Go to Main Page"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500/20 to-emerald-500/10 dark:from-teal-500/30 dark:to-emerald-500/20 flex items-center justify-center p-1 shrink-0 border border-teal-500/30 shadow-xs group-hover:scale-105 transition-transform">
            <img src={logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-xs" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 hidden sm:inline-block tracking-tight">
            Vishvin ERP
          </span>
        </button>

        {/* Company Selector */}
        <Dropdown
          align="left"
          trigger={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{activeCompany}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => setActiveCompany('Falcon LLP')}>Falcon LLP</DropdownItem>
          <DropdownItem onClick={() => setActiveCompany('Vishvin Corp')}>Vishvin Corp</DropdownItem>
          <DropdownItem onClick={() => setActiveCompany('Global Inc')}>Global Inc</DropdownItem>
        </Dropdown>
      </div>

      {/* Right Icons Panel */}
      <div className="flex items-center gap-1">
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer transition-colors"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
        </button>

        {/* Language Selector */}
        <Dropdown
          trigger={
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-800 cursor-pointer transition-colors" title="Language">
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
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-800 cursor-pointer transition-colors" title="Notifications">
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          }
        >
          <div className="text-xs">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <span className="font-bold text-slate-800 dark:text-slate-200">Notifications</span>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-[10px] text-secondary hover:underline cursor-pointer font-bold"
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
                    className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex gap-2.5 items-start ${!n.read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'stock' ? (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-secondary" />
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

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2"></div>

        {/* User Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-colors">
              <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'User'}</span>
                <span className="text-[10px] text-slate-400 leading-none">{user?.role || ''}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex flex-col">
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

// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { navigationConfig } from '../../config/navigation';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Tooltip } from '../ui/index';
import logo from '../../assets/vite.svg';

export default function Sidebar() {
  const location = useLocation();
  const sidebarCollapsed = useERPStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useERPStore((state) => state.toggleSidebarCollapsed);
  const sidebarOpen = useERPStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERPStore((state) => state.setSidebarOpen);
  
  // Track open nested menus
  const [openMenus, setOpenMenus] = useState({});

  const toggleSubmenu = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderIcon = (iconName, className = "w-4 h-4 shrink-0") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp className={className} />;
  };

  const isItemActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-300">
      {/* Brand Logo Header */}
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4.5'} h-18 border-b border-slate-200 dark:border-slate-800 shrink-0`}>
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="group relative w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/10 dark:from-teal-500/30 dark:to-emerald-500/20 flex items-center justify-center p-1.5 shrink-0 border border-teal-500/30 shadow-sm shadow-teal-500/10 cursor-pointer hover:scale-105 hover:border-teal-500 transition-all"
            title="Click to Expand Sidebar"
          >
            <img src={logo} alt="Vishvin ERP Logo" className="w-full h-full object-contain filter drop-shadow-sm group-hover:opacity-30 transition-opacity" />
            <PanelLeft className="w-5 h-5 text-teal-700 dark:text-teal-400 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {/* Logo Icon */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/10 dark:from-teal-500/30 dark:to-emerald-500/20 flex items-center justify-center p-1.5 shrink-0 border border-teal-500/30 shadow-sm shadow-teal-500/10">
                <img src={logo} alt="Vishvin ERP Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                  Vishvin ERP
                </span>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                  Enterprise Cloud
                </span>
              </div>
            </div>
            
            {/* Toggle Collapse Button on Desktop */}
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navigationConfig.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            {/* Section Title */}
            {!sidebarCollapsed ? (
              <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
                {section.title}
              </h5>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-800/80 my-2 mx-1"></div>
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item, iIdx) => {
                const hasChildren = item.children && item.children.length > 0;
                const active = isItemActive(item);
                const isOpen = openMenus[item.label] || active;

                const linkClass = (isActive) => `
                  flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group cursor-pointer
                  ${isActive 
                    ? 'bg-primary dark:bg-slate-800 text-white font-bold shadow-xs' 
                    : 'text-slate-705 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                `;

                // If collapsed, use tooltips
                const ItemLink = (
                  <div className="relative">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full ${linkClass(active)}`}
                      >
                        <div className="flex items-center gap-2.5">
                          {renderIcon(item.icon, `w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-slate-405 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`)}
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && (
                          isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => linkClass(isActive)}
                      >
                        <div className="flex items-center gap-2.5">
                          {renderIcon(item.icon, `w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-slate-405 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`)}
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && item.badge && (
                          <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-bold ${active ? 'bg-white/20 text-white' : 'bg-secondary/10 text-secondary'}`}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )}
                  </div>
                );

                return (
                  <div key={iIdx} className="space-y-0.5">
                    {sidebarCollapsed ? (
                      <Tooltip content={item.label} position="right">
                        {ItemLink}
                      </Tooltip>
                    ) : (
                      ItemLink
                    )}

                    {/* Submenu Children */}
                    {hasChildren && isOpen && !sidebarCollapsed && (
                      <div className="pl-9 space-y-0.5 border-l border-slate-100 dark:border-slate-800 ml-5 py-1">
                        {item.children.map((child, cIdx) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <NavLink
                              key={cIdx}
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center justify-between py-1.5 px-3 rounded-md text-[11px] font-semibold transition-all duration-100 cursor-pointer
                                ${childActive
                                  ? 'text-secondary font-bold'
                                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                              `}
                            >
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className={`
        hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-200 ease-in-out z-20
        ${sidebarCollapsed ? 'w-[70px]' : 'w-[230px]'}
      `}>
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        ></div>
      )}

      {/* Mobile Sidebar Slide-out Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-[230px] h-full z-45 transform transition-transform duration-250 ease-in-out md:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {SidebarContent}
      </aside>
    </>
  );
}

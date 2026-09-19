
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { navigationConfig } from '../../config/navigation';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Tooltip } from '../ui/index';
import logo from '../../assets/vite.svg';

// Robust icon alias mapping for backend icon names
const ICON_MAP = {
  dashboard: Icons.LayoutDashboard,
  'layout-dashboard': Icons.LayoutDashboard,
  layoutdashboard: Icons.LayoutDashboard,
  admin: Icons.ShieldCheck,
  billing: Icons.Receipt,
  settings: Icons.Settings,
  'user-management': Icons.Users,
  usermanagement: Icons.Users,
  'user_management': Icons.Users,
  user: Icons.User,
  users: Icons.Users,
  'user-creation': Icons.UserPlus,
  usercreation: Icons.UserPlus,
  userplus: Icons.UserPlus,
  reports: Icons.BarChart3,
  report: Icons.BarChart3,
  barchart: Icons.BarChart3,
  products: Icons.Package,
  product: Icons.Package,
  package: Icons.Package,
  companies: Icons.Building2,
  company: Icons.Building2,
  building: Icons.Building2,
  'company-products': Icons.Boxes,
  companyproducts: Icons.Boxes,
  boxes: Icons.Boxes,
  projects: Icons.FolderKanban,
  project: Icons.FolderKanban,
  folder: Icons.Folder,
  designations: Icons.Briefcase,
  designation: Icons.Briefcase,
  roles: Icons.Shield,
  role: Icons.Shield,
  'manage-page': Icons.Layers,
  managepage: Icons.Layers,
  layers: Icons.Layers,
};

const resolveIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return Icons.Layers;
  const clean = iconName.trim().toLowerCase();
  if (ICON_MAP[clean]) return ICON_MAP[clean];
  if (Icons[iconName]) return Icons[iconName];

  // Try PascalCase: e.g. "layout-dashboard" -> "LayoutDashboard"
  const pascal = iconName
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
  if (Icons[pascal]) return Icons[pascal];

  return Icons.Layers;
};

const renderIcon = (iconName, className = "w-4 h-4 shrink-0") => {
  const IconComp = resolveIcon(iconName);
  return <IconComp className={className} />;
};

// Title Case formatter (e.g. "company products" -> "Company Products")
const formatTitle = (str) => {
  if (!str) return '';
  return str
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// Recursively format page items from API menuPage
const formatPageNode = (page) => {
  const rawName = page.PageName || page.name || page.label || '';
  const rawUrl = page.PageUrl || page.url || page.path || '';
  const rawIcon = page.PageIcon || page.icon || page.IconName || '';
  const order = Number(page.OrderNo ?? page.order ?? 0);

  const children = Array.isArray(page.children)
    ? page.children.map(formatPageNode).sort((a, b) => a.order - b.order)
    : [];

  return {
    id: page.PageId || page.id || rawUrl,
    label: formatTitle(rawName),
    path: rawUrl,
    icon: rawIcon,
    order: order,
    children: children
  };
};

// Normalize menu into sections with title & items
const normalizeNavigation = (menuData) => {
  if (!Array.isArray(menuData) || menuData.length === 0) {
    return navigationConfig;
  }

  // Already section-based configuration (e.g. navigationConfig format)
  if (menuData[0]?.title && Array.isArray(menuData[0]?.items)) {
    return menuData;
  }

  // Raw page array from backend menuPage
  const formattedItems = menuData
    .map(formatPageNode)
    .sort((a, b) => a.order - b.order);

  // Group top-level items by module extracted from URL (e.g. /master/companies -> MASTER)
  const sectionsMap = new Map();

  formattedItems.forEach(item => {
    let sectionTitle = 'MENU';
    if (item.path && item.path.startsWith('/')) {
      const segment = item.path.split('/')[1];
      if (segment && segment.toLowerCase() !== 'dashboard') {
        sectionTitle = segment.toUpperCase();
      }
    }
    if (!sectionsMap.has(sectionTitle)) {
      sectionsMap.set(sectionTitle, []);
    }
    sectionsMap.get(sectionTitle).push(item);
  });

  const sections = [];

  // Check if Dashboard is already present in any branch
  const hasDashboard = (items) => items.some(it => 
    it.path === '/dashboard' || (it.children && hasDashboard(it.children))
  );

  if (!hasDashboard(formattedItems)) {
    sections.push({
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/dashboard',
          children: []
        }
      ]
    });
  }

  sectionsMap.forEach((items, title) => {
    sections.push({
      title,
      items
    });
  });

  return sections;
};

// Check if current item or any of its descendants is active
const isItemOrChildActive = (item, currentPath) => {
  if (item.path && item.path === currentPath) return true;
  if (Array.isArray(item.children) && item.children.length > 0) {
    return item.children.some(child => isItemOrChildActive(child, currentPath));
  }
  return false;
};

export default function Sidebar() {
  const location = useLocation();
  const sidebarCollapsed = useERPStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useERPStore((state) => state.toggleSidebarCollapsed);
  const sidebarOpen = useERPStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERPStore((state) => state.setSidebarOpen);
  const userMenu = useERPStore((state) => state.userMenu);
  
  // Track open nested menus
  const [openMenus, setOpenMenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sections = normalizeNavigation(userMenu);

  // Recursive menu item renderer
  const renderMenuItem = (item, level = 0, keyPrefix = '') => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isDirectActive = location.pathname === item.path;
    const isBranchActive = isItemOrChildActive(item, location.pathname);
    const itemKey = item.id ? String(item.id) : (item.path || item.label || keyPrefix);
    
    // Automatically open branch if active, or use toggle state
    const isOpen = openMenus[itemKey] !== undefined ? openMenus[itemKey] : isBranchActive;

    const paddingLeft = level === 0 ? 'px-3' : level === 1 ? 'pl-2.5 pr-2' : 'pl-2 pr-2';
    const fontSize = level === 0 ? 'text-xs' : 'text-[11.5px]';

    const linkClass = (isActive) => `
      flex items-center justify-between ${paddingLeft} py-2 rounded-lg ${fontSize} font-semibold transition-all duration-150 group cursor-pointer w-full
      ${isActive
        ? 'bg-primary dark:bg-slate-800 text-white font-bold shadow-xs'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'}
    `;

    const rowContent = (
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {renderIcon(
          item.icon,
          `${level === 0 ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'} shrink-0 ${
            isDirectActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
          }`
        )}
        {!sidebarCollapsed && (
          <span className="truncate">{item.label}</span>
        )}
      </div>
    );

    return (
      <div key={itemKey} className="space-y-0.5">
        {sidebarCollapsed ? (
          <Tooltip content={item.label} position="right">
            {item.path ? (
              <NavLink
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={linkClass(isDirectActive)}
              >
                {rowContent}
              </NavLink>
            ) : (
              <div className={linkClass(isDirectActive)}>
                {rowContent}
              </div>
            )}
          </Tooltip>
        ) : (
          <div className="relative flex items-center">
            {item.path ? (
              <NavLink
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                  if (hasChildren) {
                    setOpenMenus(prev => ({ ...prev, [itemKey]: true }));
                  }
                }}
                className={linkClass(isDirectActive)}
              >
                {rowContent}
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-bold mr-1 ${
                    isDirectActive ? 'bg-white/20 text-white' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={() => toggleSubmenu(itemKey)}
                className={linkClass(isDirectActive)}
              >
                {rowContent}
              </button>
            )}

            {/* Submenu toggle button when children exist */}
            {hasChildren && !sidebarCollapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSubmenu(itemKey);
                }}
                className={`p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors ml-0.5 ${
                  isDirectActive ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Recursive child list */}
        {hasChildren && isOpen && !sidebarCollapsed && (
          <div className="pl-3.5 ml-4 border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-0.5 mt-0.5">
            {item.children.map((child, idx) =>
              renderMenuItem(child, level + 1, `${itemKey}-${idx}`)
            )}
          </div>
        )}
      </div>
    );
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
        {sections.map((section, sIdx) => (
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
              {section.items.map((item, iIdx) => renderMenuItem(item, 0, `s${sIdx}-i${iIdx}`))}
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

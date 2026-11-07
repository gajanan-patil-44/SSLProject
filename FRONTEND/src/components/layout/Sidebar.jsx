
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeft, ShieldAlert } from 'lucide-react';
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
  'manage-users': Icons.Users,
  'manage-user': Icons.Users,
  manageusers: Icons.Users,
  manageuser: Icons.Users,
  reports: Icons.BarChart3,
  report: Icons.BarChart3,
  barchart: Icons.BarChart3,
  products: Icons.Package,
  product: Icons.Package,
  package: Icons.Package,
  companies: Icons.Building2,
  company: Icons.Building2,
  building: Icons.Building2,
  'company-master': Icons.Building2,
  'companymaster': Icons.Building2,
  'company-products': Icons.Boxes,
  companyproducts: Icons.Boxes,
  boxes: Icons.Boxes,
  projects: Icons.FolderKanban,
  project: Icons.FolderKanban,
  folder: Icons.Folder,
  designations: Icons.Briefcase,
  designation: Icons.Briefcase,
  'company-designations': Icons.Briefcase,
  'company-designation': Icons.Briefcase,
  companydesignations: Icons.Briefcase,
  companydesignation: Icons.Briefcase,
  'company-roles': Icons.ShieldCheck,
  'company-role': Icons.ShieldCheck,
  companyroles: Icons.ShieldCheck,
  companyrole: Icons.ShieldCheck,
  roles: Icons.Shield,
  'manage-page': Icons.Layers,
  managepage: Icons.Layers,
  layers: Icons.Layers,
  'vendor-management': Icons.Store,
  vendormanagement: Icons.Store,
  'vendor_management': Icons.Store,
  vendors: Icons.Store,
  vendor: Icons.Store,
  store: Icons.Store,
  truck: Icons.Truck,
  'material-category': Icons.Tags,
  'materialcategory': Icons.Tags,
  'material-sub-category': Icons.Tag,
  'materialsubcategory': Icons.Tag,
  'gst-creation': Icons.Receipt,
  'gstcreation': Icons.Receipt,
  gst: Icons.Receipt,
  receipt: Icons.Receipt,
  'work-management': Icons.Briefcase,
  workmanagement: Icons.Briefcase,
  'daily-work-update': Icons.CalendarCheck2,
  'daily-update': Icons.CalendarCheck2,
  dailyworkupdate: Icons.CalendarCheck2,
  'work-history': Icons.History,
  workhistory: Icons.History,
  'assigned-tasks': Icons.CheckSquare,
  assignedtasks: Icons.CheckSquare,
  'task-assignment': Icons.UserPlus,
  taskassignment: Icons.UserPlus,
  'project-task-tracker': Icons.Kanban,
  'project-tasks': Icons.Kanban,
  projecttasktracker: Icons.Kanban,
  'team-updates': Icons.Users,
  teamupdates: Icons.Users,
  'work-update-review': Icons.ClipboardCheck,
  'review': Icons.ClipboardCheck,
  workupdatereview: Icons.ClipboardCheck,
  'organization-dashboard': Icons.LayoutDashboard,
  organizationdashboard: Icons.LayoutDashboard,
  'work-reports': Icons.BarChart3,
  'analytics': Icons.BarChart3,
  workreports: Icons.BarChart3,
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

// Recursively format page items from API menuPage
const formatPageNode = (page) => {
  const rawName = (page.PageName || page.pageName || page.name || page.label || '').trim();
  const rawUrl = (page.PageUrl || page.PageURL || page.pageUrl || page.url || page.path || '').trim();
  const rawIcon = page.PageIcon || page.pageIcon || page.icon || page.IconName || page.iconName || '';
  const order = Number(page.OrderNo ?? page.orderNo ?? page.order ?? 0);
  const parentPage = page.ParentPage || page.parentPage || null;
  const parentPageId = page.ParentPageId ?? page.parentPageId ?? null;
  const pageType = page.PageType || page.pageType || null;

  // Use the exact name provided by the backend / Manage Page without hardcoding overrides
  const label = rawName || (rawUrl ? rawUrl.split('/').filter(Boolean).pop()?.replace(/[-_]+/g, ' ') : '') || 'Untitled';

  const children = Array.isArray(page.children)
    ? page.children.map(formatPageNode).sort((a, b) => a.order - b.order)
    : [];

  return {
    id: page.PageId || page.pageId || page.id || rawUrl,
    label: label,
    path: rawUrl,
    icon: rawIcon,
    order: order,
    parentPage: parentPage,
    parentPageId: parentPageId,
    pageType: pageType,
    children: children,
    raw: page
  };
};

// Normalize menu into sections with title & items based strictly on dynamic allocated menuPage
const normalizeNavigation = (menuData) => {
  if (!Array.isArray(menuData) || menuData.length === 0) {
    return [];
  }

  // Already section-based configuration
  if (menuData[0]?.title && Array.isArray(menuData[0]?.items)) {
    return menuData;
  }

  // Raw page array from backend menuPage
  const formattedItems = menuData
    .map(formatPageNode)
    .sort((a, b) => a.order - b.order);

  // Group top-level items by module extracted from ParentPage, raw Module, or URL
  const sectionsMap = new Map();

  formattedItems.forEach(item => {
    let sectionTitle = '';

    // 1. Check if backend provided ParentPage or Section/Module name
    const rawParent = item.parentPage || item.raw?.ParentPage || item.raw?.parentPage || item.raw?.Section || item.raw?.Module;
    if (rawParent && rawParent !== '-' && rawParent !== '—' && typeof rawParent === 'string') {
      sectionTitle = rawParent.trim().toUpperCase();
    }

    // 2. Extract from URL module segment if not provided
    if (!sectionTitle && item.path && item.path.startsWith('/')) {
      const segment = item.path.split('/')[1];
      if (segment) {
        sectionTitle = segment.toLowerCase() === 'dashboard' ? 'MAIN' : segment.replace(/[-_]+/g, ' ').toUpperCase();
      }
    } else if (!sectionTitle && item.label && Array.isArray(item.children) && item.children.length > 0) {
      sectionTitle = item.label.toUpperCase();
    }

    if (!sectionTitle) {
      sectionTitle = 'MENU';
    }

    if (!sectionsMap.has(sectionTitle)) {
      sectionsMap.set(sectionTitle, []);
    }
    sectionsMap.get(sectionTitle).push(item);
  });

  const sections = [];
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
  
  // Directly read session from storage to guarantee menu is refreshed on browser reload
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

  // Sync store if store is empty but storage has menu
  React.useEffect(() => {
    if (!userMenu && sessionMenu) {
      useERPStore.getState().setUserMenu(sessionMenu);
    }
  }, [userMenu, sessionMenu]);

  // Track open nested menus
  const [openMenus, setOpenMenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeMenu = Array.isArray(userMenu) ? userMenu : (Array.isArray(sessionMenu) ? sessionMenu : []);
  const sections = normalizeNavigation(activeMenu);

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
      flex items-center justify-between ${paddingLeft} py-2.5 rounded-xl ${fontSize} font-semibold transition-all duration-200 group cursor-pointer w-full relative
      ${isActive
        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-slate-800/80'}
    `;

    const rowContent = (
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {renderIcon(
          item.icon,
          `${level === 0 ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'} shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isDirectActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400 group-hover:text-purple-600 dark:group-hover:text-cyan-300'
          }`
        )}
        {!sidebarCollapsed && (
          <span className="truncate tracking-tight">{item.label}</span>
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
                    isDirectActive ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
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
                className={`p-1.5 rounded-lg hover:bg-indigo-100/60 dark:hover:bg-slate-700/60 transition-colors ml-0.5 ${
                  isDirectActive ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200'
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
          <div className="pl-3.5 ml-4 border-l-2 border-indigo-200 dark:border-indigo-500/40 space-y-0.5 py-0.5 mt-0.5">
            {item.children.map((child, idx) =>
              renderMenuItem(child, level + 1, `${itemKey}-${idx}`)
            )}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-r border-indigo-100/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 shadow-sm transition-colors duration-200">
      {/* Brand Logo Header */}
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'} h-18 border-b border-indigo-100/70 dark:border-slate-800/70 shrink-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent dark:from-slate-900/40 dark:via-indigo-950/20 dark:to-transparent`}>
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="group relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-2 shrink-0 shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 hover:shadow-indigo-500/50 transition-all"
            title="Click to Expand Sidebar"
          >
            <img src={logo} alt="Vishvin ERP Logo" className="w-full h-full object-contain filter drop-shadow brightness-0 invert group-hover:opacity-20 transition-opacity" />
            <PanelLeft className="w-5 h-5 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <>
            <div 
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Refresh & Go to Main Page"
            >
              {/* Logo Icon with glowing gradient container */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-2 shrink-0 shadow-lg shadow-indigo-500/35 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all">
                <img src={logo} alt="Vishvin ERP Logo" className="w-full h-full object-contain filter drop-shadow brightness-0 invert" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                    Vishvin
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                    ERP
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600/80 dark:text-indigo-300/80 tracking-wide">
                  Enterprise Cloud
                </span>
              </div>
            </div>
            
            {/* Toggle Collapse Button on Desktop */}
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-white cursor-pointer transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-4 space-y-5">
        {sections.length === 0 ? (
          <div className="px-3 py-8 text-center flex flex-col items-center justify-center gap-2.5 text-slate-400 dark:text-slate-500">
            <ShieldAlert className="w-8 h-8 opacity-40 stroke-1 text-indigo-500" />
            {!sidebarCollapsed && (
              <>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">No pages assigned</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">You don't have access to any menu pages yet.</span>
              </>
            )}
          </div>
        ) : (
          sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {/* Section Title */}
              {!sidebarCollapsed ? (
                <h5 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2.5">
                  {section.title}
                </h5>
              ) : (
                <div className="border-t border-indigo-100 dark:border-slate-800 my-2 mx-1"></div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, iIdx) => renderMenuItem(item, 0, `s${sIdx}-i${iIdx}`))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className={`
        hidden md:block shrink-0 h-full transition-all duration-200 ease-in-out z-20
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

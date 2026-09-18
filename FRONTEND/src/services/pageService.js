// src/services/pageService.js
// Mock / Local state management for Manage Page screen (No network API calls)

// Initial default seed pages matching screenshots and ERP master
export const INITIAL_PAGES_DATA = [
  {
    PageId: 1,
    PageName: 'Dashboard',
    IconName: 'ri-dashboard-line',
    PageURL: '/dashboard',
    ParentPage: '-',
    ParentPageId: null,
    PageType: 'MainPage',
    RoleName: 'Admin, Manager',
    Roles: ['Admin', 'Manager'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 2,
    PageName: 'User Management',
    IconName: 'ri-user-line',
    PageURL: '/users',
    ParentPage: 'Administration',
    ParentPageId: 10,
    PageType: 'ChildPage',
    RoleName: 'Admin',
    Roles: ['Admin'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 3,
    PageName: 'Role Management',
    IconName: 'ri-shield-user-line',
    PageURL: '/roles',
    ParentPage: 'Administration',
    ParentPageId: 10,
    PageType: 'ChildPage',
    RoleName: 'Admin',
    Roles: ['Admin'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 4,
    PageName: 'Manage Page',
    IconName: 'ri-pages-line',
    PageURL: '/manage-page',
    ParentPage: 'Administration',
    ParentPageId: 10,
    PageType: 'ChildPage',
    RoleName: 'Admin, Manager',
    Roles: ['Admin', 'Manager'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 5,
    PageName: 'Reports',
    IconName: 'ri-file-chart-line',
    PageURL: '/reports',
    ParentPage: 'Reports',
    ParentPageId: 20,
    PageType: 'ParentPage',
    RoleName: 'Admin, Manager',
    Roles: ['Admin', 'Manager'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 6,
    PageName: 'Companies',
    IconName: 'ri-building-line',
    PageURL: '/master/companies',
    ParentPage: 'Master',
    ParentPageId: 30,
    PageType: 'ChildPage',
    RoleName: 'Admin',
    Roles: ['Admin'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 7,
    PageName: 'Products',
    IconName: 'ri-shopping-bag-line',
    PageURL: '/master/products',
    ParentPage: 'Master',
    ParentPageId: 30,
    PageType: 'ChildPage',
    RoleName: 'Admin, Manager',
    Roles: ['Admin', 'Manager'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  },
  {
    PageId: 8,
    PageName: 'Designations',
    IconName: 'ri-award-line',
    PageURL: '/master/designations',
    ParentPage: 'Master',
    ParentPageId: 30,
    PageType: 'ChildPage',
    RoleName: 'Admin',
    Roles: ['Admin'],
    Status: 'ACTIVE',
    IsActive: true,
    OrderChanged: false,
    OrderPosition: 'IsBefore',
    OrderRelativePage: null
  }
];

const STORAGE_KEY = 'erp_manage_pages';

const getStoredPages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read stored pages', e);
  }
  return INITIAL_PAGES_DATA;
};

const setStoredPages = (pages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch (e) {
    console.warn('Could not store pages', e);
  }
};

export const pageService = {
  /**
   * Get all managed pages (Local state - No API calls)
   */
  getPages: async () => {
    return { data: getStoredPages() };
  },

  /**
   * Add a new page (Local state - No API calls)
   */
  addPage: async (pageData) => {
    const currentPages = getStoredPages();
    const newPage = {
      PageId: Date.now(),
      PageName: pageData.PageName,
      IconName: pageData.IconName,
      PageURL: pageData.PageURL,
      ParentPage: pageData.ParentPage || '-',
      ParentPageId: pageData.ParentPageId || null,
      PageType: pageData.PageType || 'MainPage',
      SelectedMainPage: pageData.SelectedMainPage || '',
      SelectedParentPage: pageData.SelectedParentPage || '',
      RoleName: Array.isArray(pageData.Roles) ? pageData.Roles.join(', ') : (pageData.RoleName || 'Admin'),
      Roles: Array.isArray(pageData.Roles) ? pageData.Roles : [pageData.RoleName || 'Admin'],
      Status: 'ACTIVE',
      IsActive: true,
      OrderChanged: Boolean(pageData.OrderChanged),
      OrderPosition: pageData.OrderPosition || 'IsBefore',
      OrderRelativePage: pageData.OrderRelativePage || null
    };

    const updated = [newPage, ...currentPages];
    setStoredPages(updated);
    return { success: true, data: newPage };
  },

  /**
   * Update an existing page (Local state - No API calls)
   */
  updatePage: async (pageData) => {
    const currentPages = getStoredPages();
    const updated = currentPages.map((p) => {
      if (p.PageId === pageData.PageId) {
        const isActive = pageData.IsActive !== undefined ? Boolean(pageData.IsActive) : p.IsActive;
        return {
          ...p,
          PageName: pageData.PageName || p.PageName,
          IconName: pageData.IconName || p.IconName,
          PageURL: pageData.PageURL || p.PageURL,
          ParentPage: pageData.ParentPage || p.ParentPage,
          ParentPageId: pageData.ParentPageId !== undefined ? pageData.ParentPageId : p.ParentPageId,
          PageType: pageData.PageType || p.PageType,
          SelectedMainPage: pageData.SelectedMainPage !== undefined ? pageData.SelectedMainPage : p.SelectedMainPage,
          SelectedParentPage: pageData.SelectedParentPage !== undefined ? pageData.SelectedParentPage : p.SelectedParentPage,
          RoleName: Array.isArray(pageData.Roles) ? pageData.Roles.join(', ') : (pageData.RoleName || p.RoleName),
          Roles: Array.isArray(pageData.Roles) ? pageData.Roles : p.Roles,
          IsActive: isActive,
          Status: isActive ? 'ACTIVE' : 'INACTIVE',
          OrderChanged: Boolean(pageData.OrderChanged),
          OrderPosition: pageData.OrderPosition || p.OrderPosition || 'IsBefore',
          OrderRelativePage: pageData.OrderRelativePage !== undefined ? pageData.OrderRelativePage : p.OrderRelativePage
        };
      }
      return p;
    });

    setStoredPages(updated);
    return { success: true, data: updated.find(p => p.PageId === pageData.PageId) };
  },

  /**
   * Toggle or update status (Local state - No API calls)
   */
  updateStatus: async (pageId, isActive) => {
    const currentPages = getStoredPages();
    const updated = currentPages.map((p) => {
      if (p.PageId === pageId) {
        return {
          ...p,
          IsActive: isActive,
          Status: isActive ? 'ACTIVE' : 'INACTIVE'
        };
      }
      return p;
    });
    setStoredPages(updated);
    return { success: true };
  },

  /**
   * Delete page (Local state - No API calls)
   */
  deletePage: async (pageId) => {
    const currentPages = getStoredPages();
    const updated = currentPages.filter((p) => p.PageId !== pageId);
    setStoredPages(updated);
    return { success: true };
  }
};

export default pageService;

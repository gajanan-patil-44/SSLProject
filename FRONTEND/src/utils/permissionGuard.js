// src/utils/permissionGuard.js

/**
 * Mapping of canonical routes to their known aliases/legacy URL patterns.
 * This guarantees that if a user has permission for a module under either
 * the canonical URL or any of its historical/database aliases, access is recognized.
 */
export const ROUTE_ALIASES = {
  '/master/vendor-management': [
    '/master/vendor-management',
    '/master/vendors',
    '/vendor-management',
    '/vendors'
  ],
  '/master/material-creation': [
    '/master/material-creation',
    '/master/item-creation',
    '/master/items',
    '/master/material'
  ],
  '/master/manage-users': [
    '/master/manage-users',
    '/master/manage-user',
    '/master/users',
    '/user-management/manage-users',
    '/user-management/users',
    '/manage-users',
    '/users'
  ],
  '/master/manage-page': [
    '/master/manage-page',
    '/manage-page'
  ],
  '/master/roles': [
    '/master/roles',
    '/roles',
    '/user-management/roles',
    '/system/roles'
  ],
  '/master/company-master': [
    '/master/company-master',
    '/master/companies',
    '/companies',
    '/company-master',
    '/master/company_master',
    '/company_master'
  ],
  '/master/companies': [
    '/master/company-master',
    '/master/companies',
    '/companies',
    '/company-master',
    '/master/company_master',
    '/company_master'
  ],
  '/master/location-type-master': [
    '/master/location-type-master',
    '/master/location-type',
    '/location-type-master',
    '/location-type'
  ],
  '/master/location-master': [
    '/master/location-master',
    '/master/locations',
    '/location-master',
    '/locations'
  ],
  '/master/products': [
    '/master/products',
    '/products',
    '/products/products'
  ],
  '/master/company-products': [
    '/master/company-products',
    '/company-products',
    '/master/company_products'
  ],
  '/master/projects': [
    '/master/projects',
    '/projects',
    '/projects/projects'
  ],
  '/master/designations': [
    '/master/designations',
    '/designations',
    '/hrm/designations'
  ],
  '/master/user-creation': [
    '/master/user-creation'
  ],
  '/master/material-category': [
    '/master/material-category'
  ],
  '/master/material-sub-category': [
    '/master/material-sub-category'
  ],
  '/hrm/employees': [
    '/hrm/employees'
  ],
  '/hrm/attendance': [
    '/hrm/attendance'
  ],
  '/hrm/leave': [
    '/hrm/leave'
  ],
  '/crm/pipeline': [
    '/crm/pipeline'
  ],
  '/pos/pos': [
    '/pos/pos'
  ],
  '/support/tickets': [
    '/support/tickets'
  ],
  '/documents/letter-builder': [
    '/documents/letter-builder'
  ]
};

/**
 * Checks whether the current user holds Super Admin or System Administrator privileges.
 */
export const isSuperAdmin = (user, userContext) => {
  const roleNames = [
    user?.role,
    ...(userContext?.roles || []).map(r => r.RoleName || r.roleName || r.name),
    user?.designation?.name
  ].filter(Boolean).map(r => String(r).trim().toLowerCase());

  return roleNames.some(r =>
    r.includes('super admin') ||
    r.includes('superadmin') ||
    r.includes('system admin')
  ) || String(user?.loginName || '').toLowerCase() === 'admin';
};

/**
 * Recursively extracts all allocated page URLs from the user's menu structure.
 */
export const extractAssignedPaths = (menuItems) => {
  const paths = new Set();
  if (!Array.isArray(menuItems)) return paths;

  const traverse = (items) => {
    for (const item of items) {
      const raw = item.PageUrl || item.url || item.path;
      if (raw && typeof raw === 'string') {
        const clean = raw.trim().toLowerCase().replace(/\/+$/, '');
        if (clean) {
          const withLeading = clean.startsWith('/') ? clean : '/' + clean;
          paths.add(withLeading);
        }
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(menuItems);
  return paths;
};

/**
 * Core Route Guard Validator.
 * Evaluates whether the requested pathname is permitted for the authenticated user.
 *
 * @param {string} pathname Current route path
 * @param {Array} menuData The user's allocated menu array
 * @param {Object} user Current user state
 * @param {Object} userContext Context roles and permissions
 * @returns {boolean} True if access is permitted, false otherwise
 */
export const isRouteAllowed = (pathname, menuData, user, userContext) => {
  if (!pathname) return true;

  const normalizedCurrent = pathname.trim().toLowerCase().replace(/\/+$/, '') || '/';

  // 1. Authenticated global utility & landing pages (accessible to all logged-in users)
  const GLOBAL_PAGES = [
    '/',
    '/dashboard',
    '/master/company-master',
    '/master/companies',
    '/company-master',
    '/companies',
    '/master/location-type-master',
    '/master/location-type',
    '/location-type-master',
    '/master/location-master',
    '/master/locations',
    '/location-master',
    '/locations',
    '/pages/utilities',
    '/help/docs',
    '/help/changelog'
  ];
  if (GLOBAL_PAGES.includes(normalizedCurrent)) {
    return true;
  }

  // 2. Authentication & Error pages are always public/accessible
  if (
    normalizedCurrent.startsWith('/pages/auth/') ||
    normalizedCurrent.startsWith('/pages/error/')
  ) {
    return true;
  }

  // 3. Super Admin bypass (Super Admins have full access to all system modules)
  if (isSuperAdmin(user, userContext)) {
    return true;
  }

  // 4. Extract assigned paths from user's allocated menu
  const assigned = extractAssignedPaths(menuData);

  // If user has zero allocated pages, they are restricted to dashboard only
  if (assigned.size === 0) {
    return false;
  }

  // 5. Direct path match
  if (assigned.has(normalizedCurrent)) {
    return true;
  }

  // 6. Canonical Alias matching
  for (const [canonical, aliases] of Object.entries(ROUTE_ALIASES)) {
    const canonicalNorm = canonical.toLowerCase().replace(/\/+$/, '');
    const aliasesNorm = aliases.map(a => a.toLowerCase().replace(/\/+$/, ''));

    if (normalizedCurrent === canonicalNorm || aliasesNorm.includes(normalizedCurrent)) {
      // Check if user is allocated either the canonical URL or any alias in the database
      const hasPermission = aliasesNorm.some(alias => assigned.has(alias));
      if (hasPermission) return true;
    }
  }

  // 7. Prefix / sub-route matching (e.g. for /ui/:subpage or /help/:subpage)
  for (const path of assigned) {
    if (path !== '/' && path !== '/dashboard' && normalizedCurrent.startsWith(path + '/')) {
      return true;
    }
  }

  // Route is not assigned to the user
  return false;
};

import apiClient from './apiClient';
import { API_ROUTES } from '../routes/apiRoutes';

/**
 * Normalizes page item records received from backend API
 */
export const normalizePageItem = (p, idx = 0) => {
  if (!p || typeof p !== 'object') return p;

  const pageId = p.PageId ?? p.pageId ?? p.SlNo ?? p.slNo ?? (idx + 1);
  const slNo = p.SlNo ?? p.slNo ?? (idx + 1);
  const pageName = p.PageName ?? p.pageName ?? '';
  const iconName = p.IconName ?? p.iconName ?? p.PageIcon ?? p.pageIcon ?? '';
  const pageUrl = p.PageUrl ?? p.PageURL ?? p.pageUrl ?? p.pageURL ?? '';
  const parentPage = p.ParentPage ?? p.parentPage ?? '—';
  const parentPageId = p.ParentPageId ?? p.parentPageId ?? null;
  const orderNo = p.OrderNo ?? p.orderNo ?? p.order ?? '';
  const isDisabled =
    p.IsDisabled === true ||
    p.isDisabled === true ||
    p.Status === 'INACTIVE' ||
    p.status === 'Inactive' ||
    p.status === 'Disabled';
  const isActive = !isDisabled;

  // Extract Roles
  let roles = [];
  let rawRoleObjects = [];
  let roleNames = [];

  if (Array.isArray(p.Roles)) {
    p.Roles.forEach((r) => {
      if (typeof r === 'object' && r !== null) {
        rawRoleObjects.push(r);
        const name = r.RoleName || r.roleName || r.name;
        if (name) {
          roleNames.push(name);
          roles.push(name);
        }
      } else if (typeof r === 'string' && r.trim()) {
        roleNames.push(r.trim());
        roles.push(r.trim());
        rawRoleObjects.push({ RoleName: r.trim() });
      }
    });
  } else if (typeof p.Roles === 'string') {
    roleNames = p.Roles.split(',').map((s) => s.trim()).filter(Boolean);
    roles = roleNames;
  } else if (p.RoleName) {
    roleNames = p.RoleName.split(',').map((s) => s.trim()).filter(Boolean);
    roles = roleNames;
  } else if (p.roleName) {
    roleNames = p.roleName.split(',').map((s) => s.trim()).filter(Boolean);
    roles = roleNames;
  }

  if (roles.length === 0) {
    roles = [];
    roleNames = [];
  }

  const isMain = !parentPage || parentPage === '-' || parentPage === '—';

  return {
    ...p,
    id: pageId,
    PageId: pageId,
    SlNo: slNo,
    PageName: pageName,
    IconName: iconName,
    PageUrl: pageUrl,
    PageURL: pageUrl,
    ParentPage: parentPage,
    ParentPageId: parentPageId,
    OrderNo: orderNo,
    Roles: roles,
    RawRoles: rawRoleObjects.length > 0 ? rawRoleObjects : p.Roles,
    RoleName: roleNames.join(', '),
    IsDisabled: isDisabled,
    IsActive: isActive,
    Status: isActive ? 'ACTIVE' : 'INACTIVE',
    PageType: p.PageType || (isMain ? 'MainPage' : 'ChildPage'),
    isEnabled: isActive
  };
};

export const pageService = {
  /**
   * View all managed pages (FlagId: 1)
   */
  getPages: async (flagId = 1) => {
    const payload = { FlagId: Number(flagId) };
    const response = await apiClient.post(API_ROUTES.PAGE.VIEW, payload);

    let rawData = [];
    if (Array.isArray(response)) {
      rawData = response;
    } else if (response && Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.result)) {
      rawData = response.result;
    } else if (response && typeof response === 'object' && Array.isArray(response.pages)) {
      rawData = response.pages;
    } else if (response && response.data && Array.isArray(response.data.data)) {
      rawData = response.data.data;
    }

    const normalized = rawData.map(normalizePageItem);
    return { success: true, data: normalized, raw: response };
  },

  /**
   * Fetch Roles dropdown (FlagId: 1)
   */
  getRolesDropdown: async () => {
    try {
      const response = await apiClient.post(API_ROUTES.PAGE.DROPDOWN, { FlagId: 1 });
      const list = response?.data || response?.result || (Array.isArray(response) ? response : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch Main pages dropdown (FlagId: 2)
   */
  getMainPagesDropdown: async () => {
    try {
      const response = await apiClient.post(API_ROUTES.PAGE.DROPDOWN, { FlagId: 2 });
      const list = response?.data || response?.result || (Array.isArray(response) ? response : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch Parent / Child pages dropdown (FlagId: 3)
   */
  getParentPagesDropdown: async ({ mainPageId, parentPageId } = {}) => {
    const payload = { FlagId: 3 };
    if (mainPageId !== undefined && mainPageId !== null && mainPageId !== '') {
      payload.mainPageId = Number(mainPageId);
    }
    if (parentPageId !== undefined && parentPageId !== null && parentPageId !== '') {
      payload.parentPageId = Number(parentPageId);
    }

    try {
      const response = await apiClient.post(API_ROUTES.PAGE.DROPDOWN, payload);
      const list = response?.data || response?.result || (Array.isArray(response) ? response : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch child pages dropdown (alias)
   */
  getChildPagesDropdown: async (params = {}) => {
    return pageService.getParentPagesDropdown(params);
  },

  /**
   * Add a new page
   */
  addPage: async (data) => {
    return apiClient.post(API_ROUTES.PAGE.ADD, data);
  },

  /**
   * Update existing page (POST /edit FlagId: 2)
   */
  updatePage: async (data) => {
    return apiClient.post(API_ROUTES.PAGE.EDIT, data);
  },

  /**
   * Toggle or update status (PATCH: FlagId: 2)
   */
  updateStatus: async (pageId, isDisabled) => {
    return apiClient.patch(API_ROUTES.PAGE.STATUS, {
      FlagId: 2,
      PageId: Number(pageId),
      IsDisabled: Boolean(isDisabled)
    });
  }
};

export default pageService;

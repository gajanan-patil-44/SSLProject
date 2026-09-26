// src/pages/Master/ManagePageView.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PageHeader,
  Button,
  Switch,
  StatusBadge,
  Input
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { pageService } from '../../services/pageService';
import { userService } from '../../services/userService';
import { useERPStore } from '../../store/useERPStore';

export default function ManagePageView() {
  const showToast = useERPStore((state) => state.showToast);

  // Table Data & Loading
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    PageName: '',
    PageURL: '',
    IconName: '',
    PageType: 'MainPage', // 'MainPage' | 'ParentPage' | 'ChildPage'
    SelectedMainPage: '',
    SelectedParentPage: '',
    OrderChanged: false,
    OrderPosition: 'IsBefore', // 'IsBefore' | 'IsAfter'
    OrderRelativePage: '',
    Roles: ['Super Admin'],
    IsActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Pages Data from live API
  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await pageService.getPages(1);
      if (response?.data && Array.isArray(response.data)) {
        setPages(response.data);
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
      setPages([]);
      showToast(err?.message || 'Failed to load pages from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Dropdowns fetched with FlagId 1, 2, 3
  const [rolesDropdownList, setRolesDropdownList] = useState([]);
  const [mainPagesDropdownList, setMainPagesDropdownList] = useState([]);
  const [parentPagesDropdownList, setParentPagesDropdownList] = useState([]);
  const [childPagesDropdown, setChildPagesDropdown] = useState([]);
  const [loadingChildDropdown, setLoadingChildDropdown] = useState(false);

  // Refs to prevent duplicate/infinite API hits
  const lastFetchedParentMainId = useRef(null);
  const lastFetchedChildKey = useRef(null);

  // 1. Load Roles (FlagId: 1) and MainPages (FlagId: 2) once when Modal is opened
  useEffect(() => {
    if (!isAddEditOpen) {
      lastFetchedParentMainId.current = null;
      lastFetchedChildKey.current = null;
      return;
    }

    let isMounted = true;
    const loadInitialModalData = async () => {
      try {
        const [rolesRes, mainsRes] = await Promise.all([
          rolesDropdownList.length === 0 ? pageService.getRolesDropdown() : Promise.resolve(rolesDropdownList),
          mainPagesDropdownList.length === 0 ? pageService.getMainPagesDropdown() : Promise.resolve(mainPagesDropdownList)
        ]);

        if (isMounted) {
          if (Array.isArray(rolesRes) && rolesRes.length > 0 && rolesDropdownList.length === 0) {
            setRolesDropdownList(rolesRes);
          }
          if (Array.isArray(mainsRes) && mainsRes.length > 0 && mainPagesDropdownList.length === 0) {
            setMainPagesDropdownList(mainsRes);
          }
        }
      } catch (err) {
        console.error('Error loading modal dropdowns:', err);
      }
    };

    loadInitialModalData();
    return () => {
      isMounted = false;
    };
  }, [isAddEditOpen]);

  // 2. Fetch ParentPages (FlagId: 3) for ParentPage mode
  useEffect(() => {
    if (!isAddEditOpen || formData.PageType !== 'ParentPage') return;

    let isMounted = true;
    const loadParentPageDropdown = async () => {
      try {
        const mainPageFromView = 
          (formData.SelectedMainPage && pages.find((p) => p.PageName === formData.SelectedMainPage)) ||
          (selectedPage && selectedPage.ParentPage && pages.find((p) => p.PageName === selectedPage.ParentPage)) ||
          (selectedPage && pages.find((p) => String(p.PageId) === String(selectedPage.ParentPageId || selectedPage.PageId))) ||
          pages.find((p) => p.PageType === 'MainPage' || !p.ParentPage || p.ParentPage === '-' || p.ParentPage === '—') ||
          mainPagesDropdownList[0];

        const mainPageId = mainPageFromView?.PageId ?? selectedPage?.ParentPageId ?? selectedPage?.PageId;

        if (lastFetchedParentMainId.current === `parent_${mainPageId}`) return;
        lastFetchedParentMainId.current = `parent_${mainPageId}`;

        const parentsRes = await pageService.getParentPagesDropdown(mainPageId ? { mainPageId: Number(mainPageId) } : {});
        if (isMounted && Array.isArray(parentsRes)) {
          setParentPagesDropdownList(parentsRes);
        }
      } catch (err) {
        console.error('Error loading parent dropdown:', err);
      }
    };

    loadParentPageDropdown();
    return () => {
      isMounted = false;
    };
  }, [isAddEditOpen, formData.PageType, formData.SelectedMainPage, selectedPage, pages, mainPagesDropdownList]);

  // 3. Cascade fetch for ChildPage: When SelectedMainPage or SelectedParentPage changes
  useEffect(() => {
    if (!isAddEditOpen || formData.PageType !== 'ChildPage') return;

    let isMounted = true;
    const fetchCascadeDropdown = async () => {
      try {
        if (!formData.SelectedMainPage) {
          if (isMounted) setParentPagesDropdownList([]);
          lastFetchedParentMainId.current = null;
          return;
        }

        // Look up in mainPagesDropdownList (FlagId 2 response: { PageId: 1, PageName: "DMS" })
        const selectedMain = mainPagesDropdownList.find(
          (p) => (p.PageName || p.pageName || p.MainPage || p.mainPage || p.name) === formData.SelectedMainPage || String(p.PageId || p.pageId || p.id) === String(formData.SelectedMainPage)
        ) || pages.find(
          (p) => p.PageName === formData.SelectedMainPage || String(p.PageId) === String(formData.SelectedMainPage)
        );

        const mainPageId = selectedMain?.PageId ?? selectedMain?.pageId ?? selectedMain?.id ?? (Number(formData.SelectedMainPage) || undefined);

        // Fetch parent pages under this main page: { FlagId: 3, mainPageId: <PageId> }
        if (mainPageId && lastFetchedParentMainId.current !== `child_main_${mainPageId}`) {
          lastFetchedParentMainId.current = `child_main_${mainPageId}`;
          const parentsRes = await pageService.getParentPagesDropdown({ mainPageId: Number(mainPageId) });
          if (isMounted && Array.isArray(parentsRes)) {
            setParentPagesDropdownList(parentsRes);
          }
        }

        // If order change is enabled and parent page is selected, fetch child pages
        if (formData.OrderChanged && (formData.SelectedParentPage || formData.SelectedMainPage)) {
          const selectedParent = parentPagesDropdownList.find(
            (p) => (p.PageName || p.pageName || p.ParentPage || p.parentPage || p.name) === formData.SelectedParentPage || String(p.PageId || p.pageId || p.ParentPageId) === String(formData.SelectedParentPage)
          ) || pages.find(
            (p) => p.PageName === formData.SelectedParentPage || String(p.PageId) === String(formData.SelectedParentPage)
          );

          const parentPageId = selectedParent?.PageId ?? selectedParent?.parentPageId ?? selectedParent?.ParentPageId ?? selectedParent?.id ?? (Number(formData.SelectedParentPage) || undefined);

          const childKey = `${mainPageId}_${parentPageId}`;
          if (lastFetchedChildKey.current !== childKey) {
            lastFetchedChildKey.current = childKey;
            setLoadingChildDropdown(true);
            const data = await pageService.getParentPagesDropdown({
              mainPageId: mainPageId ? Number(mainPageId) : undefined,
              parentPageId: parentPageId ? Number(parentPageId) : undefined
            });
            if (isMounted) {
              setChildPagesDropdown(Array.isArray(data) ? data : []);
              setLoadingChildDropdown(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load cascade dropdown:', err);
        if (isMounted) {
          setChildPagesDropdown([]);
          setLoadingChildDropdown(false);
        }
      }
    };

    fetchCascadeDropdown();
    return () => {
      isMounted = false;
    };
  }, [isAddEditOpen, formData.PageType, formData.SelectedMainPage, formData.SelectedParentPage, formData.OrderChanged, pages, mainPagesDropdownList]);

  // Dynamic distinct roles from live backend data and FlagId 1 dropdown
  const availableRoles = useMemo(() => {
    const rolesFromApi = rolesDropdownList.map((r) => {
      if (typeof r === 'string') return r.trim();
      return (r.RoleName || r.roleName || r.Role || r.role || r.name || '').trim();
    }).filter(Boolean);

    const rolesFromData = pages.flatMap((p) => {
      if (Array.isArray(p.Roles)) {
        return p.Roles.map((r) => typeof r === 'object' && r ? (r.RoleName || r.roleName || '') : String(r)).filter(Boolean);
      }
      return [];
    });

    const defaultRoles = ['Super Admin', 'Admin', 'Manager', 'User', 'HR', 'Accountant', 'Cashier', 'Supervisor', 'Developer'];
    return Array.from(new Set([...rolesFromApi, ...rolesFromData, ...defaultRoles])).filter(Boolean);
  }, [rolesDropdownList, pages]);

  // Distinct MainPage options from live backend data and FlagId 2 dropdown
  const mainPageOptions = useMemo(() => {
    const mainsFromApi = mainPagesDropdownList.map((m) => {
      if (typeof m === 'string') return m.trim();
      return (m.PageName || m.pageName || m.MainPage || m.mainPage || m.name || '').trim();
    }).filter(Boolean);

    const dynamicMains = pages
      .filter((p) => p.PageType === 'MainPage' || !p.ParentPage || p.ParentPage === '-' || p.ParentPage === '—')
      .map((p) => (p.PageName || '').trim())
      .filter(Boolean);

    return Array.from(new Set([...mainsFromApi, ...dynamicMains])).filter(Boolean);
  }, [mainPagesDropdownList, pages]);

  // Distinct ParentPage options from live backend data and FlagId 3 dropdown
  const parentPageOptions = useMemo(() => {
    const parentsFromApi = parentPagesDropdownList.map((p) => {
      if (typeof p === 'string') return p.trim();
      return (p.PageName || p.pageName || p.ParentPage || p.parentPage || p.name || '').trim();
    }).filter(Boolean);

    const dynamicParents = pages
      .map((p) => (p.ParentPage && p.ParentPage !== '-' && p.ParentPage !== '—' ? p.ParentPage : p.PageName)?.trim())
      .filter(Boolean);

    return Array.from(new Set([...parentsFromApi, ...dynamicParents])).filter(Boolean);
  }, [parentPagesDropdownList, pages]);

  // ChildPage options (pages that are child pages)
  const childPageOptions = useMemo(() => {
    const childsFromApi = childPagesDropdown.map((c) => {
      if (typeof c === 'string') return c.trim();
      return (c.PageName || c.pageName || c.ChildPage || c.childPage || c.name || '').trim();
    }).filter(Boolean);

    const dynamicChilds = pages
      .filter((p) => p.PageType === 'ChildPage' || (p.ParentPage && p.ParentPage !== '-' && p.ParentPage !== '—'))
      .map((p) => (p.PageName || '').trim())
      .filter(Boolean);

    return Array.from(new Set([...childsFromApi, ...dynamicChilds])).filter(Boolean);
  }, [childPagesDropdown, pages]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedPage(null);
    setFormData({
      PageName: '',
      PageURL: '',
      IconName: '',
      PageType: 'MainPage',
      SelectedMainPage: '',
      SelectedParentPage: '',
      OrderChanged: false,
      OrderPosition: 'IsBefore',
      OrderRelativePage: '',
      Roles: ['Super Admin'],
      IsActive: true
    });
    setFormErrors({});
    setIsRoleDropdownOpen(false);
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (page) => {
    setModalMode('edit');
    setSelectedPage(page);
    setFormData({
      PageName: page.PageName || '',
      PageURL: page.PageUrl || page.PageURL || '',
      IconName: page.IconName || '',
      PageType: page.PageType || 'MainPage',
      SelectedMainPage: page.ParentPage && page.ParentPage !== '-' && page.ParentPage !== '—' ? page.ParentPage : (page.SelectedMainPage || ''),
      SelectedParentPage: page.ParentPage && page.ParentPage !== '-' && page.ParentPage !== '—' ? page.ParentPage : (page.SelectedParentPage || ''),
      OrderChanged: Boolean(page.OrderChanged),
      OrderPosition: page.OrderPosition || 'IsBefore',
      OrderRelativePage: page.OrderRelativePage || page.OrderPageId || '',
      Roles: Array.isArray(page.Roles) && page.Roles.length > 0 
        ? page.Roles.map(r => (typeof r === 'object' && r !== null ? (r.RoleName || r.roleName || '') : String(r))).filter(Boolean)
        : (page.RoleName ? page.RoleName.split(',').map(r => r.trim()) : ['Super Admin']),
      IsActive: page.IsDisabled !== true && page.Status !== 'INACTIVE' && page.IsActive !== false
    });
    setFormErrors({});
    setIsRoleDropdownOpen(false);
    setIsAddEditOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (page) => {
    setSelectedPage(page);
    setIsViewOpen(true);
  };

  // Toggle Status via Switch
  const handleToggleStatus = async (record) => {
    try {
      const isCurrentlyDisabled = record.IsDisabled === true || record.Status === 'INACTIVE' || record.IsActive === false;
      const newDisabledState = !isCurrentlyDisabled; // true if turning inactive, false if turning active

      if (record.UserId) {
        const currentUser = useERPStore.getState().user;
        const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || 'admin';
        await userService.toggleUserStatus({
          flagId: 1,
          IsDisabled: newDisabledState,
          UpdatedByUserName: userName,
          UserId: Number(record.UserId)
        });
        showToast(`User status updated to ${newDisabledState ? 'Inactive' : 'Active'}.`, 'success');
        await loadPages();
        return;
      }

      await pageService.updateStatus(record.PageId, newDisabledState);
      showToast(`Page status updated to ${newDisabledState ? 'Inactive' : 'Active'}.`, 'success');
      await loadPages();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(err?.message || 'Failed to update status', 'error');
    }
  };

  // Delete Record
  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    setDeleteLoading(true);
    try {
      await pageService.deletePage(deleteRecord.PageId);
      showToast('Page deleted successfully!', 'success');
      setDeleteRecord(null);
      await loadPages();
    } catch (err) {
      console.error('Failed to delete page:', err);
      showToast(err?.message || 'Failed to delete page', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle Role in Multi-Select
  const handleToggleRole = (role) => {
    setFormData((prev) => {
      const exists = prev.Roles.includes(role);
      const newRoles = exists
        ? prev.Roles.filter((r) => r !== role)
        : [...prev.Roles, role];
      return { ...prev, Roles: newRoles };
    });
    if (formErrors.Roles) {
      setFormErrors((prev) => ({ ...prev, Roles: null }));
    }
  };

  // Remove single role tag
  const handleRemoveRole = (role, e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      Roles: prev.Roles.filter((r) => r !== role)
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.PageName.trim()) {
      errors.PageName = 'PageName is required';
    }
    if (!formData.PageURL.trim()) {
      errors.PageURL = 'PageURL is required';
    }
    if (!formData.IconName.trim()) {
      errors.IconName = 'IconName is required';
    }
    if (formData.PageType === 'ParentPage' && !formData.SelectedParentPage) {
      errors.SelectedParentPage = 'ParentPage selection is required';
    }
    if (formData.PageType === 'ChildPage') {
      if (!formData.SelectedMainPage) {
        errors.SelectedMainPage = 'MainPage selection is required';
      }
      if (!formData.SelectedParentPage) {
        errors.SelectedParentPage = 'ParentPage selection is required';
      }
    }
    if (!formData.Roles || formData.Roles.length === 0) {
      errors.Roles = 'At least one Role is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    try {
      // 1. Resolve RoleIds from selected Roles
      let rolesPool = [...rolesDropdownList];
      if (rolesPool.length === 0) {
        try {
          rolesPool = await pageService.getRolesDropdown();
        } catch (e) {
          rolesPool = [];
        }
      }

      const roleIds = Array.from(
        new Set(
          (formData.Roles || [])
            .map((roleName) => {
              const found = rolesPool.find(
                (r) =>
                  (r.RoleName || r.roleName || r.Role || r.name || '').trim().toLowerCase() ===
                    String(roleName).trim().toLowerCase() ||
                  String(r.RoleId || r.roleId || r.id) === String(roleName)
              );
              const val = found?.RoleId ?? found?.roleId ?? found?.id ?? (Number(roleName) || null);
              return val ? Number(val) : null;
            })
            .filter((id) => id !== null && !isNaN(id))
        )
      );

      // 2. Resolve ParentPageId based on PageType
      let resolvedParentPageId = null;
      let resolvedParentPageName = '-';

      if (formData.PageType === 'ParentPage') {
        const foundParent = 
          parentPagesDropdownList.find((p) => (p.PageName || p.pageName || p.ParentPage || p.name) === formData.SelectedParentPage || String(p.PageId || p.pageId) === String(formData.SelectedParentPage)) ||
          mainPagesDropdownList.find((p) => (p.PageName || p.pageName || p.MainPage || p.name) === formData.SelectedParentPage || String(p.PageId || p.pageId) === String(formData.SelectedParentPage)) ||
          pages.find((p) => p.PageName === formData.SelectedParentPage || String(p.PageId) === String(formData.SelectedParentPage));
        
        resolvedParentPageId = foundParent?.PageId ?? foundParent?.pageId ?? (Number(formData.SelectedParentPage) || 1);
        resolvedParentPageName = formData.SelectedParentPage;
      } else if (formData.PageType === 'ChildPage') {
        const foundParent = 
          parentPagesDropdownList.find((p) => (p.PageName || p.pageName || p.ParentPage || p.name) === formData.SelectedParentPage || String(p.PageId || p.pageId || p.ParentPageId) === String(formData.SelectedParentPage)) ||
          pages.find((p) => p.PageName === formData.SelectedParentPage || String(p.PageId) === String(formData.SelectedParentPage));
        
        resolvedParentPageId = foundParent?.PageId ?? foundParent?.parentPageId ?? foundParent?.ParentPageId ?? (Number(formData.SelectedParentPage) || 1);
        resolvedParentPageName = formData.SelectedParentPage || formData.SelectedMainPage || 'Administration';
      }

      // 3. Resolve TargetPageId if Order Changed
      let resolvedTargetPageId = null;
      if (formData.OrderChanged && formData.OrderRelativePage) {
        const foundTarget = (mainPagesDropdownList.concat(parentPagesDropdownList, childPagesDropdown, pages)).find(
          (p) => (p.PageName || p.pageName || p.name) === formData.OrderRelativePage || String(p.PageId || p.pageId) === String(formData.OrderRelativePage)
        );
        resolvedTargetPageId = foundTarget?.PageId ?? foundTarget?.pageId ?? (Number(formData.OrderRelativePage) || 2);
      }

      // 4. Resolve username
      const currentUser = useERPStore.getState().user;
      const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || 'admin';

      if (modalMode === 'add') {
        const addPayload = {
          FlagId: 1,
          PageName: formData.PageName.trim(),
          PageUrl: formData.PageURL.trim(),
          PageIcon: formData.IconName.trim(),
          PageType: formData.PageType,
          ...(resolvedParentPageId !== null ? { ParentPageId: Number(resolvedParentPageId) } : {}),
          RoleIds: roleIds.length > 0 ? roleIds : [1],
          IsChangeOrder: Boolean(formData.OrderChanged),
          ...(formData.OrderChanged ? {
            OrderType: formData.OrderPosition === 'IsBefore' ? 'BEFORE' : 'AFTER',
            TargetPageId: resolvedTargetPageId ? Number(resolvedTargetPageId) : 2
          } : {}),
          CreatedByUserName: userName
        };

        await pageService.addPage(addPayload);
        showToast('Page created successfully!', 'success');
      } else {
        const updatePayload = {
          FlagId: 2,
          PageId: Number(selectedPage.PageId),
          PageName: formData.PageName.trim(),
          PageUrl: formData.PageURL.trim(),
          PageIcon: formData.IconName.trim(),
          PageType: formData.PageType,
          ParentPageId: formData.PageType !== 'MainPage' && resolvedParentPageId !== null ? Number(resolvedParentPageId) : null,
          RoleIds: roleIds.length > 0 ? roleIds : [1],
          IsChangeOrder: Boolean(formData.OrderChanged),
          OrderType: formData.OrderChanged ? (formData.OrderPosition === 'IsBefore' ? 'BEFORE' : 'AFTER') : '',
          TargetPageId: formData.OrderChanged && resolvedTargetPageId ? Number(resolvedTargetPageId) : null,
          UpdatedByUserName: userName
        };

        await pageService.updatePage(updatePayload);

        // Also update status if changed in the modal
        if (formData.IsActive !== undefined && selectedPage.IsActive !== undefined && formData.IsActive !== selectedPage.IsActive) {
          try {
            await pageService.updateStatus(selectedPage.PageId, !formData.IsActive);
          } catch (statusErr) {
            console.error('Failed to update status with edit:', statusErr);
          }
        }

        showToast('Page updated successfully!', 'success');
      }

      await loadPages();
      setIsAddEditOpen(false);
    } catch (err) {
      console.error('Save failed:', err);
      showToast(err?.message || 'Action failed to complete.', 'error');
    }
  };

  // DataTable Column Definitions
  const columns = useMemo(() => [
    {
      id: 'SlNo',
      header: '#',
      accessorKey: 'SlNo',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-500">
          {row.original.SlNo ?? (row.index + 1)}
        </span>
      )
    },
    {
      id: 'PageName',
      header: 'PAGE NAME',
      accessorKey: 'PageName',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.original.PageName}
        </span>
      )
    },
    {
      id: 'IconName',
      header: 'ICON NAME',
      accessorKey: 'IconName',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {row.original.IconName || '—'}
        </span>
      )
    },
    {
      id: 'PageUrl',
      header: 'PAGE URL',
      accessorKey: 'PageUrl',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
          {row.original.PageUrl || row.original.PageURL || '—'}
        </span>
      )
    },
    {
      id: 'ParentPage',
      header: 'PARENT PAGE',
      accessorKey: 'ParentPage',
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {row.original.ParentPage || '—'}
        </span>
      )
    },
    {
      id: 'OrderNo',
      header: 'ORDER NO',
      accessorKey: 'OrderNo',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.original.OrderNo || '—'}
        </span>
      )
    },
    {
      id: 'RoleName',
      header: 'ROLE NAME',
      accessorKey: 'RoleName',
      cell: ({ row }) => {
        let roles = [];
        if (Array.isArray(row.original.Roles)) {
          roles = row.original.Roles.map((r) =>
            typeof r === 'object' && r !== null ? (r.RoleName || r.roleName || '') : String(r)
          ).filter(Boolean);
        } else if (row.original.RoleName) {
          roles = row.original.RoleName.split(',').map((r) => r.trim()).filter(Boolean);
        }

        if (roles.length === 0) {
          roles = ['Super Admin'];
        }

        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
              >
                {r}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      id: 'Status',
      header: 'STATUS',
      accessorKey: 'Status',
      cell: ({ row }) => {
        const isDisabled = row.original.IsDisabled === true || row.original.Status === 'INACTIVE' || row.original.IsActive === false;
        const isActive = !isDisabled;
        return <StatusBadge status={isActive ? 'Active' : 'Inactive'} />;
      }
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* ERP Page Header */}
      <PageHeader
        title="Manage Pages"
        description="Manage system access pages, navigation menus, and role access permissions."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Manage Page', path: '/master/manage-page' }
        ]}
      />

      {/* Modern ERP DataTable Component */}
      <DataTable
        columns={columns}
        data={pages}
        loading={loading}
        onRefresh={loadPages}
        onAddClick={handleOpenAddModal}
        onViewClick={handleOpenViewModal}
        onEditClick={handleOpenEditModal}
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search pages..."
      />

      {/* Add / Update Page Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={modalMode === 'add' ? 'Add New Page' : 'Update Page Details'}
        size="md"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddEditOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              {modalMode === 'add' ? 'Save Page' : 'Update Page'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Please fill mandatory information below <span className="text-rose-500 font-bold">*</span>
          </p>

          {/* PageName Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              PageName <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Enter PageName"
              value={formData.PageName}
              onChange={(e) => {
                setFormData({ ...formData, PageName: e.target.value });
                if (formErrors.PageName) setFormErrors({ ...formErrors, PageName: null });
              }}
              error={formErrors.PageName}
            />
          </div>

          {/* PageURL Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              PageURL <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Enter PageURL"
              value={formData.PageURL}
              onChange={(e) => {
                setFormData({ ...formData, PageURL: e.target.value });
                if (formErrors.PageURL) setFormErrors({ ...formErrors, PageURL: null });
              }}
              error={formErrors.PageURL}
            />
          </div>

          {/* IconName Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              IconName <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Enter IconName"
              value={formData.IconName}
              onChange={(e) => {
                setFormData({ ...formData, IconName: e.target.value });
                if (formErrors.IconName) setFormErrors({ ...formErrors, IconName: null });
              }}
              error={formErrors.IconName}
            />
          </div>

          {/* PageType Radio Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              PageType
            </label>
            <div className="flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="pageType"
                  value="MainPage"
                  checked={formData.PageType === 'MainPage'}
                  onChange={() => setFormData({ ...formData, PageType: 'MainPage' })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>MainPage</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="pageType"
                  value="ParentPage"
                  checked={formData.PageType === 'ParentPage'}
                  onChange={() => setFormData({ ...formData, PageType: 'ParentPage' })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>ParentPage</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="pageType"
                  value="ChildPage"
                  checked={formData.PageType === 'ChildPage'}
                  onChange={() => setFormData({ ...formData, PageType: 'ChildPage' })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>ChildPage</span>
              </label>
            </div>
          </div>

          {/* DYNAMIC FORM SECTION BASED ON PAGETYPE */}

          {/* 1. When PageType === 'MainPage' */}
          {formData.PageType === 'MainPage' && (
            <div className="space-y-3 pt-1">
              {/* Do you want to change order.? Checkbox */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.OrderChanged}
                    onChange={(e) => setFormData({ ...formData, OrderChanged: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>Do you want to change order.?</span>
                </label>
              </div>

              {/* Dynamic IsBefore / IsAfter above MainPage Dropdown */}
              {formData.OrderChanged && (
                <div className="space-y-3 pl-1 border-l-2 border-indigo-500/40 animate-in fade-in duration-150">
                  {/* IsBefore / IsAfter Radio Options placed first */}
                  <div className="flex items-center gap-6 pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="mainOrderPosition"
                        value="IsBefore"
                        checked={formData.OrderPosition === 'IsBefore'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsBefore' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsBefore</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="mainOrderPosition"
                        value="IsAfter"
                        checked={formData.OrderPosition === 'IsAfter'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsAfter' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsAfter</span>
                    </label>
                  </div>

                  {/* MainPage Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      MainPage
                    </label>
                    <div className="relative">
                      <select
                        value={formData.OrderRelativePage}
                        onChange={(e) => setFormData({ ...formData, OrderRelativePage: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                      >
                        <option value="">Select MainPage</option>
                        {mainPageOptions.map((mp, idx) => (
                          <option key={idx} value={mp}>
                            {mp}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. When PageType === 'ParentPage' */}
          {formData.PageType === 'ParentPage' && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              {/* ParentPage Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  ParentPage <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.SelectedParentPage}
                    onChange={(e) => {
                      setFormData({ ...formData, SelectedParentPage: e.target.value });
                      if (formErrors.SelectedParentPage) setFormErrors({ ...formErrors, SelectedParentPage: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8 ${
                      formErrors.SelectedParentPage ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Select ParentPage</option>
                    {parentPageOptions.map((pp, idx) => (
                      <option key={idx} value={pp}>
                        {pp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.SelectedParentPage && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.SelectedParentPage}</p>
                )}
              </div>

              {/* Do you want to change order.? Checkbox */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.OrderChanged}
                    onChange={(e) => setFormData({ ...formData, OrderChanged: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>Do you want to change order.?</span>
                </label>
              </div>

              {/* Dynamic IsBefore / IsAfter and relative ParentPage dropdown */}
              {formData.OrderChanged && (
                <div className="space-y-3 pl-1 border-l-2 border-indigo-500/40 animate-in fade-in duration-150">
                  <div className="flex items-center gap-6 pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="parentOrderPosition"
                        value="IsBefore"
                        checked={formData.OrderPosition === 'IsBefore'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsBefore' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsBefore</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="parentOrderPosition"
                        value="IsAfter"
                        checked={formData.OrderPosition === 'IsAfter'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsAfter' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsAfter</span>
                    </label>
                  </div>

                  {/* Relative Target ParentPage Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      ParentPage
                    </label>
                    <div className="relative">
                      <select
                        value={formData.OrderRelativePage}
                        onChange={(e) => setFormData({ ...formData, OrderRelativePage: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                      >
                        <option value="">Select ParentPage</option>
                        {parentPageOptions
                          .filter((pp) => pp !== formData.SelectedParentPage)
                          .map((pp, idx) => (
                            <option key={idx} value={pp}>
                              {pp}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. When PageType === 'ChildPage' */}
          {formData.PageType === 'ChildPage' && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              {/* MainPage Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  MainPage <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.SelectedMainPage}
                    onChange={(e) => {
                      const newMain = e.target.value;
                      setFormData({
                        ...formData,
                        SelectedMainPage: newMain,
                        SelectedParentPage: '',
                        OrderRelativePage: ''
                      });
                      if (formErrors.SelectedMainPage) setFormErrors({ ...formErrors, SelectedMainPage: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8 ${
                      formErrors.SelectedMainPage ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Select MainPage</option>
                    {mainPageOptions.map((mp, idx) => (
                      <option key={idx} value={mp}>
                        {mp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.SelectedMainPage && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.SelectedMainPage}</p>
                )}
              </div>

              {/* ParentPage Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  ParentPage <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.SelectedParentPage}
                    onChange={(e) => {
                      const newParent = e.target.value;
                      setFormData({
                        ...formData,
                        SelectedParentPage: newParent,
                        OrderRelativePage: ''
                      });
                      if (formErrors.SelectedParentPage) setFormErrors({ ...formErrors, SelectedParentPage: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8 ${
                      formErrors.SelectedParentPage ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Select ParentPage</option>
                    {parentPageOptions.map((pp, idx) => (
                      <option key={idx} value={pp}>
                        {pp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formErrors.SelectedParentPage && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.SelectedParentPage}</p>
                )}
              </div>

              {/* Do you want to change order.? Checkbox */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.OrderChanged}
                    onChange={(e) => setFormData({ ...formData, OrderChanged: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>Do you want to change order.?</span>
                </label>
              </div>

              {/* Dynamic IsBefore / IsAfter placed above ChildPage dropdown */}
              {formData.OrderChanged && (
                <div className="space-y-3 pl-1 border-l-2 border-indigo-500/40 animate-in fade-in duration-150">
                  {/* IsBefore / IsAfter Radio Options placed first */}
                  <div className="flex items-center gap-6 pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="childOrderPosition"
                        value="IsBefore"
                        checked={formData.OrderPosition === 'IsBefore'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsBefore' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsBefore</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="childOrderPosition"
                        value="IsAfter"
                        checked={formData.OrderPosition === 'IsAfter'}
                        onChange={() => setFormData({ ...formData, OrderPosition: 'IsAfter' })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                      <span>IsAfter</span>
                    </label>
                  </div>

                  {/* ChildPage Selector to place relative to */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      ChildPage
                    </label>
                    <div className="relative">
                      <select
                        value={formData.OrderRelativePage}
                        onChange={(e) => setFormData({ ...formData, OrderRelativePage: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                      >
                        <option value="">Select ChildPage</option>
                        {childPageOptions.map((cp, idx) => (
                          <option key={idx} value={cp}>
                            {cp}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RoleName Field (Multi-Select Tag Input) */}
          <div className="space-y-1.5" ref={roleDropdownRef}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              RoleName <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full min-h-[44px] p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 flex flex-wrap items-center gap-1.5 cursor-pointer transition-all ${
                  formErrors.Roles
                    ? 'border-rose-500'
                    : isRoleDropdownOpen
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {formData.Roles.length === 0 ? (
                  <span className="text-slate-400 text-xs px-1">Select Roles...</span>
                ) : (
                  formData.Roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRole(role, e)}
                        className="hover:text-rose-600 text-teal-500 dark:text-indigo-400 p-0.5 rounded cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Dropdown Options */}
              {isRoleDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 max-h-48 overflow-y-auto animate-in fade-in duration-100">
                  {availableRoles.map((role) => {
                    const isSelected = formData.Roles.includes(role);
                    return (
                      <div
                        key={role}
                        onClick={() => handleToggleRole(role)}
                        className="px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <span className={isSelected ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>
                          {role}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {formErrors.Roles && (
              <p className="text-[11px] text-rose-500 font-medium">{formErrors.Roles}</p>
            )}
          </div>

          {/* Status Toggle Switch in Edit Mode */}
          {modalMode === 'edit' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Status
              </label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.IsActive}
                  onChange={(checked) => setFormData({ ...formData, IsActive: checked })}
                />
                <span className="text-xs font-bold">
                  <StatusBadge status={formData.IsActive ? 'Active' : 'Inactive'} />
                </span>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Page Details"
        size="md"
        actions={
          <Button variant="outline" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedPage && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Page Name</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">{selectedPage.PageName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Status</span>
                <StatusBadge status={selectedPage.IsDisabled === true || selectedPage.Status === 'INACTIVE' || selectedPage.IsActive === false ? 'Inactive' : 'Active'} />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Page URL</span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">{selectedPage.PageUrl || selectedPage.PageURL || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Icon Name</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedPage.IconName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Order No</span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedPage.OrderNo || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Parent Page</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {selectedPage.ParentPage || '—'}
                  {selectedPage.ParentPageId ? ` (ID: ${selectedPage.ParentPageId})` : ''}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Page ID</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedPage.PageId || selectedPage.id || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Sl No</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedPage.SlNo || '—'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5">Assigned Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedPage.Roles)
                  ? selectedPage.Roles.map((r) => (typeof r === 'object' && r !== null ? (r.RoleName || r.roleName || '') : String(r))).filter(Boolean)
                  : (selectedPage.RoleName ? selectedPage.RoleName.split(',').map((r) => r.trim()) : ['Super Admin'])
                ).map((r, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

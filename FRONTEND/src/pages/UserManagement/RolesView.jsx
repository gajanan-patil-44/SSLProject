import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Key,
  Users,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { roleService } from '../../services/roleService';
import { useERPStore } from '../../store/useERPStore';
import { validateTextOnly, validateDescription } from '../../utils/validators';
import PaginationControls from '../../components/ui/PaginationControls';

// Helper to get session company
const getSessionCompany = () => {
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
      if (Array.isArray(comps) && comps.length > 0) return comps[0];
    }
    const ctx = useERPStore.getState()?.userContext;
    if (ctx?.companies?.length > 0) return ctx.companies[0];
  } catch { }
  return null;
};
import { Modal } from '../../components/ui/Modal';
import { Badge, Button, Input, PageHeader } from '../../components/ui/index';

export default function RolesView() {
  const sessionCompany = getSessionCompany();
  const sessionCompanyId = sessionCompany?.CompanyId ?? sessionCompany?.CompanyMasterId ?? sessionCompany?.companyId;
  const sessionCompanyName = sessionCompany?.CompanyName ?? sessionCompany?.name;

  const user = useERPStore((state) => state.user);
  const currentUserName = user?.loginName || user?.EmployeeId || (typeof user?.name === 'string' ? user.name : 'admin11');

  // Core Data States
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'view' | 'delete' | null
  const [selectedRole, setSelectedRole] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    RoleId: '',
    CompanyId: '',
    RoleName: '',
    Role_Code: '',
    Description: '',
    IsDisabled: false
  });
  const [formErrors, setFormErrors] = useState({});

  // --------------------------------------------------------------------------
  // Fetch Roles via POST /verp-service/roleCreation/getRole { FlagId: 1 }
  // --------------------------------------------------------------------------
  const hasFetchedRef = useRef(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesRes = await roleService.getRoles();
      let rolesList = [];
      if (rolesRes?.data && Array.isArray(rolesRes.data)) {
        rolesList = rolesRes.data;
      } else if (Array.isArray(rolesRes)) {
        rolesList = rolesRes;
      }
      setRoles(rolesList);

      // Extract unique companies from returned roles
      const companyMap = new Map();
      rolesList.forEach((r) => {
        if (r.CompanyId) {
          companyMap.set(r.CompanyId, {
            CompanyId: r.CompanyId,
            CompanyName: r.CompanyName || `Company #${r.CompanyId}`
          });
        }
      });
      setCompanies(Array.from(companyMap.values()));
    } catch (err) {
      setError(err?.message || 'Failed to load roles. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, []);

  // Flash message helper
  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // Form Handling & Validations
  // --------------------------------------------------------------------------
  const openAddModal = () => {
    setFormData({
      RoleId: '',
      CompanyId: sessionCompanyId ? String(sessionCompanyId) : '',
      RoleName: '',
      Role_Code: '',
      Description: '',
      IsDisabled: false
    });
    setFormErrors({});
    setSelectedRole(null);
    setModalMode('add');
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      RoleId: role.RoleId || role.id,
      CompanyId: role.CompanyId ? String(role.CompanyId) : (sessionCompanyId ? String(sessionCompanyId) : ''),
      RoleName: role.RoleName || role.name || '',
      Role_Code: role.RoleCode || role.Role_Code || role.code || '',
      Description: role.RoleDescription || role.Description || '',
      IsDisabled: Boolean(role.IsDisabled)
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const openViewModal = (role) => {
    setSelectedRole(role);
    setModalMode('view');
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setModalMode('delete');
  };

  const validateForm = () => {
    const errs = {};
    const nameErr = validateTextOnly(formData.RoleName, 'Role Name', true, 2, 100);
    if (nameErr) {
      errs.RoleName = nameErr;
    }
    if (!formData.Role_Code.trim()) {
      errs.Role_Code = 'Role Code is required (e.g., ADM, MGR, SUP)';
    }
    if (formData.Description) {
      const descErr = validateDescription(formData.Description, 'Role Description', false, 2, 500);
      if (descErr) {
        errs.Description = descErr;
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRoleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    setFormData((prev) => {
      const updated = { ...prev, RoleName: val };
      if (modalMode === 'add' && (!prev.Role_Code || prev.Role_Code.length <= 4)) {
        updated.Role_Code = val
          .replace(/[^a-zA-Z]/g, '')
          .slice(0, 4);
      }
      return updated;
    });
    if (formErrors.RoleName) {
      setFormErrors((prev) => ({ ...prev, RoleName: null }));
    }
  };

  // --------------------------------------------------------------------------
  // API Actions: Add / Edit / Delete / Toggle Status
  // --------------------------------------------------------------------------
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setError(null);

    try {
      if (modalMode === 'add') {
        const payload = {
          RoleName: formData.RoleName.trim(),
          Role_Code: formData.Role_Code.trim(),
          Description: formData.Description?.trim() || '',
          CreatedByUserName: currentUserName
        };
        const res = await roleService.addRole(payload);
        showToast(res?.message || `Role "${formData.RoleName}" created successfully!`);
      } else if (modalMode === 'edit') {
        const payload = {
          FlagId: 4,
          RoleId: Number(formData.RoleId),
          RoleName: formData.RoleName.trim(),
          Description: formData.Description?.trim() || '',
          RequestUserName: currentUserName,
          Role_Code: formData.Role_Code.trim().toUpperCase(),
          UpdatedByUserName: currentUserName
        };
        const res = await roleService.updateRole(payload);

        // If status was toggled in edit form, update via updateRoleStatus route
        if (formData.IsDisabled !== Boolean(selectedRole?.IsDisabled)) {
          await roleService.updateRoleStatus(formData.RoleId, formData.IsDisabled);
        }

        showToast(res?.message || `Role "${formData.RoleName}" updated successfully!`);
      }
      setModalMode(null);
      await fetchData();
    } catch (err) {
      setError(err?.message || 'Failed to save role. Please check inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setActionLoading(true);
    setError(null);

    try {
      const roleId = selectedRole.RoleId || selectedRole.id;
      const res = await roleService.deleteRole(roleId);
      showToast(res?.message || 'Role deleted successfully!');
      setModalMode(null);
      setSelectedRole(null);
      await fetchData();
    } catch (err) {
      setError(err?.message || 'Failed to delete role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (role) => {
    const roleId = role.RoleId || role.id;
    const currentDisabled = Boolean(role.IsDisabled);
    const newDisabled = !currentDisabled;

    // Optimistic UI update
    setRoles((prev) =>
      prev.map((r) => (r.RoleId === roleId ? { ...r, IsDisabled: newDisabled } : r))
    );

    try {
      const res = await roleService.updateRoleStatus(roleId, newDisabled);
      showToast(
        res?.message ||
        `Role "${role.RoleName}" has been ${newDisabled ? 'disabled' : 'enabled'}.`
      );
    } catch (err) {
      setError(err?.message || 'Failed to update role status.');
      // Revert optimistic update
      setRoles((prev) =>
        prev.map((r) => (r.RoleId === roleId ? { ...r, IsDisabled: currentDisabled } : r))
      );
    }
  };

  // --------------------------------------------------------------------------
  // Filter & Search Computation
  // --------------------------------------------------------------------------
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const roleName = (role.RoleName || role.name || '').toLowerCase();
      const roleCode = (role.Role_Code || role.RoleCode || role.code || '').toLowerCase();
      const companyName = (role.CompanyName || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !query ||
        roleName.includes(query) ||
        roleCode.includes(query) ||
        companyName.includes(query);

      const matchesCompany =
        selectedCompanyFilter === 'ALL' ||
        String(role.CompanyId) === String(selectedCompanyFilter);

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ACTIVE' && !role.IsDisabled) ||
        (selectedStatusFilter === 'DISABLED' && role.IsDisabled);

      return matchesQuery && matchesCompany && matchesStatus;
    });
  }, [roles, searchQuery, selectedCompanyFilter, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => !r.IsDisabled).length;
    const disabled = roles.filter((r) => r.IsDisabled).length;
    const companyCount = new Set(roles.map((r) => r.CompanyId).filter(Boolean)).size;
    return { total, active, disabled, companyCount };
  }, [roles]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* -------------------------------------------------------------------- */}
      {/* Standardized Theme Page Header */}
      {/* -------------------------------------------------------------------- */}
      <PageHeader
        title="Roles & Permissions"
        description="Search, filter, and manage enterprise user roles, access authorization profiles, and company assignments."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Master', href: '/master/companies' },
          { label: 'Roles & Permissions' }
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              disabled={loading}
              className="text-xs"
            >
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={openAddModal}
              className="text-xs"
            >
              Add New Role
            </Button>
          </>
        }
      />

      {/* -------------------------------------------------------------------- */}
      {/* Flash Alerts */}
      {/* -------------------------------------------------------------------- */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs underline hover:no-underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Stats Summary Cards */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Roles</span>
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-400">Registered</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Active Roles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
            <span className="text-[10px] text-slate-400">Operational</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Disabled Roles</span>
            <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.disabled}
            </span>
            <span className="text-[10px] text-slate-400">Restricted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Companies</span>
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.companyCount}
            </span>
            <span className="text-[10px] text-slate-400">Associated</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Search & Filter Controls */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role name, code, company..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Roles Data Table */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Roles Catalog
            </span>
            <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
              {filteredRoles.length} {filteredRoles.length === 1 ? 'Role' : 'Roles'}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading roles from backend...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Roles Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCompanyFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
                ? 'No roles match your search or filter criteria. Try adjusting your filters.'
                : 'No roles have been created yet. Click "Add New Role" to create your first role.'}
            </p>
            {(searchQuery || selectedCompanyFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCompanyFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Role Details</th>
                  <th className="px-4 py-3.5">Role Code</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created By</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((role) => {
                  const roleId = role.RoleId || role.id;
                  const roleName = role.RoleName || role.name || 'Untitled Role';
                  const roleCode = role.RoleCode || role.Role_Code || role.code || 'N/A';
                  const roleDescription = role.RoleDescription || '';
                  const companyName = role.CompanyName || `Company #${role.CompanyId || '-'}`;
                  const isDisabled = Boolean(role.IsDisabled);
                  const createdBy = role.CreatedByUserName || role.RequestUserName || '';
                  const createdDate = role.CreatedAt || role.CreatedDate
                    ? new Date(role.CreatedAt || role.CreatedDate).toLocaleDateString()
                    : null;

                  return (
                    <tr
                      key={roleId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Role Details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isDisabled
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                              }`}
                          >
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              {roleName}
                            </span>
                            {roleDescription && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs block font-normal">
                                {roleDescription}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Code */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="neutral"
                          className="font-mono text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                        >
                          <Key className="w-3 h-3 mr-1 inline text-slate-400" />
                          {roleCode}
                        </Badge>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]" title={companyName}>
                            {companyName}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(role)}
                          className="cursor-pointer group/status flex items-center gap-1.5 focus:outline-none"
                          title="Click to toggle status"
                        >
                          {isDisabled ? (
                            <Badge
                              variant="danger"
                              className="text-[10px] px-2 py-0.5 group-hover/status:opacity-80"
                            >
                              <XCircle className="w-3 h-3 mr-1 inline" />
                              Disabled
                            </Badge>
                          ) : (
                            <Badge
                              variant="success"
                              className="text-[10px] px-2 py-0.5 group-hover/status:opacity-80"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                              Active
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Created By */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {createdBy}
                          </span>
                          {createdDate && <span className="text-[10px] text-slate-400">{createdDate}</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openViewModal(role)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Edit Role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(role)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredRoles.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Modal: Add or Edit Role */}
      {/* -------------------------------------------------------------------- */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <Modal
          isOpen={true}
          onClose={() => !actionLoading && setModalMode(null)}
          title={modalMode === 'add' ? 'Create New Role' : 'Update Role'}
          size="md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            {/* Role Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.RoleName}
                maxLength={50}
                onChange={handleRoleNameChange}
                placeholder="e.g., Operations Manager, Auditor, Super Admin"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${formErrors.RoleName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                required
              />
              {formErrors.RoleName && (
                <p className="text-[11px] text-red-500">{formErrors.RoleName}</p>
              )}
            </div>

            {/* Role Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Role Code *
              </label>
              <input
                type="text"
                value={formData.Role_Code}
                maxLength={10}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10).toUpperCase();
                  setFormData((prev) => ({
                    ...prev,
                    Role_Code: sanitized
                  }));
                  if (formErrors.Role_Code) {
                    setFormErrors((prev) => ({ ...prev, Role_Code: null }));
                  }
                }}
                placeholder="e.g., OPR, AUD, SADMIN"
                className={`w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border ${formErrors.Role_Code ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                required
              />
              {formErrors.Role_Code && (
                <p className="text-[11px] text-red-500">{formErrors.Role_Code}</p>
              )}
            </div>

            {/* Role Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Role Description
              </label>
              <textarea
                value={formData.Description}
                maxLength={300}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 300);
                  setFormData((prev) => ({ ...prev, Description: sanitized }));
                  if (formErrors.Description) setFormErrors((prev) => ({ ...prev, Description: null }));
                }}
                rows={3}
                placeholder="Enter role responsibilities (text only)..."
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none ${formErrors.Description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
              />
              {formErrors.Description && (
                <p className="text-[11px] text-red-500">{formErrors.Description}</p>
              )}
            </div>

            {/* Status Switch (Edit Mode) */}
            {modalMode === 'edit' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Role Status
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formData.IsDisabled ? 'Disabled (Access suspended)' : 'Active (Available for assignment)'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.IsDisabled}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, IsDisabled: !e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalMode(null)}
                disabled={actionLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4"
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : modalMode === 'add' ? (
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                {modalMode === 'add' ? 'Create Role' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Modal: View Role Details */}
      {/* -------------------------------------------------------------------- */}
      {modalMode === 'view' && selectedRole && (
        <Modal
          isOpen={true}
          onClose={() => setModalMode(null)}
          title="Role Inspection"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedRole.RoleName || selectedRole.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="neutral" className="font-mono text-[10px]">
                    {selectedRole.Role_Code || selectedRole.RoleCode || selectedRole.code}
                  </Badge>
                  {selectedRole.IsDisabled ? (
                    <Badge variant="danger" className="text-[10px]">Disabled</Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Role Code
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedRole.RoleCode || selectedRole.Role_Code || selectedRole.code || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Associated Company
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {selectedRole.CompanyName || 'Assigned Company'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Created By
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {selectedRole.CreatedByUserName || selectedRole.RequestUserName || ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Created Date
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {selectedRole.CreatedAt || selectedRole.CreatedDate
                    ? new Date(selectedRole.CreatedAt || selectedRole.CreatedDate).toLocaleString()
                    : 'Not Recorded'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalMode('edit');
                  setFormData({
                    RoleId: selectedRole.RoleId || selectedRole.id,
                    CompanyId: selectedRole.CompanyId || '',
                    RoleName: selectedRole.RoleName || selectedRole.name || '',
                    Role_Code: selectedRole.Role_Code || selectedRole.RoleCode || selectedRole.code || '',
                    IsDisabled: Boolean(selectedRole.IsDisabled)
                  });
                }}
                className="text-xs"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit This Role
              </Button>

              <Button
                variant="neutral"
                size="sm"
                onClick={() => setModalMode(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Modal: Delete Confirmation */}
      {/* -------------------------------------------------------------------- */}
      {modalMode === 'delete' && selectedRole && (
        <Modal
          isOpen={true}
          onClose={() => !actionLoading && setModalMode(null)}
          title="Confirm Role Deletion"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Delete Role "{selectedRole.RoleName || selectedRole.name}"?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete this role? This action cannot be undone.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalMode(null)}
                disabled={actionLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteRole}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4"
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                Yes, Delete Role
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

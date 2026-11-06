// src/pages/Master/CompanyRoleView.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PageHeader,
  Button,
  Badge
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { companyRoleService } from '../../services/companyRoleService';
import { useERPStore } from '../../store/useERPStore';
import { validateTextOnly } from '../../utils/validators';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  Plus,
  Pencil
} from 'lucide-react';
import { getSessionCompanyId, getSessionCompany } from '../../services/departmentService';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateString);
  }
};

export default function CompanyRoleView() {
  const showToast = useERPStore((state) => state.showToast);

  // Dynamic session company detection
  const sessionCompanyId = getSessionCompanyId();
  const sessionCompany = getSessionCompany();
  const sessionCompanyName = sessionCompany?.CompanyName || sessionCompany?.name || '';
  const hasSessionCompany = Boolean(sessionCompanyId);

  const [companyRoles, setCompanyRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View modal state
  const [viewRecord, setViewRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCompanyId, setAddCompanyId] = useState(sessionCompanyId ? String(sessionCompanyId) : '');
  const [addRoleId, setAddRoleId] = useState('');
  const [addErrors, setAddErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editRoleId, setEditRoleId] = useState('');
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleCode, setEditRoleCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [masterRoles, setMasterRoles] = useState([]);

  const isFetchingRef = useRef(false);

  /**
   * Fetch company roles list (POST /verp-service/companyRole/view with { FlagId: 1 })
   */
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await companyRoleService.getCompanyRoles({ FlagId: 1 });
      const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setCompanyRoles(list);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch company roles', 'error');
      setCompanyRoles([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Fetch master roles dropdown
   */
  const fetchMasterRoles = useCallback(async () => {
    try {
      const list = await companyRoleService.getRolesDropdown();
      setMasterRoles(list);
    } catch {
      setMasterRoles([]);
    }
  }, []);

  /**
   * Fetch companies dropdown
   */
  const fetchCompanies = useCallback(async () => {
    try {
      const list = await companyRoleService.getCompaniesDropdown();
      setCompanies(list);
      if (list.length > 0 && !addCompanyId) {
        setAddCompanyId(String(list[0].CompanyId));
      }
    } catch {
      setCompanies([]);
    }
  }, [addCompanyId]);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    fetchRoles();
    fetchCompanies();
    fetchMasterRoles();
  }, [fetchRoles, fetchCompanies, fetchMasterRoles]);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return companyRoles;
    const q = searchTerm.toLowerCase().trim();
    return companyRoles.filter((r) => {
      const name = String(r.RoleName || '').toLowerCase();
      const code = String(r.RoleCode || '').toLowerCase();
      const comp = String(r.CompanyName || '').toLowerCase();
      const desc = String(r.RoleDescription || r.Description || '').toLowerCase();
      return name.includes(q) || code.includes(q) || comp.includes(q) || desc.includes(q);
    });
  }, [companyRoles, searchTerm]);

  // Add Handlers
  const handleOpenAddModal = () => {
    fetchMasterRoles();
    setAddRoleId(masterRoles.length > 0 ? String(masterRoles[0].RoleId) : '');
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddErrors({});
  };

  // Add Submit Handler (POST /verp-service/companyRole/add with { FlagId: 2, RoleId, CompanyId, CreatedByUserName })
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!addRoleId || isNaN(Number(addRoleId)) || Number(addRoleId) <= 0) {
      errs.roleId = 'Please select a Role';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    const effectiveCompanyId = sessionCompanyId
      ? Number(sessionCompanyId)
      : (companies.length > 0 ? Number(companies[0].CompanyId) : 1);

    setSubmitting(true);
    try {
      const res = await companyRoleService.addCompanyRole({
        FlagId: 2,
        CompanyId: effectiveCompanyId,
        RoleId: Number(addRoleId)
      });
      const msg = res?.data?.message || res?.message || 'Company role added successfully';
      showToast(msg, 'success');
      setIsAddModalOpen(false);
      await fetchRoles();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to add company role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Handlers
  const handleOpenEditModal = (record) => {
    fetchMasterRoles();
    setEditRecord(record);
    const initialRoleId = record.RoleId !== undefined && record.RoleId !== null && record.RoleId !== '' 
      ? String(record.RoleId) 
      : (masterRoles.length > 0 ? String(masterRoles[0].RoleId) : '1');
    setEditRoleId(initialRoleId);
    setEditCompanyId(String(record.CompanyId || ''));
    setEditRoleName(record.RoleName || '');
    setEditRoleCode(record.RoleCode || '');
    setEditDescription(record.RoleDescription || record.Description || '');
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditRecord(null);
    setEditErrors({});
  };

  // Edit Submit Handler (PATCH /verp-service/companyRole/edit with { FlagId: 3, CompanyRoleId, RoleId, UpdatedByUserName })
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!editRoleId || isNaN(Number(editRoleId))) {
      errs.roleId = 'Please select a valid Role';
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await companyRoleService.editCompanyRole({
        FlagId: 3,
        CompanyRoleId: Number(editRecord.CompanyRoleId ?? editRecord.id),
        RoleId: Number(editRoleId)
      });
      const msg = res?.data?.message || res?.message || 'Company role updated successfully';
      showToast(msg, 'success');
      setIsEditModalOpen(false);
      setEditRecord(null);
      await fetchRoles();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Handler (PATCH /verp-service/companyRole/status with { FlagId: 4, CompanyRoleId, IsDisabled })
  const handleToggleStatus = async (record) => {
    const id = record.CompanyRoleId ?? record.id;
    const currentlyDisabled = record.IsDisabled === true || record.status === 'Inactive' || record.status === 'Disabled';
    const newIsDisabled = !currentlyDisabled;

    try {
      const res = await companyRoleService.toggleCompanyRoleStatus({
        FlagId: 4,
        CompanyRoleId: Number(id),
        IsDisabled: newIsDisabled
      });
      const msg = res?.data?.message || res?.message || `Company role ${newIsDisabled ? 'disabled' : 'enabled'} successfully!`;
      showToast(msg, 'success');
      setCompanyRoles((prev) =>
        prev.map((item) =>
          (item.CompanyRoleId ?? item.id) === id ? { ...item, IsDisabled: newIsDisabled } : item
        )
      );
      fetchRoles();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', 'error');
    }
  };

  // Table Columns
  const columns = useMemo(() => [
    {
      header: 'SL NO',
      accessorKey: 'CompanyRoleId',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
          {row.index + 1}
        </span>
      )
    },
    {
      header: 'COMPANY',
      accessorKey: 'CompanyName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {row.original.CompanyName || 'All Companies'}
          </span>
        </div>
      )
    },
    {
      header: 'ROLE NAME',
      accessorKey: 'RoleName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {row.original.RoleName || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'ROLE CODE',
      accessorKey: 'RoleCode',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
          <Tag className="w-3 h-3 text-indigo-500" />
          {row.original.RoleCode || '—'}
        </span>
      )
    },
    {
      header: 'DESCRIPTION',
      accessorKey: 'RoleDescription',
      cell: ({ row }) => {
        const desc = row.original.RoleDescription || row.original.Description || '—';
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate block" title={desc}>
            {desc}
          </span>
        );
      }
    },
    {
      header: 'STATUS',
      accessorKey: 'IsDisabled',
      cell: ({ row }) => {
        const isDisabled = row.original.IsDisabled === true || row.original.status === 'Inactive' || row.original.status === 'Disabled';
        return (
          <Badge variant={isDisabled ? 'neutral' : 'success'} className="font-semibold text-xs">
            {isDisabled ? 'Inactive' : 'Active'}
          </Badge>
        );
      }
    },
    {
      header: 'CREATED AT',
      accessorKey: 'CreatedAt',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.original.CreatedAt)}</span>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. Page Header */}
      <PageHeader
        title="Company Roles"
        description="Manage corporate company roles, assign role codes, and configure access permissions."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Company Roles' }
        ]}
      />

      {/* 2. Company Role Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        onAddClick={handleOpenAddModal}
        onEditClick={handleOpenEditModal}
        onToggleStatusClick={handleToggleStatus}
        onViewClick={(row) => {
          setViewRecord(row);
          setIsViewModalOpen(true);
        }}
        searchPlaceholder="Search by role name, code, company, description..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchRoles}
        hideExport
      />

      {/* 3. Add Company Role Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Company Role"
        size="md"
        actions={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCloseAddModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-company-role-form"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Role'}
            </Button>
          </div>
        }
      >
        <form id="add-company-role-form" onSubmit={handleAddSubmit} className="space-y-4">
          {/* Master Role Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Master Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={addRoleId}
                onChange={(e) => {
                  setAddRoleId(e.target.value);
                  setAddErrors((prev) => ({ ...prev, roleId: '' }));
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  addErrors.roleId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
              >
                <option value="">— Select Master Role —</option>
                {masterRoles.map((r) => (
                  <option key={r.RoleId} value={r.RoleId}>
                    {r.RoleName} {r.RoleCode ? `(${r.RoleCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {addErrors.roleId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.roleId}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {/* 4. Edit Company Role Modal */}
      {isEditModalOpen && editRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Company Role — ${editRecord.RoleName || editRecord.RoleCode || ''}`}
          size="md"
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-company-role-form"
                variant="primary"
                size="sm"
                icon={Pencil}
                disabled={submitting}
              >
                {submitting ? 'Saving Edits...' : 'Save Edits'}
              </Button>
            </div>
          }
        >
          <form id="edit-company-role-form" onSubmit={handleEditSubmit} className="space-y-4">
            {/* Context Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Current Role
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {editRecord.RoleName || '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Company
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {editRecord.CompanyName || 'All Companies'}
                </span>
              </div>
            </div>

            {/* Master Role Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Select Master Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={editRoleId}
                  onChange={(e) => {
                    setEditRoleId(e.target.value);
                    setEditErrors((prev) => ({ ...prev, roleId: '' }));
                    const sel = masterRoles.find(r => String(r.RoleId) === String(e.target.value));
                    if (sel) {
                      setEditRoleName(sel.RoleName || '');
                      setEditRoleCode(sel.RoleCode || '');
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editErrors.roleId
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
                >
                  <option value="">— Select Role —</option>
                  {editRecord.RoleId && !masterRoles.some(r => String(r.RoleId) === String(editRecord.RoleId)) && (
                    <option value={editRecord.RoleId}>
                      {editRecord.RoleName || 'Current Role'}
                    </option>
                  )}
                  {masterRoles.map((r) => (
                    <option key={r.RoleId} value={r.RoleId}>
                      {r.RoleName} {r.RoleCode ? `(${r.RoleCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {editErrors.roleId && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editErrors.roleId}
                </span>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* 5. View Details Modal */}
      {isViewModalOpen && viewRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Company Role Details — ${viewRecord.RoleName || viewRecord.RoleCode || ''}`}
          size="md"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Role Code
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {viewRecord.RoleCode || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Company
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  {viewRecord.CompanyName || 'All Companies'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Role Name
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {viewRecord.RoleName || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Description
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                  {viewRecord.RoleDescription || viewRecord.Description || 'No description provided.'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Status
                </span>
                <div className="mt-1">
                  <Badge variant={viewRecord.IsDisabled ? 'neutral' : 'success'}>
                    {viewRecord.IsDisabled ? 'Inactive' : 'Active'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Created By
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block">
                  {viewRecord.CreatedByUserName || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Created Date
                </span>
                <span className="text-slate-600 dark:text-slate-400 mt-1 block">
                  {formatDate(viewRecord.CreatedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Last Updated
                </span>
                <span className="text-slate-600 dark:text-slate-400 mt-1 block">
                  {formatDate(viewRecord.UpdatedAt)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


// src/pages/Master/CompanyDepartmentView.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PageHeader,
  Button,
  Badge
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { companyDepartmentService, extractArray } from '../../services/companyDepartmentService';
import { useERPStore } from '../../store/useERPStore';
import {
  Building2,
  Calendar,
  Tag,
  AlertCircle,
  Plus,
  Pencil,
  Lock,
  Network
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

export default function CompanyDepartmentView() {
  const showToast = useERPStore((state) => state.showToast);

  // Dynamic session company detection
  const sessionCompanyId = getSessionCompanyId();
  const sessionCompany = getSessionCompany();
  const sessionCompanyName = sessionCompany?.CompanyName || sessionCompany?.name || '';
  const hasSessionCompany = Boolean(sessionCompanyId);

  const [companyDepartments, setCompanyDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [masterDepartments, setMasterDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View modal state
  const [viewRecord, setViewRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCompanyId, setAddCompanyId] = useState(sessionCompanyId ? String(sessionCompanyId) : '');
  const [addDepartmentId, setAddDepartmentId] = useState('');
  const [addErrors, setAddErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editErrors, setEditErrors] = useState({});

  const isFetchingRef = useRef(false);

  /**
   * Fetch company departments list (POST /verp-service/department/view with { flagId: 1 })
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await companyDepartmentService.getCompanyDepartments({
        flagId: 1,
        ...(hasSessionCompany ? { CompanyId: Number(sessionCompanyId) } : {})
      });
      const list = extractArray(res);
      const normalizedList = list.map((item) => {
        const rawDisabled = item.IsDisabled ?? item.IsDsiabled ?? item.isDisabled ?? item.isDsiabled;
        const isDisabled = Boolean(Number(rawDisabled)) || 
          rawDisabled === true || 
          rawDisabled === 'true' || 
          rawDisabled === 1 || 
          item.status === 'Inactive' || 
          item.status === 'Disabled';

        return {
          ...item,
          CompanyDepartmentId: item.CompanyDepartmentId ?? item.ComapnyDepartmentId ?? item.id,
          ComapnyDepartmentId: item.ComapnyDepartmentId ?? item.CompanyDepartmentId ?? item.id,
          IsDisabled: isDisabled,
          IsDsiabled: isDisabled,
          isEnabled: !isDisabled,
          status: isDisabled ? 'Inactive' : 'Active'
        };
      });
      setCompanyDepartments(normalizedList);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch company departments', 'error');
      setCompanyDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [hasSessionCompany, sessionCompanyId, showToast]);

  /**
   * Fetch master departments dropdown
   */
  const fetchMasterDepartments = useCallback(async () => {
    try {
      const list = await companyDepartmentService.getDepartmentsDropdown();
      setMasterDepartments(list);
    } catch {
      setMasterDepartments([]);
    }
  }, []);

  /**
   * Fetch companies dropdown
   */
  const fetchCompanies = useCallback(async () => {
    try {
      const list = await companyDepartmentService.getCompaniesDropdown();
      setCompanies(list || []);
      if (list && list.length > 0 && !addCompanyId) {
        setAddCompanyId(String(list[0].CompanyId));
      }
    } catch {
      setCompanies([]);
    }
  }, [addCompanyId]);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    fetchDepartments();
    fetchCompanies();
    fetchMasterDepartments();
  }, [fetchDepartments, fetchCompanies, fetchMasterDepartments]);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return companyDepartments;
    const q = searchTerm.toLowerCase().trim();
    return companyDepartments.filter((d) => {
      const dept = masterDepartments.find((md) => Number(md.DepartmentId) === Number(d.DepartmentId));
      const comp = companies.find((c) => Number(c.CompanyId) === Number(d.CompanyId));

      const name = String(d.DepartmentName || d.name || dept?.DepartmentName || '').toLowerCase();
      const code = String(d.DepartmentCode || d.code || dept?.DepartmentCode || '').toLowerCase();
      const compName = String(d.CompanyName || comp?.CompanyName || '').toLowerCase();
      return name.includes(q) || code.includes(q) || compName.includes(q);
    });
  }, [companyDepartments, searchTerm, masterDepartments, companies]);

  // Add Handlers
  const handleOpenAddModal = () => {
    fetchMasterDepartments();
    fetchCompanies();
    setAddCompanyId(sessionCompanyId ? String(sessionCompanyId) : (companies.length > 0 ? String(companies[0].CompanyId) : ''));
    setAddDepartmentId(masterDepartments.length > 0 ? String(masterDepartments[0].DepartmentId) : '');
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddErrors({});
  };

  // Add Submit Handler (POST /verp-service/department/add with { flagId: 1, CompanyId, DepartmentId, CreatedByUserName })
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const effectiveCompanyId = hasSessionCompany
      ? Number(sessionCompanyId)
      : Number(addCompanyId);

    if (!effectiveCompanyId || isNaN(effectiveCompanyId) || effectiveCompanyId <= 0) {
      errs.companyId = 'Please select a Company';
    }

    if (!addDepartmentId || isNaN(Number(addDepartmentId)) || Number(addDepartmentId) <= 0) {
      errs.departmentId = 'Please select a Department';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await companyDepartmentService.addCompanyDepartment({
        flagId: 1,
        CompanyId: effectiveCompanyId,
        DepartmentId: Number(addDepartmentId)
      });
      const msg = res?.data?.message || res?.message || 'Company department inserted successfully';
      showToast(msg, 'success');
      setIsAddModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to add company department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Handlers
  const handleOpenEditModal = (record) => {
    fetchMasterDepartments();
    fetchCompanies();
    setEditRecord(record);
    const initialDeptId = record.DepartmentId !== undefined && record.DepartmentId !== null && record.DepartmentId !== '' 
      ? String(record.DepartmentId) 
      : (masterDepartments.length > 0 ? String(masterDepartments[0].DepartmentId) : '');
    setEditDepartmentId(initialDeptId);
    setEditCompanyId(hasSessionCompany ? String(sessionCompanyId) : String(record.CompanyId || ''));
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditRecord(null);
    setEditErrors({});
  };

  // Edit Submit Handler (PATCH /verp-service/companyDepartment/edit with { FlagId: 3, CompanyDepartmentId, DepartmentId, CompanyId, UpdatedByUserName })
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const effectiveCompanyId = hasSessionCompany
      ? Number(sessionCompanyId)
      : Number(editCompanyId || editRecord.CompanyId);

    if (!effectiveCompanyId || isNaN(effectiveCompanyId) || effectiveCompanyId <= 0) {
      errs.companyId = 'Please select a valid Company';
    }

    if (!editDepartmentId || isNaN(Number(editDepartmentId))) {
      errs.departmentId = 'Please select a valid Department';
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await companyDepartmentService.editCompanyDepartment({
        flagId: 2,
        ComapnyDepartmentId: Number(editRecord.CompanyDepartmentId ?? editRecord.ComapnyDepartmentId ?? editRecord.id),
        CompanyId: effectiveCompanyId,
        DepartmentId: Number(editDepartmentId)
      });
      const msg = res?.data?.message || res?.message || 'Company department updated successfully';
      showToast(msg, 'success');
      setIsEditModalOpen(false);
      setEditRecord(null);
      await fetchDepartments();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Handler (PATCH /verp-service/department/status with { flagId: 3, ComapnyDepartmentId, IsDisabled, UpdateByUserName })
  const handleToggleStatus = async (record) => {
    const id = record.CompanyDepartmentId ?? record.ComapnyDepartmentId ?? record.id;
    const currentlyDisabled = Boolean(Number(record.IsDisabled ?? record.IsDsiabled)) || 
      record.IsDisabled === true || 
      record.IsDsiabled === true || 
      record.IsDisabled === 'true' || 
      record.status === 'Inactive' || 
      record.status === 'Disabled';
    const newIsDisabled = !currentlyDisabled;

    // Immediate optimistic UI update
    setCompanyDepartments((prev) =>
      prev.map((item) => {
        const itemId = item.CompanyDepartmentId ?? item.ComapnyDepartmentId ?? item.id;
        if (itemId === id) {
          return {
            ...item,
            IsDisabled: newIsDisabled,
            IsDsiabled: newIsDisabled,
            isEnabled: !newIsDisabled,
            status: newIsDisabled ? 'Inactive' : 'Active'
          };
        }
        return item;
      })
    );

    try {
      const res = await companyDepartmentService.toggleCompanyDepartmentStatus({
        flagId: 3,
        ComapnyDepartmentId: Number(id),
        IsDisabled: newIsDisabled
      });
      const msg = res?.data?.message || res?.message || `Company department ${newIsDisabled ? 'disabled' : 'enabled'} successfully!`;
      showToast(msg, 'success');
      await fetchDepartments();
    } catch (err) {
      // Revert optimistic update on failure
      setCompanyDepartments((prev) =>
        prev.map((item) => {
          const itemId = item.CompanyDepartmentId ?? item.ComapnyDepartmentId ?? item.id;
          if (itemId === id) {
            return {
              ...item,
              IsDisabled: currentlyDisabled,
              IsDsiabled: currentlyDisabled,
              isEnabled: !currentlyDisabled,
              status: currentlyDisabled ? 'Inactive' : 'Active'
            };
          }
          return item;
        })
      );
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', 'error');
    }
  };

  // Table Columns
  const columns = useMemo(() => [
    {
      header: 'SL NO',
      accessorKey: 'CompanyDepartmentId',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
          {row.index + 1}
        </span>
      )
    },
    {
      header: 'COMPANY',
      accessorKey: 'CompanyName',
      cell: ({ row }) => {
        const comp = row.original.CompanyName || companies.find((c) => Number(c.CompanyId) === Number(row.original.CompanyId))?.CompanyName;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {comp || (row.original.CompanyId ? `Company #${row.original.CompanyId}` : 'All Companies')}
            </span>
          </div>
        );
      }
    },
    {
      header: 'DEPARTMENT NAME',
      accessorKey: 'DepartmentName',
      cell: ({ row }) => {
        const dept = masterDepartments.find((d) => Number(d.DepartmentId) === Number(row.original.DepartmentId));
        const deptName = row.original.DepartmentName || row.original.name || dept?.DepartmentName;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Network className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              {deptName || (row.original.DepartmentId ? `Department #${row.original.DepartmentId}` : '—')}
            </span>
          </div>
        );
      }
    },
    {
      header: 'DEPARTMENT CODE',
      accessorKey: 'DepartmentCode',
      cell: ({ row }) => {
        const dept = masterDepartments.find((d) => Number(d.DepartmentId) === Number(row.original.DepartmentId));
        const deptCode = row.original.DepartmentCode || row.original.code || dept?.DepartmentCode;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <Tag className="w-3 h-3 text-indigo-500" />
            {deptCode || '—'}
          </span>
        );
      }
    },
    {
      header: 'STATUS',
      accessorKey: 'IsDisabled',
      cell: ({ row }) => {
        const isDisabled = Boolean(Number(row.original.IsDisabled ?? row.original.IsDsiabled)) || 
          row.original.IsDisabled === true || 
          row.original.IsDsiabled === true || 
          row.original.IsDisabled === 'true' || 
          row.original.status === 'Inactive' || 
          row.original.status === 'Disabled';
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
          <span>{formatDate(row.original.CreatedAt || row.original.CreateAt)}</span>
        </div>
      )
    }
  ], [companies, masterDepartments]);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. Page Header */}
      <PageHeader
        title="Company Departments"
        description="Manage corporate company departments, assign department units, and configure departmental mappings."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Company Departments' }
        ]}
      />

      {/* 2. Company Department Data Table */}
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
        searchPlaceholder="Search by department name, code, company..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchDepartments}
        hideExport
      />

      {/* 3. Add Company Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Company Department"
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
              form="add-company-department-form"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Department'}
            </Button>
          </div>
        }
      >
        <form id="add-company-department-form" onSubmit={handleAddSubmit} className="space-y-4">
          {/* Company Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Company <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={hasSessionCompany ? String(sessionCompanyId) : addCompanyId}
                onChange={(e) => {
                  if (!hasSessionCompany) {
                    setAddCompanyId(e.target.value);
                    setAddErrors((prev) => ({ ...prev, companyId: '' }));
                  }
                }}
                disabled={hasSessionCompany}
                className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border ${
                  addErrors.companyId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium ${
                  hasSessionCompany ? 'opacity-80 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80' : 'cursor-pointer'
                }`}
              >
                {hasSessionCompany && !companies.some((c) => String(c.CompanyId) === String(sessionCompanyId)) && (
                  <option value={String(sessionCompanyId)}>
                    {sessionCompanyName || `Company #${sessionCompanyId}`}
                  </option>
                )}
                {!hasSessionCompany && <option value="">— Select Company —</option>}
                {companies.map((c) => (
                  <option key={c.CompanyId} value={c.CompanyId}>
                    {c.CompanyName}
                  </option>
                ))}
              </select>
              {hasSessionCompany && (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              )}
            </div>
            {addErrors.companyId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.companyId}
              </span>
            )}
          </div>

          {/* Master Department Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={addDepartmentId}
                onChange={(e) => {
                  setAddDepartmentId(e.target.value);
                  setAddErrors((prev) => ({ ...prev, departmentId: '' }));
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  addErrors.departmentId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
              >
                <option value="">— Select Department —</option>
                {masterDepartments.map((d) => (
                  <option key={d.DepartmentId} value={d.DepartmentId}>
                    {d.DepartmentName} {d.DepartmentCode ? `(${d.DepartmentCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {addErrors.departmentId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.departmentId}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {/* 4. Edit Company Department Modal */}
      {isEditModalOpen && editRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Company Department — ${editRecord.DepartmentName || editRecord.DepartmentCode || ''}`}
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
                form="edit-company-department-form"
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
          <form id="edit-company-department-form" onSubmit={handleEditSubmit} className="space-y-4">
            {/* Company Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Company <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={hasSessionCompany ? String(sessionCompanyId) : editCompanyId}
                  onChange={(e) => {
                    if (!hasSessionCompany) {
                      setEditCompanyId(e.target.value);
                      setEditErrors((prev) => ({ ...prev, companyId: '' }));
                    }
                  }}
                  disabled={hasSessionCompany}
                  className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border ${
                    editErrors.companyId
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium ${
                    hasSessionCompany ? 'opacity-80 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80' : 'cursor-pointer'
                  }`}
                >
                  {hasSessionCompany && !companies.some((c) => String(c.CompanyId) === String(sessionCompanyId)) && (
                    <option value={String(sessionCompanyId)}>
                      {sessionCompanyName || `Company #${sessionCompanyId}`}
                    </option>
                  )}
                  {!hasSessionCompany && <option value="">— Select Company —</option>}
                  {companies.map((c) => (
                    <option key={c.CompanyId} value={c.CompanyId}>
                      {c.CompanyName}
                    </option>
                  ))}
                  {editCompanyId && !companies.some((c) => String(c.CompanyId) === String(editCompanyId)) && (
                    <option value={editCompanyId}>
                      {editRecord?.CompanyName || `Company #${editCompanyId}`}
                    </option>
                  )}
                </select>
                {hasSessionCompany && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                )}
              </div>
              {editErrors.companyId && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editErrors.companyId}
                </span>
              )}
            </div>

            {/* Master Department Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Select Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={editDepartmentId}
                  onChange={(e) => {
                    setEditDepartmentId(e.target.value);
                    setEditErrors((prev) => ({ ...prev, departmentId: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editErrors.departmentId
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
                >
                  <option value="">— Select Department —</option>
                  {editRecord.DepartmentId && !masterDepartments.some(d => String(d.DepartmentId) === String(editRecord.DepartmentId)) && (
                    <option value={editRecord.DepartmentId}>
                      {editRecord.DepartmentName || 'Current Department'}
                    </option>
                  )}
                  {masterDepartments.map((d) => (
                    <option key={d.DepartmentId} value={d.DepartmentId}>
                      {d.DepartmentName} {d.DepartmentCode ? `(${d.DepartmentCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {editErrors.departmentId && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editErrors.departmentId}
                </span>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* 5. View Details Modal */}
      {isViewModalOpen && viewRecord && (() => {
        const viewDept = masterDepartments.find((d) => Number(d.DepartmentId) === Number(viewRecord.DepartmentId));
        const viewComp = companies.find((c) => Number(c.CompanyId) === Number(viewRecord.CompanyId));
        const deptName = viewRecord.DepartmentName || viewRecord.name || viewDept?.DepartmentName || '—';
        const deptCode = viewRecord.DepartmentCode || viewRecord.code || viewDept?.DepartmentCode || '—';
        const compName = viewRecord.CompanyName || viewComp?.CompanyName || (viewRecord.CompanyId ? `Company #${viewRecord.CompanyId}` : 'All Companies');

        return (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title={`Company Department Details — ${deptName}`}
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
                    Department Code
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mt-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {deptCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Company
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    {compName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Department Name
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                    {deptName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Status
                  </span>
                  <div className="mt-1">
                    <Badge variant={(viewRecord.IsDisabled ?? viewRecord.IsDsiabled) ? 'neutral' : 'success'}>
                      {(viewRecord.IsDisabled ?? viewRecord.IsDsiabled) ? 'Inactive' : 'Active'}
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
                    {formatDate(viewRecord.CreatedAt || viewRecord.CreateAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Last Updated By
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block">
                    {viewRecord.UpdatedByUserName || viewRecord.UpdateByUserName || '—'}
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
        );
      })()}
    </div>
  );
}


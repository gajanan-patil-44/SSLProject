// src/pages/Master/DepartmentView.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PageHeader,
  Button,
  StatusBadge
} from '../../components/ui/index';
import { Modal } from '../../components/ui/Modal';
import EditDepartmentModal from './EditDepartmentModal';
import { DataTable } from '../../components/ui/DataTable';
import { departmentService } from '../../services/departmentService';
import { useERPStore } from '../../store/useERPStore';
import { validateTextOnly } from '../../utils/validators';
import {
  Building2,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Check
} from 'lucide-react';

export default function DepartmentView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // Helper to extract session username dynamically
  const getSessionUserName = () => {
    try {
      const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
      if (raw) {
        const s = JSON.parse(raw);
        const u = s?.data?.user || s?.user || s;
        return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || u?.username || '';
      }
      const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
      return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || u?.username || '';
    } catch {
      return '';
    }
  };

  // State
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Department Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDepartmentName, setAddDepartmentName] = useState('');
  const [addDepartmentCode, setAddDepartmentCode] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit Department Modal state (Opens in separate component)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleOpenEditModal = (department) => {
    setEditingDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDepartment(null);
  };

  // Toggle department status via /verp-service/department/toggleDepartmentStatus (flagId: 4)
  const handleToggleStatus = async (department) => {
    const departmentId = Number(department.DepartmentId ?? department.id);
    const currentIsDisabled = Boolean(department.IsDisabled);
    const newIsDisabled = !currentIsDisabled;

    setTogglingId(departmentId);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';

      const payload = {
        flagId: 4,
        DepartmentId: departmentId,
        IsDisabled: newIsDisabled,
        UpdatedByUserName: sessionUserName
      };

      const res = await departmentService.toggleDepartmentStatus(payload);
      const msg = res?.message || res?.data?.message || `Department ${newIsDisabled ? 'disabled' : 'enabled'} successfully!`;
      showToast(msg, 'success');

      await fetchDepartments();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update department status';
      showToast(errMsg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Ref guard to prevent duplicate API calls on mount/remount
  const isFetchingRef = useRef(false);

  const fetchDepartments = useCallback(async () => {
    try {
      // Hit /verp-service/department/getDepartment with { flagId: 1 }
      const res = await departmentService.getDepartments({ flagId: 1 });
      const rawList = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(rawList) ? rawList : [];
      setDepartments(list);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch departments', 'error');
      setDepartments([]);
    }
  }, [showToast]);

  // Coordinated single-pass data load
  const loadInitialData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      await fetchDepartments();
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchDepartments]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleOpenAddModal = () => {
    setAddDepartmentName('');
    setAddDepartmentCode('');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormErrors({});
  };

  const validateAddForm = () => {
    const errs = {};

    const codeTrim = addDepartmentCode.trim();
    if (!codeTrim) {
      errs.departmentCode = 'Department code is required';
    } else if (codeTrim.length < 2) {
      errs.departmentCode = 'Department code must be at least 2 characters';
    } else if (codeTrim.length > 50) {
      errs.departmentCode = 'Department code must not exceed 50 characters';
    }

    const nameErr = validateTextOnly(addDepartmentName, 'Department Name', true, 2, 100);
    if (nameErr) errs.departmentName = nameErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add Department via /verp-service/department/addDepartment (flagId: 2)
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateAddForm()) return;

    setSubmitting(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';

      const payload = {
        flagId: 2,
        DepartmentName: addDepartmentName.trim(),
        DepartmentCode: addDepartmentCode.trim(),
        CreatedByUserName: sessionUserName
      };

      const res = await departmentService.addDepartment(payload);
      const successMsg = res?.message || res?.data?.message || 'Department added successfully!';
      showToast(successMsg, 'success');

      setIsAddModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to add department';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered dataset for DataTable based on live search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return departments;
    const term = searchTerm.trim().toLowerCase();

    return departments.filter((item) => {
      const code = String(item.DepartmentCode || '').toLowerCase();
      const name = String(item.DepartmentName || '').toLowerCase();
      const createdBy = String(item.CreatedByUserName || '').toLowerCase();

      return (
        code.includes(term) ||
        name.includes(term) ||
        createdBy.includes(term)
      );
    });
  }, [departments, searchTerm]);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  // Table Columns Definition (without Company column)
  const columns = useMemo(() => [
    {
      header: 'DEPARTMENT CODE',
      accessorKey: 'DepartmentCode',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
          <Tag className="w-3 h-3 text-indigo-500" />
          {row.original.DepartmentCode || '—'}
        </span>
      )
    },
    {
      header: 'DEPARTMENT NAME',
      accessorKey: 'DepartmentName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {row.original.DepartmentName}
          </span>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessorKey: 'IsDisabled',
      cell: ({ row }) => (
        <StatusBadge status={row.original.IsDisabled ? 'Disabled' : 'Active'} />
      )
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
    },
    {
      header: 'CREATED BY',
      accessorKey: 'CreatedByUserName',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.original.CreatedByUserName || '—'}</span>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. Header */}
      <PageHeader
        title="Department"
        description="View and oversee corporate departments, identification codes, and corporate divisions."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Department' }
        ]}
      />

      {/* 2. Departments Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        onAddClick={handleOpenAddModal}
        onEditClick={(row) => handleOpenEditModal(row)}
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search by department name, code..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchDepartments}
        hideExport
      />

      {/* 3. Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Department"
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
              type="button"
              variant="primary"
              size="sm"
              icon={Check}
              loading={submitting}
              onClick={handleAddSubmit}
            >
              Create Department
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
          {/* Department Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Department Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={addDepartmentCode}
                maxLength={20}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20).toUpperCase();
                  setAddDepartmentCode(sanitized);
                  setFormErrors((prev) => ({ ...prev, departmentCode: '' }));
                }}
                placeholder="e.g. HR002"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.departmentCode
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-mono uppercase`}
              />
            </div>
            {formErrors.departmentCode && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.departmentCode}
              </span>
            )}
          </div>

          {/* Department Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={addDepartmentName}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                  setAddDepartmentName(sanitized);
                  setFormErrors((prev) => ({ ...prev, departmentName: '' }));
                }}
                placeholder="e.g. Human Resources"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.departmentName
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
              />
            </div>
            {formErrors.departmentName && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.departmentName}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {/* 4. Edit Department Modal */}
      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        department={editingDepartment}
        onSaveSuccess={fetchDepartments}
      />
    </div>
  );
}

// src/pages/Master/DesignationView.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PageHeader,
  Button,
  Badge
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { designationService } from '../../services/designationService';
import { useERPStore } from '../../store/useERPStore';
import { validateTextOnly } from '../../utils/validators';
import {
  Briefcase,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  Plus,
  Pencil
} from 'lucide-react';

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

export default function DesignationView() {
  const showToast = useERPStore((state) => state.showToast);

  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View modal state
  const [viewRecord, setViewRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDesignationCode, setAddDesignationCode] = useState('');
  const [addDesignationName, setAddDesignationName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editDesignationCode, setEditDesignationCode] = useState('');
  const [editDesignationName, setEditDesignationName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFormErrors, setEditFormErrors] = useState({});

  const isFetchingRef = useRef(false);

  /**
   * Fetch designations via POST /verp-service/designationCreation/view with { flagId: 1 }
   */
  const fetchDesignations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await designationService.getDesignations({ flagId: 1 });
      const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setDesignations(list);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch designations', 'error');
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    fetchDesignations();
  }, [fetchDesignations]);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return designations;
    const q = searchTerm.toLowerCase().trim();
    return designations.filter((d) => {
      const name = String(d.DesignationName || '').toLowerCase();
      const code = String(d.DesignationCode || '').toLowerCase();
      const desc = String(d.DesignationDescription || '').toLowerCase();
      return name.includes(q) || code.includes(q) || desc.includes(q);
    });
  }, [designations, searchTerm]);

  // Add form handlers
  const handleOpenAddModal = () => {
    setAddDesignationCode('');
    setAddDesignationName('');
    setAddDescription('');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormErrors({});
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const code = addDesignationCode.trim();
    if (!code) {
      errs.code = 'Designation code is required';
    } else if (code.length < 2) {
      errs.code = 'Designation code must be at least 2 characters';
    }

    const nameErr = validateTextOnly(addDesignationName, 'Designation Name', true, 2, 100);
    if (nameErr) errs.name = nameErr;

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await designationService.addDesignation({
        flagId: 2,
        DesignationCode: code,
        DesignationName: addDesignationName.trim(),
        DesignationDescription: addDescription.trim(),
        IsDisabled: false
      });
      showToast('Designation created successfully!', 'success');
      setIsAddModalOpen(false);
      await fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to create designation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit form handlers
  const handleOpenEditModal = (record) => {
    setEditRecord(record);
    setEditDesignationCode(record.DesignationCode ? String(record.DesignationCode) : '');
    setEditDesignationName(record.DesignationName ? String(record.DesignationName) : '');
    setEditDescription(record.DesignationDescription ? String(record.DesignationDescription) : '');
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditRecord(null);
    setEditFormErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const code = editDesignationCode.trim();
    if (!code) {
      errs.code = 'Designation code is required';
    } else if (code.length < 2) {
      errs.code = 'Designation code must be at least 2 characters';
    }

    const nameErr = validateTextOnly(editDesignationName, 'Designation Name', true, 2, 100);
    if (nameErr) errs.name = nameErr;

    if (Object.keys(errs).length > 0) {
      setEditFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await designationService.editDesignation({
        flagId: 2,
        DesignationId: Number(editRecord.DesignationId ?? editRecord.id),
        DesignationCode: code,
        DesignationName: editDesignationName.trim(),
        DesignationDescription: editDescription.trim(),
        IsDisabled: editRecord.IsDisabled === true
      });
      showToast('Designation updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditRecord(null);
      await fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update designation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle designation status (flagId: 4)
  const handleToggleStatus = async (record) => {
    const id = record.DesignationId ?? record.CompanyDesignationId ?? record.id;
    const currentlyDisabled = record.IsDisabled === true || record.status === 'Inactive' || record.status === 'Disabled';
    const newIsDisabled = !currentlyDisabled;

    try {
      await designationService.toggleDesignationStatus({
        flagId: 4,
        DesignationId: Number(id),
        IsDisabled: newIsDisabled
      });
      showToast(`Designation status updated successfully`, 'success');
      setDesignations((prev) =>
        prev.map((item) =>
          (item.DesignationId ?? item.id) === id ? { ...item, IsDisabled: newIsDisabled } : item
        )
      );
      fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', 'error');
    }
  };

  // Table Columns matching payload: DesignationId, DesignationName, DesignationCode, DesignationDescription, IsDisabled, CreatedAt
  const columns = useMemo(() => [
    {
      header: 'SL NO',
      accessorKey: 'DesignationId',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
          {row.index + 1}
        </span>
      )
    },
    {
      header: 'DESIGNATION CODE',
      accessorKey: 'DesignationCode',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
          <Tag className="w-3 h-3 text-indigo-500" />
          {row.original.DesignationCode || '—'}
        </span>
      )
    },
    {
      header: 'DESIGNATION NAME',
      accessorKey: 'DesignationName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {row.original.DesignationName || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'DESCRIPTION',
      accessorKey: 'DesignationDescription',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate block" title={row.original.DesignationDescription}>
          {row.original.DesignationDescription || '—'}
        </span>
      )
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
        title="Designations"
        description="View and oversee corporate job designations, codes, and role classifications."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Designations' }
        ]}
      />

      {/* 2. Designation Data Table */}
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
        searchPlaceholder="Search by designation name, code, description..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchDesignations}
        hideExport
      />

      {/* 3. Add Designation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Designation"
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
              form="add-designation-form"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Designation'}
            </Button>
          </div>
        }
      >
        <form id="add-designation-form" onSubmit={handleAddSubmit} className="space-y-4">
          {/* Designation Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Designation Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={addDesignationCode}
                maxLength={20}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20).toUpperCase();
                  setAddDesignationCode(sanitized);
                  setFormErrors((prev) => ({ ...prev, code: '' }));
                }}
                placeholder="e.g. MD_001, DES_SE"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.code
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-mono uppercase`}
              />
            </div>
            {formErrors.code && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.code}
              </span>
            )}
          </div>

          {/* Designation Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Designation Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={addDesignationName}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                  setAddDesignationName(sanitized);
                  setFormErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Managing Director, Software Engineer"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.name
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
              />
            </div>
            {formErrors.name && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea
                rows={3}
                value={addDescription}
                maxLength={300}
                onChange={(e) => setAddDescription(e.target.value.slice(0, 300))}
                placeholder="Enter designation responsibilities or description..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. Edit Designation Modal */}
      {isEditModalOpen && editRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Designation — ${editRecord.DesignationName || editRecord.DesignationCode || ''}`}
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
                form="edit-designation-form"
                variant="primary"
                size="sm"
                icon={Pencil}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Designation'}
              </Button>
            </div>
          }
        >
          <form id="edit-designation-form" onSubmit={handleEditSubmit} className="space-y-4">
            {/* Designation Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Designation Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={editDesignationCode}
                  maxLength={20}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20).toUpperCase();
                    setEditDesignationCode(sanitized);
                    setEditFormErrors((prev) => ({ ...prev, code: '' }));
                  }}
                  placeholder="e.g. 101, MD_001, DES_SE"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editFormErrors.code
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-mono uppercase`}
                />
              </div>
              {editFormErrors.code && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editFormErrors.code}
                </span>
              )}
            </div>

            {/* Designation Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Designation Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={editDesignationName}
                  maxLength={100}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                    setEditDesignationName(sanitized);
                    setEditFormErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Managing Director, Software Engineer"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editFormErrors.name
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
                />
              </div>
              {editFormErrors.name && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editFormErrors.name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <textarea
                  rows={3}
                  value={editDescription}
                  maxLength={300}
                  onChange={(e) => setEditDescription(e.target.value.slice(0, 300))}
                  placeholder="Enter designation responsibilities or description..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all resize-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. View Details Modal */}
      {isViewModalOpen && viewRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Designation Details${viewRecord.DesignationName ? ` — ${viewRecord.DesignationName}` : ''}`}
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
                  Designation Code
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {viewRecord.DesignationCode || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Designation Name
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {viewRecord.DesignationName || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Description
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                  {viewRecord.DesignationDescription || 'No description provided.'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Created Date
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {formatDate(viewRecord.CreatedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Last Updated
                </span>
                <span className="text-slate-600 dark:text-slate-400">
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


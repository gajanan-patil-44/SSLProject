// src/pages/Master/CompanyDesignationView.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PageHeader,
  Button,
  Badge
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { companyDesignationService } from '../../services/companyDesignationService';
import { useERPStore } from '../../store/useERPStore';
import { getSessionCompanyId, getSessionCompany } from '../../services/departmentService';
import {
  Briefcase,
  Building2,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  Plus,
  Pencil,
  Layers,
  UserCheck
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

export default function CompanyDesignationView() {
  const showToast = useERPStore((state) => state.showToast);

  // Dynamic session company detection
  const sessionCompanyId = getSessionCompanyId();
  const sessionCompany = getSessionCompany();
  const sessionCompanyName = sessionCompany?.CompanyName || sessionCompany?.name || '';
  const hasSessionCompany = Boolean(sessionCompanyId);

  const [companyDesignations, setCompanyDesignations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [masterDesignations, setMasterDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View modal state
  const [viewRecord, setViewRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCompanyId, setAddCompanyId] = useState(sessionCompanyId ? String(sessionCompanyId) : '');
  const [addDesignationId, setAddDesignationId] = useState('');
  const [addDesignationLevel, setAddDesignationLevel] = useState('');
  const [addCanBeReportingManager, setAddCanBeReportingManager] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editDesignationId, setEditDesignationId] = useState('');
  const [editDesignationLevel, setEditDesignationLevel] = useState('');
  const [editCanBeReportingManager, setEditCanBeReportingManager] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const isFetchingRef = useRef(false);

  /**
   * Fetch company designations list
   * Route: POST /verp-service/designationCreation/fetchCompanyDesignationView
   * Payload: { flagId: 1, CompanyId: null | number }
   */
  const fetchDesignations = useCallback(async (companyIdOverride) => {
    try {
      setLoading(true);
      const targetCompanyId = companyIdOverride !== undefined
        ? companyIdOverride
        : (sessionCompanyId ? Number(sessionCompanyId) : null);
      const res = await companyDesignationService.getCompanyDesignations({
        flagId: 1,
        CompanyId: targetCompanyId
      });
      const raw = res?.data?.data || res?.data?.result || res?.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setCompanyDesignations(list);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch company designations', 'error');
      setCompanyDesignations([]);
    } finally {
      setLoading(false);
    }
  }, [sessionCompanyId, showToast]);

  /**
   * Fetch master designations dropdown
   */
  const fetchMasterDesignations = useCallback(async () => {
    try {
      const list = await companyDesignationService.getMasterDesignationsDropdown();
      setMasterDesignations(list);
    } catch {
      setMasterDesignations([]);
    }
  }, []);

  /**
   * Fetch companies dropdown
   */
  const fetchCompanies = useCallback(async () => {
    try {
      const list = await companyDesignationService.getCompaniesDropdown();
      setCompanies(list);
      if (sessionCompanyId) {
        setAddCompanyId(String(sessionCompanyId));
      }
    } catch {
      setCompanies([]);
    }
  }, [sessionCompanyId]);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    fetchDesignations();
    fetchCompanies();
    fetchMasterDesignations();
  }, [fetchDesignations, fetchCompanies, fetchMasterDesignations]);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return companyDesignations;
    const q = searchTerm.toLowerCase().trim();
    return companyDesignations.filter((d) => {
      const name = String(d.DesignationName || '').toLowerCase();
      const code = String(d.DesignationCode || '').toLowerCase();
      const comp = String(d.CompanyName || '').toLowerCase();
      const desc = String(d.DesignationDescription || d.Description || '').toLowerCase();
      return name.includes(q) || code.includes(q) || comp.includes(q) || desc.includes(q);
    });
  }, [companyDesignations, searchTerm]);

  // Add Handlers
  const handleOpenAddModal = () => {
    // Dynamically refresh company (flagId: 1) and designation (flagId: 2) dropdowns
    fetchCompanies();
    fetchMasterDesignations();
    const initialCompanyId = sessionCompanyId
      ? String(sessionCompanyId)
      : (addCompanyId || '');
    setAddCompanyId(initialCompanyId);
    setAddDesignationId('');
    setAddDesignationLevel('');
    setAddCanBeReportingManager(false);
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddErrors({});
  };

  // Add Submit Handler (POST /verp-service/designationCreation/insertCompanyDesignation with { flagId: 1, CompanyId, DesignationId, DesignationLevel, CanBeReportingManager, CreatedByUserName })
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const effectiveCompanyId = sessionCompanyId
      ? Number(sessionCompanyId)
      : Number(addCompanyId);
    if (!effectiveCompanyId || isNaN(effectiveCompanyId) || effectiveCompanyId <= 0) {
      errs.company = 'Please select a company';
    }

    if (!addDesignationId || isNaN(Number(addDesignationId)) || Number(addDesignationId) <= 0) {
      errs.designationId = 'Please select a Designation';
    }

    if (addDesignationLevel === '' || isNaN(Number(addDesignationLevel)) || Number(addDesignationLevel) <= 0) {
      errs.designationLevel = 'Please enter a valid positive designation level';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    const selectedDesig = masterDesignations.find(d => String(d.DesignationId) === String(addDesignationId));
    const selectedComp = companies.find(c => String(c.CompanyId) === String(effectiveCompanyId));

    setSubmitting(true);
    try {
      const res = await companyDesignationService.addCompanyDesignation({
        flagId: 1,
        CompanyId: effectiveCompanyId,
        CompanyName: selectedComp?.CompanyName || sessionCompanyName || '',
        DesignationId: Number(addDesignationId),
        DesignationName: selectedDesig?.DesignationName || '',
        DesignationCode: selectedDesig?.DesignationCode || '',
        DesignationDescription: selectedDesig?.DesignationDescription || '',
        DesignationLevel: Number(addDesignationLevel),
        CanBeReportingManager: Boolean(addCanBeReportingManager)
      });
      const msg = res?.data?.message || res?.message || 'Company designation inserted successfully';
      showToast(msg, 'success');
      setIsAddModalOpen(false);
      await fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to insert company designation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Handlers
  const handleOpenEditModal = (record) => {
    fetchMasterDesignations();
    setEditRecord(record);
    const initialDesigId = record.DesignationId !== undefined && record.DesignationId !== null && record.DesignationId !== ''
      ? String(record.DesignationId)
      : '';
    setEditDesignationId(initialDesigId);
    setEditDesignationLevel(record.DesignationLevel !== undefined && record.DesignationLevel !== null ? record.DesignationLevel : '');
    setEditCanBeReportingManager(Boolean(record.CanBeReportingManager));
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditRecord(null);
    setEditErrors({});
  };

  // Edit Submit Handler (/verp-service/designationCreation/editCompanyDesignation with { flagId: 2, CompanyDesignationId, CompanyId, DesignationId, DesignationLevel, CanBeReportingManager, UpdateByUserName })
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!editDesignationId || isNaN(Number(editDesignationId))) {
      errs.designationId = 'Please select a valid Designation';
    }

    if (editDesignationLevel === '' || isNaN(Number(editDesignationLevel)) || Number(editDesignationLevel) <= 0) {
      errs.designationLevel = 'Please enter a valid positive designation level';
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    const selectedDesig = masterDesignations.find(d => String(d.DesignationId) === String(editDesignationId));
    const effectiveCompanyId = Number(editRecord.CompanyId ?? sessionCompanyId);
    const companyDesignationId = Number(editRecord.CompanyDesignationId ?? editRecord.id);

    setSubmitting(true);
    try {
      const res = await companyDesignationService.editCompanyDesignation({
        flagId: 2,
        CompanyDesignationId: companyDesignationId,
        CompanyId: effectiveCompanyId,
        DesignationId: Number(editDesignationId),
        DesignationLevel: Number(editDesignationLevel),
        CanBeReportingManager: Boolean(editCanBeReportingManager),
        DesignationName: selectedDesig?.DesignationName || editRecord.DesignationName,
        DesignationCode: selectedDesig?.DesignationCode || editRecord.DesignationCode
      });
      const msg = res?.data?.message || res?.message || 'Company designation updated successfully';
      showToast(msg, 'success');
      setIsEditModalOpen(false);
      setEditRecord(null);
      await fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company designation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Handler (/verp-service/designationCreation/toggleCompanyDesignationStatus with { flagId: 3, CompanyDesignationId, IsDisabled, UpdateByUserName })
  const handleToggleStatus = async (record) => {
    const id = record.CompanyDesignationId ?? record.id;
    const currentlyDisabled = record.IsDisabled === true || record.status === 'Inactive' || record.status === 'Disabled';
    const newIsDisabled = !currentlyDisabled;

    try {
      const res = await companyDesignationService.toggleCompanyDesignationStatus({
        flagId: 3,
        CompanyDesignationId: Number(id),
        IsDisabled: newIsDisabled
      });
      const msg = res?.data?.message || res?.message || `Company designation ${newIsDisabled ? 'deactivated' : 'activated'} successfully!`;
      showToast(msg, 'success');
      setCompanyDesignations((prev) =>
        prev.map((item) =>
          (item.CompanyDesignationId ?? item.id) === id ? { ...item, IsDisabled: newIsDisabled } : item
        )
      );
      fetchDesignations();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company designation status', 'error');
    }
  };

  // Table Columns
  const columns = useMemo(() => [
    {
      header: 'SL NO',
      accessorKey: 'CompanyDesignationId',
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
            {row.original.CompanyName || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'DESIGNATION NAME',
      accessorKey: 'DesignationName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {row.original.DesignationName || '—'}
          </span>
        </div>
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
      header: 'LEVEL',
      accessorKey: 'DesignationLevel',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.original.DesignationLevel ?? '—'}
        </span>
      )
    },
    {
      header: 'DESCRIPTION',
      accessorKey: 'DesignationDescription',
      cell: ({ row }) => {
        const desc = row.original.DesignationDescription || row.original.Description || '—';
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
        title="Company Designations"
        description="Manage corporate designation mappings, assign designations to companies, and configure status."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Company Designations' }
        ]}
      />

      {/* 2. Company Designation Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        onAddClick={handleOpenAddModal}
        onEditClick={handleOpenEditModal}
        onToggleStatusClick={handleToggleStatus}
        onToggleStatus={handleToggleStatus}
        onViewClick={(row) => {
          setViewRecord(row);
          setIsViewModalOpen(true);
        }}
        searchPlaceholder="Search by designation name, code, company, description..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchDesignations}
        hideExport
      />

      {/* 3. Add Company Designation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add Company Designation"
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
              form="add-company-designation-form"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Designation'}
            </Button>
          </div>
        }
      >
        <form id="add-company-designation-form" onSubmit={handleAddSubmit} className="space-y-4">
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
                    setAddErrors((prev) => ({ ...prev, company: '' }));
                  }
                }}
                disabled={hasSessionCompany}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  addErrors.company
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium ${
                  hasSessionCompany ? 'opacity-80 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80' : ''
                }`}
              >
                {hasSessionCompany && !companies.some((c) => String(c.CompanyId) === String(sessionCompanyId)) && (
                  <option value={String(sessionCompanyId)}>
                    {sessionCompanyName || `Company ${sessionCompanyId}`}
                  </option>
                )}
                {!hasSessionCompany && <option value="">— Select Company —</option>}
                {companies.map((c) => (
                  <option key={c.CompanyId} value={c.CompanyId}>
                    {c.CompanyName}
                  </option>
                ))}
              </select>
            </div>
            {addErrors.company && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.company}
              </span>
            )}
          </div>

          {/* Master Designation Selection (DesignationId) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Master Designation <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={addDesignationId}
                onChange={(e) => {
                  setAddDesignationId(e.target.value);
                  setAddErrors((prev) => ({ ...prev, designationId: '' }));
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  addErrors.designationId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
              >
                <option value="">— Select Designation —</option>
                {masterDesignations.map((d) => (
                  <option key={d.DesignationId} value={d.DesignationId}>
                    {d.DesignationName} {d.DesignationCode ? `(${d.DesignationCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {addErrors.designationId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.designationId}
              </span>
            )}
          </div>

          {/* Designation Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Designation Level <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                value={addDesignationLevel}
                onChange={(e) => {
                  setAddDesignationLevel(e.target.value);
                  setAddErrors((prev) => ({ ...prev, designationLevel: '' }));
                }}
                placeholder="e.g. 100"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  addErrors.designationLevel
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-mono`}
              />
            </div>
            {addErrors.designationLevel && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {addErrors.designationLevel}
              </span>
            )}
          </div>

          {/* Can Be Reporting Manager */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <label htmlFor="addCanBeReportingManager" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer block">
                  Can Be Reporting Manager
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Permit users with this designation to act as reporting managers
                </span>
              </div>
            </div>
            <input
              id="addCanBeReportingManager"
              type="checkbox"
              checked={addCanBeReportingManager}
              onChange={(e) => setAddCanBeReportingManager(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
          </div>
        </form>
      </Modal>

      {/* 4. Edit Company Designation Modal */}
      {isEditModalOpen && editRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Company Designation — ${editRecord.DesignationName || editRecord.DesignationCode || ''}`}
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
                form="edit-company-designation-form"
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
          <form id="edit-company-designation-form" onSubmit={handleEditSubmit} className="space-y-4">
            {/* Context Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Current Designation
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {editRecord.DesignationName || '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Company
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {editRecord.CompanyName || '—'}
                </span>
              </div>
            </div>

            {/* Master Designation Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Select Master Designation <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={editDesignationId}
                  onChange={(e) => {
                    setEditDesignationId(e.target.value);
                    setEditErrors((prev) => ({ ...prev, designationId: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editErrors.designationId
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all font-medium`}
                >
                  <option value="">— Select Designation —</option>
                  {editRecord.DesignationId && !masterDesignations.some(d => String(d.DesignationId) === String(editRecord.DesignationId)) && (
                    <option value={editRecord.DesignationId}>
                      {editRecord.DesignationName || 'Current Designation'}
                    </option>
                  )}
                  {masterDesignations.map((d) => (
                    <option key={d.DesignationId} value={d.DesignationId}>
                      {d.DesignationName} {d.DesignationCode ? `(${d.DesignationCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {editErrors.designationId && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editErrors.designationId}
                </span>
              )}
            </div>

            {/* Designation Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Designation Level <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  value={editDesignationLevel}
                  onChange={(e) => {
                    setEditDesignationLevel(e.target.value);
                    setEditErrors((prev) => ({ ...prev, designationLevel: '' }));
                  }}
                  placeholder="e.g. 100"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                    editErrors.designationLevel
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-mono`}
                />
              </div>
              {editErrors.designationLevel && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {editErrors.designationLevel}
                </span>
              )}
            </div>

            {/* Can Be Reporting Manager */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="editCanBeReportingManager" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer block">
                    Can Be Reporting Manager
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Permit users with this designation to act as reporting managers
                  </span>
                </div>
              </div>
              <input
                id="editCanBeReportingManager"
                type="checkbox"
                checked={editCanBeReportingManager}
                onChange={(e) => setEditCanBeReportingManager(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* 5. View Details Modal */}
      {isViewModalOpen && viewRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Company Designation Details — ${viewRecord.DesignationName || viewRecord.DesignationCode || ''}`}
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
                  Company
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  {viewRecord.CompanyName || '—'}
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
                  {viewRecord.DesignationDescription || viewRecord.Description || '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Designation Level
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                  {viewRecord.DesignationLevel ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Reporting Manager
                </span>
                <span className="font-semibold text-xs mt-0.5 block">
                  {viewRecord.CanBeReportingManager ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yes (Authorized)</span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">No</span>
                  )}
                </span>
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


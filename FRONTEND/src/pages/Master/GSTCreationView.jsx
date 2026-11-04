// src/pages/Master/GSTCreationView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  PageHeader,
  Button,
  StatusBadge
} from '../../components/ui/index';
import { Modal } from '../../components/ui/Modal';
import EditGSTModal from './EditGSTModal';
import { DataTable } from '../../components/ui/DataTable';
import { gstService } from '../../services/gstService';
import { companyService } from '../../services/companyService';
import { getSessionCompany, getSessionCompanyId } from '../../services/departmentService';
import { useERPStore } from '../../store/useERPStore';
import {
  Receipt,
  Calendar,
  User,
  Building,
  Percent,
  Layers,
  AlertCircle,
  Check,
  Lock
} from 'lucide-react';

export default function GSTCreationView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  const sessionCompany = getSessionCompany();
  const sessionCompanyId = getSessionCompanyId();
  const sessionCompanyName = sessionCompany?.CompanyName || sessionCompany?.companyName || sessionCompany?.name;

  // Dynamic session username resolution
  const getSessionUserName = () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
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
  const [gstList, setGstList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [gstTypes, setGstTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add GST Rate Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCompanyId, setAddCompanyId] = useState('');
  const [addGstTypeId, setAddGstTypeId] = useState('');
  const [addGstPercentage, setAddGstPercentage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit GST Rate Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGST, setEditingGST] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleOpenEditModal = (item) => {
    setEditingGST(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGST(null);
  };

  // Toggle GST status via /verp-service/gstRate/status (FlagId: 4, PATCH)
  const handleToggleStatus = async (item) => {
    const rateId = Number(item.GSTRateId ?? item.id ?? item.GSTId ?? item.gstRateId);
    const currentIsDisabled = Boolean(item.IsDisabled);
    const newIsDisabled = !currentIsDisabled;

    setTogglingId(rateId);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';
      const resolvedCompanyId = sessionCompanyId ? Number(sessionCompanyId) : (item.CompanyId ? Number(item.CompanyId) : null);

      const payload = {
        FlagId: 4,
        GSTRateId: rateId,
        CompanyId: resolvedCompanyId,
        IsDisabled: newIsDisabled,
        UpdatedByUserName: sessionUserName
      };

      const res = await gstService.toggleGSTStatus(payload);
      const msg = res?.message || res?.data?.message || `GST Rate status updated successfully!`;
      showToast(msg, 'success');

      await fetchGSTList();
    } catch (err) {
      console.error('Failed to toggle GST status:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update GST status';
      showToast(errMsg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    fetchGSTList();
    fetchCompanies();
    fetchGSTTypes();
  }, []);

  // Fetch GST table data via /verp-service/gstRate/view (FlagId: 3)
  const fetchGSTList = async () => {
    setLoading(true);
    try {
      const res = await gstService.getGSTList({
        FlagId: 3,
        CompanyId: sessionCompanyId ? Number(sessionCompanyId) : undefined
      });
      const rawList = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      const list = Array.isArray(rawList) ? rawList : [];
      setGstList(list);
    } catch (err) {
      console.error('Failed to load GST records:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch GST list', 'error');
      setGstList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companyService.getCompanies();
      const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      setCompanies(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setCompanies([]);
    }
  };

  // Fetch GST Types dropdown via /verp-service/gstRate/dropdown (FlagId: 1)
  const fetchGSTTypes = async () => {
    try {
      const res = await gstService.getGSTTypes();
      const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      setGstTypes(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to load GST types:', err);
      setGstTypes([]);
    }
  };

  const handleOpenAddModal = () => {
    const defaultComp = sessionCompanyId ? String(sessionCompanyId) : (companies.length > 0 ? String(companies[0].CompanyId ?? companies[0].id ?? '') : '');
    setAddCompanyId(defaultComp);
    setAddGstTypeId(gstTypes.length > 0 ? String(gstTypes[0].GSTTypeId ?? gstTypes[0].id ?? '') : '');
    setAddGstPercentage('');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormErrors({});
  };

  const validateAddForm = () => {
    const errs = {};
    const compCheck = sessionCompanyId || addCompanyId;

    if (!compCheck) {
      errs.companyId = 'Please select a company';
    }

    if (!addGstTypeId) {
      errs.gstTypeId = 'Please select a GST Type';
    }

    const pctTrim = String(addGstPercentage).trim();
    const pctNum = Number(pctTrim);
    if (!pctTrim || isNaN(pctNum)) {
      errs.gstPercentage = 'GST Rate percentage is required';
    } else if (pctNum < 0 || pctNum > 100) {
      errs.gstPercentage = 'GST Rate must be between 0 and 100%';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add GST Rate via /verp-service/gstRate/add (FlagId: 2)
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateAddForm()) return;

    setSubmitting(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';
      const resolvedCompanyId = sessionCompanyId ? Number(sessionCompanyId) : Number(addCompanyId);

      const payload = {
        FlagId: 2,
        GSTTypeId: Number(addGstTypeId),
        GSTPercentage: String(addGstPercentage).trim(),
        CreatedByUserName: sessionUserName,
        CompanyId: resolvedCompanyId
      };

      const res = await gstService.addGST(payload);
      const successMsg = res?.message || res?.data?.message || 'GST Rate added successfully!';
      showToast(successMsg, 'success');

      setIsAddModalOpen(false);
      await fetchGSTList();
    } catch (err) {
      console.error('Failed to add GST:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to add GST configuration';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered dataset for DataTable based on live search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return gstList;
    const term = searchTerm.trim().toLowerCase();

    return gstList.filter((item) => {
      const type = String(item.GSTTypeName || '').toLowerCase();
      const pct = String(item.GSTPercentage ?? item.percentage ?? '').toLowerCase();
      const createdBy = String(item.CreatedByUserName || '').toLowerCase();

      return (
        type.includes(term) ||
        pct.includes(term) ||
        createdBy.includes(term)
      );
    });
  }, [gstList, searchTerm]);

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

  // Table Columns Definition
  const columns = useMemo(() => [
    {
      header: 'GST TYPE',
      accessorKey: 'GSTTypeName',
      cell: ({ row }) => {
        const type = gstTypes.find(t => String(t.GSTTypeId ?? t.id) === String(row.original.GSTTypeId));
        const typeName = row.original.GSTTypeName || type?.GSTTypeName || type?.name || '—';
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {typeName}
            </span>
          </div>
        );
      }
    },
    {
      header: 'RATE (%)',
      accessorKey: 'GSTPercentage',
      cell: ({ row }) => {
        const pct = row.original.GSTPercentage ?? row.original.percentage ?? 0;
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            <Percent className="w-3 h-3" />
            {pct}%
          </span>
        );
      }
    },
    {
      header: 'COMPANY',
      accessorKey: 'CompanyId',
      cell: ({ row }) => {
        const comp = companies.find(c => String(c.CompanyId ?? c.id ?? c.CompanyMasterId) === String(row.original.CompanyId));
        const compName = comp?.CompanyName || comp?.companyName || comp?.name || (row.original.CompanyId ? String(row.original.CompanyId) : '—');
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{compName}</span>
          </div>
        );
      }
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
  ], [companies, gstTypes]);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. Header */}
      <PageHeader
        title="GST Creation"
        description="Configure and manage goods and service tax types, rates, slabs, and statutory tax rules."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'GST Creation' }
        ]}
      />

      {/* 2. GST Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        onAddClick={handleOpenAddModal}
        onEditClick={(row) => handleOpenEditModal(row)}
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search by GST type, rate, creator..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchGSTList}
        hideExport
      />

      {/* 3. Add GST Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add GST Rate"
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
              Add GST Rate
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
          {/* Company Selection (Locked to Session Company) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Company <span className="text-rose-500">*</span></span>
              {sessionCompanyId && (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium normal-case flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked from session
                </span>
              )}
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={addCompanyId || (sessionCompanyId ? String(sessionCompanyId) : '')}
                onChange={(e) => {
                  setAddCompanyId(e.target.value);
                  setFormErrors((prev) => ({ ...prev, companyId: '' }));
                }}
                disabled={Boolean(sessionCompanyId)}
                className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border ${
                  formErrors.companyId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all ${
                  sessionCompanyId ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800 font-medium' : 'cursor-pointer'
                }`}
              >
                {sessionCompanyId && !companies.some(c => String(c.CompanyId ?? c.id ?? c.CompanyMasterId) === String(sessionCompanyId)) && (
                  <option value={String(sessionCompanyId)}>
                    {sessionCompanyName || sessionCompanyId}
                  </option>
                )}
                <option value="">— Select Company —</option>
                {companies.map((c, idx) => {
                  const id = c.CompanyId ?? c.id ?? c.CompanyMasterId;
                  const name = c.CompanyName || c.companyName || c.name || id;
                  return (
                    <option key={`${id}_${idx}`} value={String(id)}>
                      {name}
                    </option>
                  );
                })}
              </select>
              {sessionCompanyId && (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              )}
            </div>
            {formErrors.companyId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.companyId}
              </span>
            )}
          </div>

          {/* GST Type Dropdown (FlagId: 1 via /verp-service/gstRate/dropdown) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              GST Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={addGstTypeId}
                onChange={(e) => {
                  setAddGstTypeId(e.target.value);
                  setFormErrors((prev) => ({ ...prev, gstTypeId: '' }));
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.gstTypeId
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer`}
              >
                <option value="">— Select GST Type —</option>
                {gstTypes.map((t, idx) => {
                  const id = t.GSTTypeId ?? t.id ?? t.value;
                  const name = t.GSTTypeName ?? t.name ?? t.label ?? id;
                  return (
                    <option key={`${id}_${idx}`} value={String(id)}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            {formErrors.gstTypeId && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.gstTypeId}
              </span>
            )}
          </div>

          {/* GST Percentage */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              GST Percentage (%) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={addGstPercentage}
                onChange={(e) => {
                  setAddGstPercentage(e.target.value);
                  setFormErrors((prev) => ({ ...prev, gstPercentage: '' }));
                }}
                placeholder="e.g. 18 or 18.00"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                  formErrors.gstPercentage
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
              />
            </div>
            {formErrors.gstPercentage && (
              <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.gstPercentage}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {/* 4. Edit GST Modal (Dedicated Component) */}
      <EditGSTModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        gstItem={editingGST}
        companies={companies}
        gstTypes={gstTypes}
        sessionCompanyId={sessionCompanyId}
        sessionCompanyName={sessionCompanyName}
        onSaveSuccess={fetchGSTList}
      />
    </div>
  );
}

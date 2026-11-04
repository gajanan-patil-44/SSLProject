// src/pages/Master/EditGSTModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';
import { gstService } from '../../services/gstService';
import { getSessionCompany, getSessionCompanyId } from '../../services/departmentService';
import {
  Building,
  Percent,
  Check,
  AlertCircle,
  Lock,
  Layers
} from 'lucide-react';

export default function EditGSTModal({
  isOpen,
  onClose,
  gstItem,
  companies = [],
  gstTypes = [],
  sessionCompanyId: propSessionCompanyId,
  sessionCompanyName: propSessionCompanyName,
  onSaveSuccess
}) {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  const sessionCompany = getSessionCompany();
  const sessionCompanyId = propSessionCompanyId ?? getSessionCompanyId();
  const sessionCompanyName = propSessionCompanyName ?? sessionCompany?.CompanyName ?? sessionCompany?.companyName ?? sessionCompany?.name;

  // Form state
  const [companyId, setCompanyId] = useState('');
  const [gstTypeId, setGstTypeId] = useState('');
  const [gstPercentage, setGstPercentage] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-fill GST details when modal opens or item changes
  useEffect(() => {
    if (gstItem && isOpen) {
      const initialComp = sessionCompanyId ? String(sessionCompanyId) : String(gstItem.CompanyId ?? '');
      setCompanyId(initialComp);
      setGstTypeId(String(gstItem.GSTTypeId ?? gstItem.gstTypeId ?? ''));
      const pct = gstItem.GSTPercentage ?? gstItem.percentage ?? gstItem.gstPercentage ?? '';
      setGstPercentage(String(pct));
      setErrors({});
    }
  }, [gstItem, isOpen, sessionCompanyId]);

  if (!isOpen || !gstItem) return null;

  const gstId = Number(
    gstItem.GSTRateId ?? gstItem.id ?? gstItem.GSTId ?? gstItem.gstRateId
  );

  // Extract session username
  const getSessionUserName = () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
      if (raw) {
        const s = JSON.parse(raw);
        const user = s?.data?.user || s?.user || s;
        return user?.loginName || user?.LoginName || user?.EmployeeId || user?.name || user?.username || '';
      }
      const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
      return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || u?.username || '';
    } catch {
      return '';
    }
  };

  const validate = () => {
    const errs = {};
    const compCheck = sessionCompanyId || companyId || gstItem.CompanyId;

    if (!compCheck) {
      errs.companyId = 'Please select a company';
    }

    if (!gstTypeId) {
      errs.gstTypeId = 'Please select a GST Type';
    }

    const pctTrim = String(gstPercentage).trim();
    const pctNum = Number(pctTrim);
    if (!pctTrim || isNaN(pctNum)) {
      errs.gstPercentage = 'GST Rate percentage is required';
    } else if (pctNum < 0 || pctNum > 100) {
      errs.gstPercentage = 'GST Rate must be between 0 and 100%';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit edit via /verp-service/gstRate/edit (FlagId: 3, PATCH)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';
      const resolvedCompanyId = sessionCompanyId ? Number(sessionCompanyId) : Number(companyId || gstItem.CompanyId);

      const payload = {
        FlagId: 3,
        GSTRateId: Number(gstId),
        GSTTypeId: Number(gstTypeId),
        GSTPercentage: String(gstPercentage).trim(),
        UpdatedByUserName: sessionUserName,
        CompanyId: resolvedCompanyId
      };

      const res = await gstService.updateGST(payload);
      const msg = res?.message || res?.data?.message || 'GST Rate updated successfully';
      showToast(msg, 'success');

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to update GST:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update GST';
      showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit GST Rate"
      size="md"
      actions={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Check}
            loading={saving}
            onClick={handleSubmit}
          >
            Update GST Rate
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Company Dropdown (Locked to Session Company) */}
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
              value={companyId || (sessionCompanyId ? String(sessionCompanyId) : '')}
              onChange={(e) => {
                setCompanyId(e.target.value);
                setErrors((prev) => ({ ...prev, companyId: '' }));
              }}
              disabled={Boolean(sessionCompanyId)}
              className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border ${
                errors.companyId
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
              {companyId && !companies.some(c => String(c.CompanyId ?? c.id ?? c.CompanyMasterId) === String(companyId)) && (
                <option value={String(companyId)}>{companyId}</option>
              )}
            </select>
            {sessionCompanyId && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            )}
          </div>
          {errors.companyId && (
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.companyId}
            </span>
          )}
        </div>

        {/* GST Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            GST Type <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={gstTypeId}
              onChange={(e) => {
                setGstTypeId(e.target.value);
                setErrors((prev) => ({ ...prev, gstTypeId: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                errors.gstTypeId
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer`}
            >
              <option value="">— Select Type —</option>
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
          {errors.gstTypeId && (
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.gstTypeId}
            </span>
          )}
        </div>

        {/* GST Rate Percentage */}
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
              value={gstPercentage}
              onChange={(e) => {
                setGstPercentage(e.target.value);
                setErrors((prev) => ({ ...prev, gstPercentage: '' }));
              }}
              placeholder="e.g. 18 or 18.00"
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                errors.gstPercentage
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
            />
          </div>
          {errors.gstPercentage && (
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.gstPercentage}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}

// src/pages/Master/EditGSTModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';
import { gstService } from '../../services/gstService';
import { getSessionCompanyId } from '../../services/departmentService';
import {
  Percent,
  Check,
  AlertCircle,
  Layers
} from 'lucide-react';

export default function EditGSTModal({
  isOpen,
  onClose,
  gstItem,
  gstTypes = [],
  sessionCompanyId: propSessionCompanyId,
  onSaveSuccess
}) {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  const sessionCompanyId = propSessionCompanyId ?? getSessionCompanyId();

  // Form state
  const [gstTypeId, setGstTypeId] = useState('');
  const [gstPercentage, setGstPercentage] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-fill GST details when modal opens or item changes
  useEffect(() => {
    if (gstItem && isOpen) {
      setGstTypeId(String(gstItem.GSTTypeId ?? gstItem.gstTypeId ?? ''));
      const pct = gstItem.GSTPercentage ?? gstItem.percentage ?? gstItem.gstPercentage ?? '';
      setGstPercentage(String(pct));
      setErrors({});
    }
  }, [gstItem, isOpen]);

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
      const resolvedCompanyId = sessionCompanyId ? Number(sessionCompanyId) : (gstItem.CompanyId ? Number(gstItem.CompanyId) : undefined);

      const payload = {
        FlagId: 3,
        GSTRateId: gstId,
        GSTTypeId: Number(gstTypeId),
        GSTPercentage: String(gstPercentage).trim(),
        UpdatedByUserName: sessionUserName,
        CompanyId: resolvedCompanyId
      };

      const res = await gstService.updateGST(payload);
      const successMsg = res?.message || res?.data?.message || 'GST Rate updated successfully!';
      showToast(successMsg, 'success');

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update GST Rate';
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
      description="Update tax type and applicable rate percentage."
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
              <option value="">— Select GST Type —</option>
              {gstTypes.map((t, idx) => {
                const id = t.GSTTypeId ?? t.id ?? t.value;
                const name = t.GSTTypeName || t.typeName || t.label || t.name;
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
              placeholder="e.g. 18"
              value={gstPercentage}
              onChange={(e) => {
                setGstPercentage(e.target.value);
                setErrors((prev) => ({ ...prev, gstPercentage: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                errors.gstPercentage
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all`}
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

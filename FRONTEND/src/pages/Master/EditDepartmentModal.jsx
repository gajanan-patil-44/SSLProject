// src/pages/Master/EditDepartmentModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';
import { departmentService, getSessionCompany, getSessionCompanyId } from '../../services/departmentService';
import { validateTextOnly } from '../../utils/validators';
import {
  Building2,
  Building,
  Tag,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';

export default function EditDepartmentModal({
  isOpen,
  onClose,
  department,
  companies = [],
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
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-fill department details when modal opens or department changes
  useEffect(() => {
    if (department && isOpen) {
      const initialComp = sessionCompanyId ? String(sessionCompanyId) : String(department.CompanyId ?? '');
      setCompanyId(initialComp);
      setDepartmentName(department.DepartmentName || department.departmentName || '');
      setDepartmentCode(department.DepartmentCode || department.departmentCode || '');
      setErrors({});
    }
  }, [department, isOpen, sessionCompanyId]);

  if (!isOpen || !department) return null;

  const departmentId = Number(
    department.DepartmentId ?? department.departmentId ?? department.id
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
    const compCheck = sessionCompanyId || companyId || department.CompanyId;

    if (!compCheck) {
      errs.companyId = 'Please select a company';
    }

    const codeTrim = departmentCode.trim();
    if (!codeTrim) {
      errs.departmentCode = 'Department Code is required';
    } else if (codeTrim.length < 2) {
      errs.departmentCode = 'Department Code must be at least 2 characters';
    } else if (codeTrim.length > 50) {
      errs.departmentCode = 'Department Code must not exceed 50 characters';
    }

    const nameErr = validateTextOnly(departmentName, 'Department Name', true, 2, 100);
    if (nameErr) errs.departmentName = nameErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit edit via /verp-service/department/updateDepartment (flagId: 3, PATCH)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.username || '';
      const resolvedCompanyId = sessionCompanyId ? Number(sessionCompanyId) : Number(companyId || department.CompanyId);

      const payload = {
        flagId: 3,
        DepartmentId: Number(departmentId),
        CompanyId: resolvedCompanyId,
        DepartmentName: departmentName.trim(),
        DepartmentCode: departmentCode.trim(),
        UpdatedByUserName: sessionUserName
      };

      const res = await departmentService.updateDepartment(payload);
      const msg = res?.message || res?.data?.message || 'Department updated successfully';
      showToast(msg, 'success');

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update department';
      showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Department"
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
            Update Department
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Company Dropdown (Locked to Session Company) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Company <span className="text-rose-500">*</span>
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

        {/* Department Code */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Department Code <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={departmentCode}
              onChange={(e) => {
                setDepartmentCode(e.target.value);
                setErrors((prev) => ({ ...prev, departmentCode: '' }));
              }}
              placeholder="e.g. HR0002"
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                errors.departmentCode
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
            />
          </div>
          {errors.departmentCode && (
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.departmentCode}
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
              value={departmentName}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setDepartmentName(sanitized);
                setErrors((prev) => ({ ...prev, departmentName: '' }));
              }}
              placeholder="e.g. Humannn Resources"
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border ${
                errors.departmentName
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
              } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all font-medium`}
            />
          </div>
          {errors.departmentName && (
            <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.departmentName}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}

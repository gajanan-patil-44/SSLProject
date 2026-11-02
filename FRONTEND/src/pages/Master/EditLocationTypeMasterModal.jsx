// src/pages/Master/EditLocationTypeMasterModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';
import { locationTypeService } from '../../services/locationTypeService';
import {
  GitFork,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';

function Field({ label, error, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </span>
      )}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 font-medium`;

const selectCls = (err, disabled) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400 focus:ring-rose-500'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } ${
    disabled
      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
      : 'bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white cursor-pointer'
  } focus:outline-hidden focus:ring-2 transition-all duration-200 font-medium`;

export default function EditLocationTypeMasterModal({
  isOpen,
  onClose,
  locationType,
  onSaveSuccess,
  allItems = []
}) {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // Form state
  const [locationTypeName, setLocationTypeName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const locationTypeId = Number(
    locationType?.LocationTypeMasterId ?? locationType?.LocationTypeId ?? locationType?.id
  );

  // Is this item the root level (ParentTypeId is null)
  const isRootLevel = locationType?.ParentTypeId === null || locationType?.parentName === '-';

  // Load selected location type and dropdown on open
  useEffect(() => {
    if (locationType && isOpen) {
      setLocationTypeName(locationType.LocationTypeMasterName || locationType.childName || '');
      setSelectedParentId(locationType.ParentTypeId ? String(locationType.ParentTypeId) : '');
      setErrors({});
      fetchDropdown();
    }
  }, [locationType, isOpen]);

  const fetchDropdown = async () => {
    try {
      const res = await locationTypeService.getParentDropdown({ FlagId: 3 });
      const raw = res?.data?.data || res?.data || res;
      if (Array.isArray(raw)) {
        setDropdownOptions(raw);
      }
    } catch (err) {
      console.warn('Failed to fetch parent dropdown for edit:', err);
    }
  };

  const getSessionUserName = () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
      if (raw) {
        const s = JSON.parse(raw);
        const user = s?.data?.user || s?.user || s;
        return user?.loginName || user?.LoginName || user?.EmployeeId || user?.userName || user?.name || '';
      }
      const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
      return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
    } catch {
      return '';
    }
  };

  // Filter options to exclude the node being edited (avoids circular parenting)
  const availableOptions = useMemo(() => {
    const list = dropdownOptions.length > 0
      ? dropdownOptions.map(opt => ({
          id: opt.LocationTypeMasterId ?? opt.LocationTypeId ?? opt.id ?? opt.value,
          name: opt.LocationTypeMasterName ?? opt.LocationTypeName ?? opt.name ?? opt.childName ?? opt.label
        }))
      : allItems.map(it => ({
          id: it.LocationTypeMasterId ?? it.id,
          name: it.LocationTypeMasterName ?? it.childName
        }));

    return list.filter(opt => String(opt.id) !== String(locationTypeId));
  }, [dropdownOptions, allItems, locationTypeId]);

  if (!isOpen || !locationType) return null;

  const validate = () => {
    const errs = {};
    const trimmed = locationTypeName.trim();
    if (!trimmed) {
      errs.childName = 'Location Type Name is required';
    } else if (trimmed.length < 2) {
      errs.childName = 'Location Type Name must be at least 2 characters';
    } else if (trimmed.length > 100) {
      errs.childName = 'Location Type Name must not exceed 100 characters';
    }

    // If not root, parent location is required
    if (!isRootLevel && !selectedParentId) {
      errs.parentName = 'Parent Location is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Save Edits
  const handleSaveEdits = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.EmployeeId || 'Admin';

      const payload = {
        FlagId: 4,
        LocationTypeMasterId: locationTypeId,
        LocationTypeMasterName: locationTypeName.trim(),
        ParentTypeId: isRootLevel || !selectedParentId ? null : Number(selectedParentId),
        UpdatedByUserName: sessionUserName
      };

      await locationTypeService.editLocationTypeMaster(payload);
      showToast('Location Type updated successfully!', 'success');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update location type:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update location type', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Location Type"
      size="md"
      className="p-1"
    >
      <div className="space-y-6">
        {/* Modal Subheader */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {locationType.LocationTypeMasterName || locationType.childName || 'Location Type Node'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update hierarchical node name and immediate parent authority.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveEdits} className="space-y-5">
          <div className="space-y-4">
            {/* Location Type Name */}
            <Field label="Location Type Name" required error={errors.childName}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Country, State, District"
                  value={locationTypeName}
                  onChange={(e) => {
                    setLocationTypeName(e.target.value);
                    if (errors.childName) setErrors(prev => ({ ...prev, childName: null }));
                  }}
                  className={`${inputCls(errors.childName)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Parent Location Name */}
            <Field
              label="Parent Location Name"
              required={!isRootLevel}
              error={errors.parentName}
            >
              <div className="relative">
                <GitFork className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedParentId}
                  disabled={isRootLevel}
                  onChange={(e) => {
                    setSelectedParentId(e.target.value);
                    if (errors.parentName) setErrors(prev => ({ ...prev, parentName: null }));
                  }}
                  className={`${selectCls(errors.parentName, isRootLevel)} pl-9.5`}
                >
                  {isRootLevel ? (
                    <option value="">-- Root Authority (No Parent) --</option>
                  ) : (
                    <>
                      <option value="">-- Select Parent Location --</option>
                      {availableOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              {isRootLevel && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  This node is configured as the top-level root authority.
                </span>
              )}
            </Field>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={saving ? Loader2 : Check}
              disabled={saving}
              className="px-6 cursor-pointer"
            >
              {saving ? 'Saving Changes...' : 'Save Edits'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}



// src/pages/Master/LocationTypeMasterView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useERPStore } from '../../store/useERPStore';
import { locationTypeService } from '../../services/locationTypeService';
import { validateTextOnly } from '../../utils/validators';
import EditLocationTypeMasterModal from './EditLocationTypeMasterModal';
import {
  PageHeader,
  Card,
  Button
} from '../../components/ui/index';
import {
  GitFork,
  MapPin,
  Layers,
  Plus,
  RotateCcw,
  Edit2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

// Form Field Container with theme label & error display
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

// Section Header matching portal design system
function SectionHeader({ icon: Icon, iconColor, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor} shadow-xs`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}

// Theme Input Class helper
const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 font-medium`;

// Theme Select Class helper
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

export default function LocationTypeMasterView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const userName = currentUser?.loginName || currentUser?.name || currentUser?.EmployeeId || '';

  // Extract session username
  const getSessionUserName = () => {
    try {
      const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
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

  // Flow items state
  const [items, setItems] = useState([]);
  const [parentDropdownOptions, setParentDropdownOptions] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocationType, setEditingLocationType] = useState(null);

  const handleOpenEditModal = (item) => {
    setEditingLocationType(item);
    setIsEditModalOpen(true);
  };

  // Form input state (Add Mode)
  const [locationTypeName, setLocationTypeName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Parent location dropdown is visible only from the second one onwards (hidden for the first one)
  const isFirstLocation = items.length === 0 && parentDropdownOptions.length === 0;
  const showParentLocationField = !isFirstLocation;

  // Available parent options fetched via /verp-service/locationTypeMaster/dropdown
  const availableParentOptions = useMemo(() => {
    return parentDropdownOptions.length > 0
      ? parentDropdownOptions.map(opt => ({
          id: opt.LocationTypeMasterId ?? opt.LocationTypeId ?? opt.id ?? opt.value,
          name: opt.LocationTypeMasterName ?? opt.LocationTypeName ?? opt.name ?? opt.childName ?? opt.label
        }))
      : items.map(it => ({
          id: it.LocationTypeMasterId ?? it.id,
          name: it.LocationTypeMasterName ?? it.childName
        }));
  }, [parentDropdownOptions, items]);

  // Helper to normalize backend row fields to { id, childName, parentName }
  const normalizeLocationType = (item, idx) => {
    const id = item.LocationTypeMasterId ?? item.LocationTypeId ?? item.id ?? (idx + 1);
    const childName = item.LocationTypeMasterName ?? item.ChildName ?? item.childName ?? item.LocationTypeName ?? item.locationTypeName ?? item.Name ?? '';
    const parentName = item.ParentLocationTypeName ?? item.ParentName ?? item.parentName ?? item.ParentLocationName ?? null;

    return {
      ...item,
      id,
      LocationTypeMasterId: id,
      LocationTypeMasterName: String(childName || '').trim(),
      ParentLocationTypeName: parentName ? String(parentName).trim() : null,
      ParentTypeId: item.ParentTypeId ?? null,
      childName: String(childName || '').trim(),
      parentName: parentName && String(parentName).trim() !== '-' ? String(parentName).trim() : '-'
    };
  };

  // Load flow data and parent dropdown on mount
  useEffect(() => {
    loadFlowData();
    fetchParentDropdown();
  }, []);

  const loadFlowData = async () => {
    setFetching(true);
    try {
      // Hit /verp-service/locationTypeMaster/view with FlagId: 1
      const res = await locationTypeService.getLocationTypeMaster({ FlagId: 1 });
      const rawList = res?.data?.data || res?.data || res;
      const list = Array.isArray(rawList) ? rawList.map((item, idx) => normalizeLocationType(item, idx)) : [];
      setItems(list);
    } catch (err) {
      showToast('Failed to load location types', 'error');
      setItems([]);
    } finally {
      setFetching(false);
    }
  };

  // Fetch parent dropdown via /verp-service/locationTypeMaster/dropdown with { FlagId: 3 }
  const fetchParentDropdown = async () => {
    try {
      const res = await locationTypeService.getParentDropdown({ FlagId: 3 });
      const raw = res?.data?.data || res?.data || res;
      if (Array.isArray(raw)) {
        setParentDropdownOptions(raw);
      }
    } catch (err) {
    }
  };

  // Form validation
  const validate = () => {
    const errs = {};
    const locNameErr = validateTextOnly(locationTypeName, 'Location Type Name', true, 2, 100);
    if (locNameErr) {
      errs.childName = locNameErr;
    }

    // Require selection only when Parent Location field is visible (second one onwards)
    if (showParentLocationField && !selectedParentId) {
      errs.parentName = 'Parent Location is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // SUBMIT handler: Add new location type via /verp-service/locationTypeMaster/add (FlagId: 2)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const trimmedChild = locationTypeName.trim();

    // Duplicate check
    const duplicate = items.some(
      item => item.childName.toLowerCase() === trimmedChild.toLowerCase()
    );
    if (duplicate) {
      setErrors({ childName: `"${trimmedChild}" already exists in the flow` });
      showToast(`Location Type "${trimmedChild}" already exists`, 'error');
      return;
    }

    setLoading(true);
    try {
      const sessionUserName = getSessionUserName() || userName || 'Admin';

      // Send payload with FlagId: 2, LocationTypeMasterName, ParentTypeId, and CreatedByUserName
      const payload = {
        FlagId: 2,
        LocationTypeMasterName: trimmedChild,
        ParentTypeId: showParentLocationField && selectedParentId ? Number(selectedParentId) : null,
        CreatedByUserName: sessionUserName
      };

      await locationTypeService.addLocationTypeMaster(payload);
      showToast('Location Type added successfully!', 'success');
      handleReset();
      await loadFlowData();
      await fetchParentDropdown();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to add Location Type', 'error');
    } finally {
      setLoading(false);
    }
  };

  // RESET handler: Clear form fields
  const handleReset = () => {
    setLocationTypeName('');
    setSelectedParentId('');
    setErrors({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header matching portal theme */}
      <PageHeader
        title="Location Type Master"
        description="Define and manage organizational location hierarchy levels, child-to-parent relational flow, and institutional units."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Location Type Master' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="cursor-pointer"
            >
              Reset Form
            </Button>
          </div>
        }
      />

      {/* 2. Top Card: Location Hierarchy Definition Form */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-7">
        <SectionHeader
          icon={GitFork}
          iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          title="Location Type Definition"
          subtitle="Specify the location level name and assign its immediate parent node in the flow hierarchy."
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`grid grid-cols-1 ${showParentLocationField ? 'sm:grid-cols-2' : 'max-w-xl'} gap-5`}>
            {/* Field 1: Location Type Name */}
            <Field label="Location Type Name" required error={errors.childName}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Country, State, District"
                  value={locationTypeName}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setLocationTypeName(sanitized);
                    if (errors.childName) setErrors(prev => ({ ...prev, childName: null }));
                  }}
                  className={`${inputCls(errors.childName)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Field 2: Parent Location Name (Visible & enabled only from the second one onwards) */}
            {showParentLocationField && (
              <Field
                label="Parent Location Name"
                required
                error={errors.parentName}
              >
                <div className="relative">
                  <GitFork className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedParentId}
                    onChange={(e) => {
                      setSelectedParentId(e.target.value);
                      if (errors.parentName) setErrors(prev => ({ ...prev, parentName: null }));
                    }}
                    className={`${selectCls(errors.parentName, false)} pl-9.5`}
                  >
                    <option value="">-- Select Parent Location --</option>
                    {availableParentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            )}
          </div>

          {/* Form Action Buttons matching app button styles */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={loading}
              className="px-6 cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add Location Type'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="cursor-pointer"
            >
              Clear Fields
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Bottom Card: Location Flow Details Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-7">
        <SectionHeader
          icon={Layers}
          iconColor="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
          title="Location Flow Details"
          subtitle="Hierarchical structure displaying child nodes and their corresponding parent authorities."
          badge={
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
              {items.length} {items.length === 1 ? 'Node' : 'Nodes'} Configured
            </span>
          }
        />

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">S.No</th>
                <th className="py-3 px-6">Child Name</th>
                <th className="py-3 px-6">Parent Name</th>
                <th className="py-3 px-6 text-center w-32">Relation</th>
                <th className="py-3 px-4 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fetching ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading location flow details...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No location flow details defined yet.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const isRoot = !row.parentName || row.parentName === '-';

                  return (
                    <tr
                      key={row.id || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {row.childName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Root Authority (-)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            <GitFork className="w-3 h-3 text-slate-400" />
                            {row.parentName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                          {row.childName} <ArrowRight className="w-3 h-3 text-slate-400" /> {row.parentName || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Location Type"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dedicated Edit Location Type Modal */}
      {isEditModalOpen && editingLocationType && (
        <EditLocationTypeMasterModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLocationType(null);
          }}
          locationType={editingLocationType}
          allItems={items}
          onSaveSuccess={async () => {
            await loadFlowData();
            await fetchParentDropdown();
          }}
        />
      )}
    </div>
  );
}

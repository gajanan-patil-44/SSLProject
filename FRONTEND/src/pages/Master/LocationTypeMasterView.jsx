
// src/pages/Master/LocationTypeMasterView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useERPStore } from '../../store/useERPStore';
import { locationTypeService, INITIAL_LOCATION_FLOW } from '../../services/locationTypeService';
import { Modal } from '../../components/ui/Modal';
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
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Network
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
const selectCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all duration-200 cursor-pointer font-medium`;

export default function LocationTypeMasterView() {
  const showToast = useERPStore((state) => state.showToast);

  // Flow items state
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Form input state
  const [locationTypeName, setLocationTypeName] = useState('');
  const [parentLocationName, setParentLocationName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load flow data on mount
  useEffect(() => {
    loadFlowData();
  }, []);

  const loadFlowData = async () => {
    try {
      const data = await locationTypeService.getLocationTypes();
      setItems(data);
    } catch {
      setItems([...INITIAL_LOCATION_FLOW]);
    }
  };

  // Parent location dropdown options
  const parentOptions = useMemo(() => {
    const set = new Set(['Company', '-']);
    items.forEach(it => {
      if (it.childName) set.add(it.childName.trim());
      if (it.parentName && it.parentName !== '-') set.add(it.parentName.trim());
    });
    return Array.from(set);
  }, [items]);

  // Select row for editing
  const handleSelectRow = (item) => {
    if (selectedId === item.id) {
      handleReset();
    } else {
      setSelectedId(item.id);
      setLocationTypeName(item.childName);
      setParentLocationName(item.parentName === '-' ? '' : item.parentName);
      setErrors({});
    }
  };

  // Form validation
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // SUBMIT handler: Add new location flow entry
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const trimmedChild = locationTypeName.trim();
    const trimmedParent = parentLocationName.trim() || '-';

    // Duplicate check
    const duplicate = items.some(
      item => item.childName.toLowerCase() === trimmedChild.toLowerCase() && item.id !== selectedId
    );
    if (duplicate) {
      setErrors({ childName: `"${trimmedChild}" already exists in the flow` });
      showToast(`Location Type "${trimmedChild}" already exists`, 'error');
      return;
    }

    setLoading(true);
    try {
      const created = await locationTypeService.addLocationType({
        childName: trimmedChild,
        parentName: trimmedParent
      });
      setItems(prev => [...prev, created]);
      showToast('Location Type added successfully!', 'success');
      handleReset();
    } catch (err) {
      showToast('Failed to add Location Type', 'error');
    } finally {
      setLoading(false);
    }
  };

  // EDIT handler: Update selected entry
  const handleEdit = async () => {
    if (!selectedId) {
      showToast('Please select a row from the table to edit', 'info');
      return;
    }
    if (!validate()) return;

    const trimmedChild = locationTypeName.trim();
    const trimmedParent = parentLocationName.trim() || '-';

    setLoading(true);
    try {
      const updated = await locationTypeService.updateLocationType(selectedId, {
        childName: trimmedChild,
        parentName: trimmedParent
      });

      setItems(prev => prev.map(item => item.id === selectedId ? updated : item));
      showToast('Location Type updated successfully!', 'success');
      handleReset();
    } catch (err) {
      showToast('Failed to update Location Type', 'error');
    } finally {
      setLoading(false);
    }
  };

  // RESET handler: Clear form fields
  const handleReset = () => {
    setLocationTypeName('');
    setParentLocationName('');
    setSelectedId(null);
    setErrors({});
  };

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete row prompt handler
  const handleDeleteRow = (e, item) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await locationTypeService.deleteLocationType(itemToDelete.id);
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      if (selectedId === itemToDelete.id) handleReset();
      showToast('Location Type removed from flow', 'success');
      setItemToDelete(null);
    } catch {
      showToast('Failed to delete row', 'error');
    } finally {
      setIsDeleting(false);
    }
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
          title={selectedId ? 'Edit Location Type' : 'Location Type Definition'}
          subtitle="Specify the location level name and assign its immediate parent node in the flow hierarchy."
          badge={
            selectedId && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                Editing #{selectedId}
              </span>
            )
          }
        />

        <form onSubmit={selectedId ? handleEdit : handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 1: Location Type Name */}
            <Field label="Location Type Name" required error={errors.childName}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Zone, Circle, Division"
                  value={locationTypeName}
                  onChange={(e) => {
                    setLocationTypeName(e.target.value);
                    if (errors.childName) setErrors(prev => ({ ...prev, childName: null }));
                  }}
                  className={`${inputCls(errors.childName)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Field 2: Parent Location Name */}
            <Field label="Parent Location Name" required error={errors.parentName}>
              <div className="relative">
                <GitFork className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={parentLocationName}
                  onChange={(e) => setParentLocationName(e.target.value)}
                  className={`${selectCls(errors.parentName)} pl-9.5`}
                >
                  <option value="">-- Select Parent Location --</option>
                  {parentOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === '-' ? '- (Top Level / Root)' : opt}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {/* Form Action Buttons matching app button styles */}
          <div className="flex items-center gap-3 pt-2">
            {selectedId ? (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={handleEdit}
                  disabled={loading}
                  className="px-6 cursor-pointer"
                >
                  Update Location Type
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="cursor-pointer"
                >
                  Cancel Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 cursor-pointer"
                >
                  Add Location Type
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
              </>
            )}
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
                <th className="py-3 px-4 w-16 text-center">#</th>
                <th className="py-3 px-6">Child Name</th>
                <th className="py-3 px-6">Parent Name</th>
                <th className="py-3 px-6 text-center w-32">Relation</th>
                <th className="py-3 px-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No location flow details defined yet.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const isSelected = selectedId === row.id;
                  const isRoot = !row.parentName || row.parentName === '-';

                  return (
                    <tr
                      key={row.id || idx}
                      onClick={() => handleSelectRow(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                      }`}
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
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectRow(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Location Type"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRow(e, row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* In-UI Delete Confirmation Modal */}
      {itemToDelete && (
        <Modal
          isOpen={!!itemToDelete}
          onClose={() => {
            if (!isDeleting) setItemToDelete(null);
          }}
          title="Remove Location Type"
          size="sm"
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Remove Entry'}
              </Button>
            </>
          }
        >
          <div className="flex items-start gap-3.5 py-1">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Are you sure you want to remove &ldquo;{itemToDelete.childName}&rdquo; from the flow?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This action cannot be undone and will remove this level from the hierarchy flow.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

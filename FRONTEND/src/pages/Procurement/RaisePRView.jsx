// src/pages/Procurement/RaisePRView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  Paperclip,
  CheckCircle2,
  RotateCcw,
  Save,
  Send,
  Calendar,
  AlertCircle,
  Building,
  Briefcase,
  User,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import {
  generateNextRequirementNo,
  fetchActiveItemMaster,
  procurementPRService,
  FALLBACK_ITEMS
} from './procurementData';

export default function RaisePRView() {
  const navigate = useNavigate();
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // Available Item Master records
  const [itemMasterList, setItemMasterList] = useState(FALLBACK_ITEMS);
  const [loadingItems, setLoadingItems] = useState(false);

  // Today's formatted date (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Form State
  const [requirementNo, setRequirementNo] = useState('');
  const [requestDate, setRequestDate] = useState(todayStr);

  // Logged in user info defaults
  const userDisplayName = currentUser?.name || currentUser?.loginName || 'Praveen Md';
  const userDesignation = currentUser?.designation?.name || currentUser?.role || 'Senior Project Manager';
  const userDepartment = currentUser?.department?.name || currentUser?.department || 'Accounts';
  const userReportingTo = currentUser?.reportingTo || currentUser?.reportingManager || 'Rajesh Sharma (General Manager)';

  const [requestedBy, setRequestedBy] = useState(userDisplayName);
  const [designation, setDesignation] = useState(userDesignation);
  const [department, setDepartment] = useState(userDepartment);
  const [reportingTo, setReportingTo] = useState(userReportingTo);

  // Interactive Form Fields
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [purpose, setPurpose] = useState('');

  // Section C: Items dynamic list
  const [items, setItems] = useState([
    { id: 'row-1', slNo: 1, itemName: '', qty: 1, uom: 'Nos' }
  ]);

  // Section D: Attachments
  const [attachments, setAttachments] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load items from API and initialize requirement number
  useEffect(() => {
    let isMounted = true;
    setLoadingItems(true);

    fetchActiveItemMaster()
      .then((records) => {
        if (isMounted && records && records.length > 0) {
          setItemMasterList(records);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingItems(false);
      });

    // Auto-generate requirement number
    const reqNo = generateNextRequirementNo(userDepartment);
    setRequirementNo(reqNo);

    return () => {
      isMounted = false;
    };
  }, [userDepartment]);

  // Project options
  const projectOptions = ['RNA', 'KPTCL', 'BESCOM', 'MESCOM'];
  const priorityOptions = ['High', 'Medium', 'Low'];

  // Add Item Row
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length + 1}`,
        slNo: prev.length + 1,
        itemName: '',
        qty: 1,
        uom: 'Nos'
      }
    ]);
  };

  // Remove Item Row & recalculate serial numbers
  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      showToast('At least one item row is required.', 'warning');
      return;
    }
    setItems((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((row, idx) => ({
        ...row,
        slNo: idx + 1
      }));
    });
  };

  // Handle item change
  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      if (field === 'qty') {
        if (value === '') {
          copy[index] = { ...copy[index], qty: '' };
        } else {
          const digits = String(value).replace(/\D/g, '').slice(0, 6);
          const num = parseInt(digits, 10);
          copy[index] = { ...copy[index], qty: isNaN(num) ? '' : Math.min(999999, Math.max(1, num)) };
        }
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }

      // Auto-set UOM if item selected
      if (field === 'itemName') {
        const found = itemMasterList.find((it) => it.name === value);
        if (found && found.uom) {
          copy[index].uom = found.uom;
        }
      }
      return copy;
    });
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((file) => {
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      return {
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
    showToast(`${files.length} attachment(s) added successfully.`, 'info');
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validate form
  const validateForm = (isSubmit = true) => {
    const newErrors = {};

    if (isSubmit) {
      if (!project) newErrors.project = 'Project is mandatory';
      if (!priority) newErrors.priority = 'Priority is mandatory';
      if (!requiredDate) newErrors.requiredDate = 'Required Date is mandatory';
      if (!purpose.trim()) newErrors.purpose = 'Purpose / Justification is required';

      // Validate Items
      if (!items || items.length === 0) {
        newErrors.items = 'At least one item must be added';
      } else {
        const hasInvalidItem = items.some((it) => !it.itemName || !it.itemName.trim());
        const hasInvalidQty = items.some((it) => !it.qty || Number(it.qty) <= 0 || isNaN(Number(it.qty)));

        if (hasInvalidItem) {
          newErrors.items = 'Please select a valid item name for all item rows';
        } else if (hasInvalidQty) {
          newErrors.items = 'Quantity must be a positive integer greater than zero';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset / Clear form
  const handleClear = () => {
    setProject('');
    setPriority('');
    setRequiredDate('');
    setPurpose('');
    setItems([{ id: `row-${Date.now()}`, slNo: 1, itemName: '', qty: 1, uom: 'Nos' }]);
    setAttachments([]);
    setErrors({});
    const newReqNo = generateNextRequirementNo(userDepartment);
    setRequirementNo(newReqNo);
    setRequestDate(todayStr);
    setRequestedBy(userDisplayName);
    setDesignation(userDesignation);
    setDepartment(userDepartment);
    setReportingTo(userReportingTo);
    showToast('Requisition form has been cleared.', 'info');
  };

  // Save Draft
  const handleSaveDraft = () => {
    setIsSubmitting(true);
    try {
      const sanitizedItems = items
        .filter((it) => it.itemName && it.itemName.trim())
        .map((it, idx) => ({
          slNo: idx + 1,
          itemName: it.itemName,
          qty: Number(it.qty) || 1,
          uom: it.uom || 'Nos'
        }));

      const payload = {
        requirementNo,
        requestDate,
        requestedBy,
        designation,
        department,
        reportingTo,
        project: project || 'Not Specified',
        priority: priority || 'Medium',
        requiredDate: requiredDate || todayStr,
        purpose: purpose.trim(),
        items: sanitizedItems.length > 0 ? sanitizedItems : items,
        attachments
      };

      procurementPRService.createOrUpdatePR(payload, false);
      showToast('Purchase Requisition saved as draft successfully.', 'success');
      navigate('/procurement/view-prs');
    } catch (err) {
      showToast(err.message || 'Failed to save draft', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Requirement
  const handleSubmitRequirement = (e) => {
    e.preventDefault();
    if (!validateForm(true)) {
      showToast('Please fix all highlighted errors before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitizedItems = items.map((it, idx) => ({
        slNo: idx + 1,
        itemName: it.itemName,
        qty: Number(it.qty),
        uom: it.uom || 'Nos'
      }));

      const payload = {
        requirementNo,
        requestDate,
        requestedBy,
        designation,
        department,
        reportingTo,
        project,
        priority,
        requiredDate,
        purpose: purpose.trim(),
        items: sanitizedItems,
        attachments
      };

      procurementPRService.createOrUpdatePR(payload, true);
      showToast(`Purchase Requisition ${requirementNo} submitted for approval successfully!`, 'success');
      navigate('/procurement/view-prs');
    } catch (err) {
      showToast(err.message || 'Failed to submit Purchase Requisition', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-[#2f73d9]">
              <FileText className="w-6 h-6" />
            </span>
            Raise PR's Request
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a new Purchase Requisition for materials, equipment or project-related requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/procurement/view-prs')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            View All Raised PRs
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2f73d9]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Purchase Requisition Form
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            {requirementNo || 'Generating PR No...'}
          </span>
        </div>

        <form onSubmit={handleSubmitRequirement} className="p-6 sm:p-8 space-y-8">
          {/* SECTION A: Requisition Details */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2f73d9] text-xs font-bold flex items-center justify-center">
                A
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Requisition Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Requirement No */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirement No
                </label>
                <input
                  type="text"
                  value={requirementNo}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-xs sm:text-sm font-mono font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Request Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Request Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={requestDate}
                    readOnly
                    disabled
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Requested By */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requested By
                </label>
                <input
                  type="text"
                  value={requestedBy}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Reporting To */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reporting To
                </label>
                <input
                  type="text"
                  value={reportingTo}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Project (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={project}
                  onChange={(e) => {
                    setProject(e.target.value);
                    if (errors.project) setErrors((prev) => ({ ...prev, project: null }));
                  }}
                  className={`w-full h-10 px-3 text-xs sm:text-sm rounded-lg border dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 ${
                    errors.project
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                >
                  <option value="">-- Select Project --</option>
                  {projectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.project && <p className="text-[11px] text-red-500 mt-1">{errors.project}</p>}
              </div>

              {/* Priority (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    if (errors.priority) setErrors((prev) => ({ ...prev, priority: null }));
                  }}
                  className={`w-full h-10 px-3 text-xs sm:text-sm rounded-lg border dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 ${
                    errors.priority
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                >
                  <option value="">-- Select Priority --</option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.priority && <p className="text-[11px] text-red-500 mt-1">{errors.priority}</p>}
              </div>

              {/* Required Date (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Required Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={requiredDate}
                  onChange={(e) => {
                    setRequiredDate(e.target.value);
                    if (errors.requiredDate) setErrors((prev) => ({ ...prev, requiredDate: null }));
                  }}
                  className={`w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 ${
                    errors.requiredDate
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.requiredDate && <p className="text-[11px] text-red-500 mt-1">{errors.requiredDate}</p>}
              </div>
            </div>
          </div>

          {/* SECTION B: Purpose / Justification */}
          <div className="pt-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2f73d9] text-xs font-bold flex items-center justify-center">
                B
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Purpose / Justification <span className="text-red-500">*</span>
              </h3>
            </div>

            <textarea
              rows={4}
              value={purpose}
              maxLength={500}
              onChange={(e) => {
                setPurpose(e.target.value.slice(0, 500));
                if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: null }));
              }}
              placeholder="Enter purpose or justification."
              className={`w-full p-3.5 text-xs sm:text-sm rounded-xl border dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 leading-relaxed ${
                errors.purpose
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
              }`}
            />
            {errors.purpose && <p className="text-[11px] text-red-500 mt-1">{errors.purpose}</p>}
          </div>

          {/* SECTION C: Items */}
          <div className="pt-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2f73d9] text-xs font-bold flex items-center justify-center">
                  C
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Items <span className="text-red-500">*</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2f73d9] hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {errors.items && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.items}</span>
              </div>
            )}

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">Sl No</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4 w-36">Qty</th>
                    <th className="py-3 px-4 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={row.itemName}
                          onChange={(e) => handleItemFieldChange(idx, 'itemName', e.target.value)}
                          className="w-full h-9 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select Item from Item Master --</option>
                          {itemMasterList.map((it) => (
                            <option key={it.id || it.name} value={it.name}>
                              {it.name} {it.uom ? `(${it.uom})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="999999"
                            step="1"
                            value={row.qty}
                            onKeyDown={(e) => {
                              if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
                            }}
                            onChange={(e) => handleItemFieldChange(idx, 'qty', e.target.value)}
                            className="w-full h-9 px-3 text-xs sm:text-sm font-mono font-semibold rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          />
                          {row.uom && <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{row.uom}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition rounded"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION D: Attachments */}
          <div className="pt-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2f73d9] text-xs font-bold flex items-center justify-center">
                D
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Attachments
              </h3>
            </div>

            <div className="space-y-4">
              {/* File Upload Box */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/20 transition">
                <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Click or drag files here to attach supporting documents
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, Word, Excel, Drawings and Image files
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Uploaded Files ({attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att, attIdx) => (
                      <div
                        key={attIdx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {att.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{att.size} • {att.uploadedAt}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attIdx)}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION E: Form Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2f73d9] hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit Requirement
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


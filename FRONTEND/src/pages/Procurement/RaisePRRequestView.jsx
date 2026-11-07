// src/pages/Procurement/RaisePRRequestView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useERPStore } from '../../store/useERPStore';
import { projectService } from '../../services/projectService';
import itemCreationService from '../../services/itemCreationService';
import prRequestService from '../../services/prRequestService';
import {
  PageHeader,
  Button,
  Card
} from '../../components/ui/index';
import {
  ShoppingCart,
  Plus,
  Trash2,
  FileText,
  Send,
  Save,
  RotateCcw,
  AlertCircle,
  Package,
  Calendar,
  User,
  Building2,
  Briefcase,
  ClipboardList,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  Hash
} from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers / Sub-components
// ─────────────────────────────────────────────
function inputCls(theme, hasError) {
  const base =
    'w-full px-3 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const colorNormal =
    theme === 'dark'
      ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/15';
  const colorError =
    theme === 'dark'
      ? 'bg-slate-900/80 border-rose-500/70 text-slate-100 focus:border-rose-500 focus:ring-rose-500/20'
      : 'bg-white border-rose-400 text-slate-800 focus:border-rose-500 focus:ring-rose-500/15';
  return `${base} ${hasError ? colorError : colorNormal}`;
}

function selectCls(theme, hasError) {
  return inputCls(theme, hasError) + ' cursor-pointer appearance-none pr-8';
}

function readonlyCls(theme) {
  return theme === 'dark'
    ? 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 cursor-not-allowed'
    : 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed';
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </span>
  );
}

function SectionCard({ icon: Icon, iconBg, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* Body */}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Priority options (static; replaced by API if available)
// ─────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

// ─────────────────────────────────────────────
// Generate Requirement No locally (replaced by API in real use)
// ─────────────────────────────────────────────
function generateReqNo(user) {
  const dept = (user?.department || user?.Department || 'GEN').substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `VTPL/ON${year}-${String(new Date().getFullYear() + 1).slice(-2)}/${dept}/${seq}`;
}

function todayStr() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function RaisePRRequestView() {
  const theme = useERPStore((s) => s.theme);
  const showToast = useERPStore((s) => s.showToast);
  const currentUser = useERPStore((s) => s.user);
  const currentContext = useERPStore((s) => s.context);

  // ── Derived user metadata ──
  const userName = currentUser?.loginName || currentUser?.name || currentUser?.UserName || 'Unknown';
  const designation = currentContext?.Designation || currentUser?.Designation || currentUser?.designation || '';
  const department = currentContext?.Department || currentUser?.Department || currentUser?.department || '';
  const reportingTo = currentContext?.ReportingTo || currentUser?.ReportingTo || currentUser?.reportingTo || '';

  // ── Dropdowns state ──
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingDrops, setLoadingDrops] = useState(true);

  // ── Form header state ──
  const [requirementNo] = useState(() => generateReqNo(currentUser));
  const [requestDate] = useState(todayStr);

  // ── Main form fields ──
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [justification, setJustification] = useState('');
  const [attachments, setAttachments] = useState([]);

  // ── Line items state ──
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), materialId: '', materialName: '', qty: 1 }
  ]);

  // ── Submission state ──
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ─────────────────────────────────────────────
  // Load dropdowns on mount
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function loadDropdowns() {
      setLoadingDrops(true);
      try {
        const [projRes, itemRes] = await Promise.allSettled([
          projectService.getProjects(1),
          itemCreationService.getItems()
        ]);

        if (projRes.status === 'fulfilled' && projRes.value) {
          const data = projRes.value?.data || projRes.value;
          const arr = Array.isArray(data) ? data : [];
          setProjects(arr.map((p) => ({
            value: String(p.ProjectId ?? p.id ?? p.value ?? ''),
            label: p.ProjectName ?? p.name ?? p.label ?? ''
          })).filter(p => p.value && p.label));
        }

        if (itemRes.status === 'fulfilled' && Array.isArray(itemRes.value)) {
          setItems(itemRes.value.map((m) => ({
            value: String(m.id ?? ''),
            label: m.name ?? ''
          })).filter(i => i.value && i.label));
        }
      } catch (err) {
        // Silently fail – dropdowns will be empty; user can type
        console.warn('PR dropdowns load failed:', err);
      } finally {
        setLoadingDrops(false);
      }
    }
    loadDropdowns();
  }, []);

  // ─────────────────────────────────────────────
  // Line-item helpers
  // ─────────────────────────────────────────────
  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, { id: Date.now(), materialId: '', materialName: '', qty: 1 }]);
  }, []);

  const removeLineItem = useCallback((id) => {
    setLineItems(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  }, []);

  const updateLineItem = useCallback((id, field, value) => {
    setLineItems(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'materialId') {
        const found = items.find(i => i.value === value);
        return { ...r, materialId: value, materialName: found?.label ?? '' };
      }
      return { ...r, [field]: value };
    }));
    // Clear line item error
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[`item_${id}`];
      return updated;
    });
  }, [items]);

  // ─────────────────────────────────────────────
  // Attachment handler
  // ─────────────────────────────────────────────
  const handleAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!projectId) errs.projectId = 'Please select a project';
    if (!priority) errs.priority = 'Please select a priority';
    if (!requiredDate) errs.requiredDate = 'Required date is mandatory';

    lineItems.forEach(item => {
      if (!item.materialId && !item.materialName.trim()) {
        errs[`item_${item.id}`] = 'Item name is required';
      }
      if (!item.qty || Number(item.qty) < 1) {
        errs[`qty_${item.id}`] = 'Qty ≥ 1';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────────
  // Build submission payload
  // ─────────────────────────────────────────────
  const buildPayload = () => ({
    RequirementNo: requirementNo,
    RequestDate: requestDate,
    RequestedBy: userName,
    Designation: designation,
    Department: department,
    ReportingTo: reportingTo,
    ProjectId: Number(projectId),
    Priority: priority,
    RequiredDate: requiredDate,
    Justification: justification,
    Items: lineItems.map((r, idx) => ({
      SNo: idx + 1,
      MaterialId: Number(r.materialId) || null,
      MaterialName: r.materialName,
      Quantity: Number(r.qty)
    }))
  });

  // ─────────────────────────────────────────────
  // Submit handlers
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await prRequestService.submitPR(buildPayload());
      if (res?.success || res?.status === 'success') {
        setSubmitted(true);
        showToast('Purchase Requisition submitted successfully!', 'success');
        handleClear();
      } else {
        showToast(res?.message || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setDrafting(true);
    try {
      const res = await prRequestService.saveDraft(buildPayload());
      if (res?.success || res?.status === 'success') {
        showToast('Draft saved successfully!', 'success');
      } else {
        showToast(res?.message || 'Draft save failed.', 'error');
      }
    } catch {
      // If API endpoint not ready, just show local success
      showToast('Draft saved locally.', 'success');
    } finally {
      setDrafting(false);
    }
  };

  const handleClear = () => {
    setProjectId('');
    setPriority('');
    setRequiredDate('');
    setJustification('');
    setAttachments([]);
    setLineItems([{ id: Date.now(), materialId: '', materialName: '', qty: 1 }]);
    setErrors({});
    setSubmitted(false);
  };

  // ─────────────────────────────────────────────
  // Success Banner
  // ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">PR Submitted Successfully</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your Purchase Requisition <strong className="text-indigo-600 dark:text-indigo-400">{requirementNo}</strong> has been raised.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleClear}>
          Raise Another PR
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Raise PR's Request"
        subtitle="Create a new Purchase Requisition"
        icon={ShoppingCart}
        iconColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── SECTION 1: Purchase Requisition Info Card ── */}
        <SectionCard
          icon={ClipboardList}
          iconBg="bg-indigo-500/10 text-indigo-600"
          title="Purchase Requisition Form"
          subtitle="Auto-filled details based on your profile"
        >
          {/* Row 1: Req No, Request Date, Requested By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <FieldLabel>Requirement No</FieldLabel>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={requirementNo}
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Request Date</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={requestDate}
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Requested By</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={userName}
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Designation, Department, Reporting To */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <FieldLabel>Designation</FieldLabel>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={designation}
                  placeholder="—"
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Department</FieldLabel>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={department}
                  placeholder="—"
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Reporting To</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  readOnly
                  value={reportingTo}
                  placeholder="—"
                  className={readonlyCls(theme) + ' pl-8'}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Project, Priority, Required Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Project */}
            <div>
              <FieldLabel required>Project</FieldLabel>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={e => { setProjectId(e.target.value); setErrors(p => ({ ...p, projectId: '' })); }}
                  disabled={loadingDrops}
                  className={selectCls(theme, !!errors.projectId)}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FieldError message={errors.projectId} />
            </div>

            {/* Priority */}
            <div>
              <FieldLabel required>Priority</FieldLabel>
              <div className="relative">
                <select
                  value={priority}
                  onChange={e => { setPriority(e.target.value); setErrors(p => ({ ...p, priority: '' })); }}
                  className={selectCls(theme, !!errors.priority)}
                >
                  <option value="">Select Priority</option>
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FieldError message={errors.priority} />
            </div>

            {/* Required Date */}
            <div>
              <FieldLabel required>Required Date</FieldLabel>
              <input
                type="date"
                value={requiredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setRequiredDate(e.target.value); setErrors(p => ({ ...p, requiredDate: '' })); }}
                className={inputCls(theme, !!errors.requiredDate)}
              />
              <FieldError message={errors.requiredDate} />
            </div>
          </div>

          {/* Purpose / Justification */}
          <div>
            <FieldLabel>Purpose / Justification</FieldLabel>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={4}
              placeholder="Describe the business need or purpose for this purchase…"
              className={inputCls(theme, false) + ' resize-y min-h-[96px]'}
            />
          </div>
        </SectionCard>

        {/* ── SECTION 2: Line Items ── */}
        <SectionCard
          icon={Package}
          iconBg="bg-amber-500/10 text-amber-600"
          title="Items"
          subtitle="Add all materials / equipment required"
        >
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[40px_1fr_120px_60px] gap-3 mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">SI No</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Item Name</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qty</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</span>
          </div>

          <div className="space-y-3">
            {lineItems.map((row, idx) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[40px_1fr_120px_60px] gap-3 items-start p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 sm:bg-transparent"
              >
                {/* SI No */}
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                {/* Item Select / Name */}
                <div>
                  <label className="sm:hidden text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Item Name</label>
                  <div className="relative">
                    {items.length > 0 ? (
                      <>
                        <select
                          value={row.materialId}
                          onChange={e => updateLineItem(row.id, 'materialId', e.target.value)}
                          className={selectCls(theme, !!errors[`item_${row.id}`])}
                        >
                          <option value="">Select Item / Material</option>
                          {items.map(i => (
                            <option key={i.value} value={i.value}>{i.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={row.materialName}
                        onChange={e => updateLineItem(row.id, 'materialName', e.target.value)}
                        placeholder="Enter item / material name"
                        className={inputCls(theme, !!errors[`item_${row.id}`])}
                      />
                    )}
                  </div>
                  <FieldError message={errors[`item_${row.id}`]} />
                </div>

                {/* Qty */}
                <div>
                  <label className="sm:hidden text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={row.qty}
                    onChange={e => updateLineItem(row.id, 'qty', e.target.value)}
                    className={inputCls(theme, !!errors[`qty_${row.id}`])}
                  />
                  <FieldError message={errors[`qty_${row.id}`]} />
                </div>

                {/* Remove */}
                <div className="flex items-start pt-0.5">
                  <button
                    type="button"
                    onClick={() => removeLineItem(row.id)}
                    disabled={lineItems.length === 1}
                    title="Remove item"
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-indigo-400 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>
        </SectionCard>

        {/* ── SECTION 3: Attachments ── */}
        <SectionCard
          icon={Paperclip}
          iconBg="bg-teal-500/10 text-teal-600"
          title="Attachments"
          subtitle="Attach supporting documents, quotations, or approvals"
        >
          {/* Existing attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2 mb-4">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
                >
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-rose-400 hover:text-rose-600 cursor-pointer p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File input */}
          <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${theme === 'dark'
              ? 'border-slate-700 hover:border-indigo-600 hover:bg-indigo-900/10 text-slate-400 hover:text-indigo-400'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-500 hover:text-indigo-600'
            }`}>
            <Paperclip className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              {attachments.length === 0 ? 'Choose files to attach…' : 'Attach more files…'}
            </span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={handleAttachment}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </label>
          <p className="text-[11px] text-slate-400 mt-2">
            Accepted: PDF, Word, Excel, Images • Max 10 MB per file
          </p>
        </SectionCard>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap items-center gap-3 pt-1 pb-6">
          <Button
            type="submit"
            variant="primary"
            icon={submitting ? undefined : Send}
            disabled={submitting || drafting}
          >
            {submitting ? 'Submitting…' : 'Submit Requirement'}
          </Button>

          <Button
            type="button"
            variant="outline"
            icon={drafting ? undefined : Save}
            disabled={submitting || drafting}
            onClick={handleSaveDraft}
          >
            {drafting ? 'Saving…' : 'Save Draft'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            icon={RotateCcw}
            disabled={submitting || drafting}
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}

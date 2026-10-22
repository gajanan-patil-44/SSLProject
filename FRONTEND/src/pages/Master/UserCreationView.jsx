// src/pages/Master/UserCreationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus, Phone, Mail, Lock, User, Calendar, Briefcase,
  Building, Package, FolderOpen, ShieldCheck, Upload, X,
  FileText, Image, Plus, Trash2, RefreshCw, CheckCircle2,
  AlertCircle, Eye, EyeOff, UserCog, Hash, ArrowLeft,
  ArrowRight, Check, ChevronRight, ChevronDown, Sparkles
} from 'lucide-react';
import { Button, PageHeader } from '../../components/ui/index';
import { userService } from '../../services/userService';
import { useERPStore } from '../../store/useERPStore';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateCode,
  validatePassword,
  validateDateOfBirth,
  validateDateOfJoining
} from '../../utils/validators';

// ─── Helper to retrieve logged-in session details ───────────────────────────
const getSessionAuth = () => {
  let employeeId = '';
  let loginName = '';

  // 1. Read from the unified session object in localStorage or sessionStorage
  try {
    const rawSession = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (rawSession) {
      const sessionObj = JSON.parse(rawSession);
      const user = sessionObj?.data?.user;
      if (user?.EmployeeId) employeeId = String(user.EmployeeId);
      if (user?.loginName) loginName = String(user.loginName);

      // Fallback to token if not in user
      if (!employeeId || !loginName) {
        const token = sessionObj?.token?.accessToken;
        if (token) {
          const parts = token.split('.');
          if (parts[1]) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const jwt = JSON.parse(jsonPayload);
            if (!employeeId && jwt?.EmployeeId) employeeId = String(jwt.EmployeeId);
            if (!loginName && (jwt?.LoginName || jwt?.loginName)) loginName = String(jwt.LoginName || jwt.loginName);
          }
        }
      }
    }
  } catch (err) {
  }

  // 2. Legacy fallback if migrating
  if (!employeeId || !loginName) {
    try {
      const u = JSON.parse(localStorage.getItem('erp_user') || sessionStorage.getItem('erp_user') || '{}');
      if (!employeeId && (u.EmployeeId || u.employeeId)) employeeId = String(u.EmployeeId || u.employeeId);
      if (!loginName && (u.loginName || u.LoginName)) loginName = String(u.loginName || u.LoginName);
    } catch {}
  }

  return {
    EmployeeId: employeeId || '',
    loginName: loginName || '',
  };
};

// ─── Steps definition ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Personal Information', short: 'Personal', desc: 'Identity & contact info', icon: User },
  { id: 2, title: 'Account Credentials', short: 'Credentials', desc: 'Login & authentication', icon: Lock },
  { id: 3, title: 'Company Assignment', short: 'Company', desc: 'Company, product & role', icon: Building },
  { id: 4, title: 'Profile Photo', short: 'Photo', desc: 'User picture / avatar', icon: Image },
  { id: 5, title: 'User Documents', short: 'Documents', desc: 'Certificates & files', icon: FileText },
];

// ─── Initial Form Factory ──────────────────────────────────────────────────
const getInitialForm = () => ({
  EmployeeId: '',
  FirstName: '',
  MiddleName: '',
  LastName: '',
  PhoneNumber: '',
  AltPhoneNumber: '',
  DateOfBirth: '',
  DateOfJoining: '',
  GenderId: '',
  MaritalStatusId: '',
  DesignationId: '',
  Email: '',
  LoginName: '',
  Password: '',
  CompanyId: '',
  ReportingManagerUserId: [],  // multi
  CompanyProductId: [],        // multi
  ProjectId: [],               // multi
  RoleId: '',
});

// ─── Shared field wrapper (same label/error style as app) ─────────────────
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

// ─── Shared input class (matches app theme exactly) ────────────────────────
const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-lg border ${
    err
      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
      : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
  } bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200`;

const selectCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-lg border ${
    err
      ? 'border-rose-400'
      : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
  } bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all duration-200 cursor-pointer`;

// ─── Section header card inside a white card ──────────────────────────────
function SectionHeader({ icon: Icon, iconColor, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
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
  );
}

// ─── Custom click-to-toggle Multi-Select Dropdown ──────────────────────────
function MultiSelectDropdown({
  name, options = [], value = [], onMultiChange,
  placeholder = '— Select —',
  disabledPlaceholder = '— Select Company first —',
  disabled = false, error = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val) => {
    const next = value.includes(val)
      ? value.filter(v => v !== val)
      : [...value, val];
    onMultiChange(name, next);
  };

  const selectedItems = options.filter(o => value.includes(o.value));

  const triggerCls = [
    'w-full min-h-[40px] px-3 py-2 text-sm rounded-lg border text-left flex items-start justify-between gap-2 transition-all duration-200 focus:outline-none',
    error ? 'border-rose-400' : open
      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-800'
      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(p => !p)}
        className={triggerCls}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-w-0">
          {selectedItems.length === 0 ? (
            <span className="text-slate-400 dark:text-slate-500 text-xs leading-6">
              {disabled ? disabledPlaceholder : placeholder}
            </span>
          ) : (
            selectedItems.map(item => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                {item.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); toggle(item.value); }}
                  className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 cursor-pointer leading-none text-sm"
                >×</span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 mt-1 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center italic">No options available</div>
          ) : (
            options.map(o => {
              const selected = value.includes(o.value);
              return (
                <button
                  key={o.key ?? o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {selected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span className="flex-1 text-xs font-medium leading-tight">{o.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── File type icon ────────────────────────────────────────────────────────
function FileIcon({ mime = '' }) {
  if (mime.startsWith('image/'))
    return <Image className="w-4 h-4 text-blue-500 shrink-0" />;
  if (mime === 'application/pdf')
    return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
  return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function UserCreationView() {
  const [form, setForm]                       = useState(getInitialForm);
  const [errors, setErrors]                   = useState({});
  const [showPwd, setShowPwd]                 = useState(false);
  const [photo, setPhoto]                     = useState(null);   // { file, preview }
  const [userFiles, setUserFiles]             = useState({});     // { [fileTypeId]: File }
  const [designations, setDesignations]       = useState([]);
  const [genders, setGenders]                 = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [companies, setCompanies]             = useState([]);
  const [reportingManagers, setReportingManagers] = useState([]);
  const [products, setProducts]               = useState([]);
  const [projects, setProjects]               = useState([]);
  const [roles, setRoles]                     = useState([]);
  const [fileTypes, setFileTypes]             = useState([]);
  const [submitting, setSubmitting]           = useState(false);
  const [result, setResult]                   = useState(null);   // { ok, msg }
  const [createdUserSummary, setCreatedUserSummary] = useState(null);
  const [formKey, setFormKey]                 = useState(0);

  // ── Wizard State ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep]         = useState(1);
  const [completedSteps, setCompletedSteps]   = useState([]);

  const photoRef    = useRef();
  const fileRef     = useRef();

  // ── Load initial dropdowns ───────────────────────────────────────────────
  useEffect(() => { loadDropdowns(); }, []);

  const loadDropdowns = async () => {
    const [genderRes, maritalRes, compRes, rolesRes, fileTypesRes] = await Promise.allSettled([
      userService.getGenderDropdown(),
      userService.getMaritalStatusDropdown(),
      userService.getCompanyDropdown(),
      userService.getRoleDropdown(),         // FlagId: 4 → /companyproductprojectdropdown
      userService.getFileTypes(),            // FlagId: 1 → /fileType/getfiletypes
    ]);
    if (genderRes.status === 'fulfilled')
      setGenders(toOpts(genderRes.value?.data ?? genderRes.value, 'GenderId', 'GenderName'));
    if (maritalRes.status === 'fulfilled')
      setMaritalStatuses(toOpts(maritalRes.value?.data ?? maritalRes.value, 'MaritalStatusId', 'MaritalStatusName'));
    if (compRes.status === 'fulfilled')
      setCompanies(toOpts(compRes.value?.data ?? compRes.value, 'CompanyId', 'CompanyName'));
    if (rolesRes.status === 'fulfilled')
      setRoles(toOpts(rolesRes.value?.data ?? rolesRes.value, 'RoleId', 'RoleName'));
    if (fileTypesRes.status === 'fulfilled') {
      const raw = fileTypesRes.value?.data ?? fileTypesRes.value;
      setFileTypes(toOpts(raw, 'FileTypeId', 'FileTypeName'));
    }
  };

  // Converts API array to select options — filters entries with missing IDs to avoid duplicate "" keys
  const toOpts = (arr, vk, lk) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(i => {
        const val = i[vk] ?? (vk === 'DesignationId' ? i.CompanyDesignationId : undefined);
        return val !== null && val !== undefined && val !== '';
      })
      .map((i, idx) => {
        const val = i[vk] ?? (vk === 'DesignationId' ? i.CompanyDesignationId : undefined);
        return {
          value: String(val),
          label:  i[lk] ?? String(val),
          key:    `${String(val)}_${idx}`,   // guaranteed unique key
        };
      });
  };

  // ── Fetch Reporting Managers — requires BOTH CompanyId AND DesignationId (FlagId:4) ──
  const fetchReportingManagers = async (companyId, designationId) => {
    if (!companyId || !designationId) { setReportingManagers([]); return; }
    try {
      const res = await userService.getReportingManagerDropdown(companyId, designationId);
      const raw = res?.data ?? res;
      if (Array.isArray(raw)) {
        setReportingManagers(
          raw
            .filter(i => (i.UserId ?? i.ReportingManagerUserId ?? i.Id) != null && (i.UserId ?? i.ReportingManagerUserId ?? i.Id) !== '')
            .map((i, idx) => {
              const val = String(i.UserId ?? i.ReportingManagerUserId ?? i.Id);
              const nm  = i.ReportingManagerName || i.UserName || i.FullName || val;
              const desig = i.DesignationName ? ` (${i.DesignationName})` : '';
              return { value: val, label: `${nm}${desig}`.trim(), key: `${val}_${idx}` };
            })
        );
      } else {
        setReportingManagers([]);
      }
    } catch (err) {
      setReportingManagers([]);
    }
  };

  // ── Smart change handler (single-value fields only) ───────────────────────
  const change = async e => {
    const { name, value } = e.target;

    if (name === 'DesignationId') {
      // Clear reporting managers when designation changes
      setForm(f => ({ ...f, DesignationId: value, ReportingManagerUserId: [] }));
      setErrors(er => ({ ...er, DesignationId: '' }));
      setReportingManagers([]);
      // Trigger fetch only if Company is already selected
      if (value && form.CompanyId) {
        fetchReportingManagers(form.CompanyId, value);
      }
      return;
    }

    if (name === 'CompanyId') {
      setForm(f => ({ ...f, CompanyId: value, DesignationId: '', CompanyProductId: [], ProjectId: [], ReportingManagerUserId: [] }));
      setProducts([]);
      setProjects([]);
      setDesignations([]);
      setReportingManagers([]);
      setErrors(er => ({ ...er, CompanyId: '', DesignationId: '', CompanyProductId: '', ProjectId: '', ReportingManagerUserId: '' }));
      if (!value) return;

      // 1. Fetch Company Products
      try {
        const r = await userService.getProductDropdown(value);
        const raw = r?.data ?? r;
        setProducts(
          Array.isArray(raw)
            ? raw
                .filter(item => item.ProductId !== null && item.ProductId !== undefined && item.ProductId !== '')
                .map((item, idx) => ({
                  value: String(item.ProductId),
                  label: item.ProductName ?? String(item.ProductId),
                  key: `${String(item.ProductId)}_${idx}`,
                  companyProductId: item.CompanyProductId,
                }))
            : []
        );
      } catch (err) {
        setProducts([]);
      }

      // 2. Fetch Designations for selected Company (FlagId: 3 with CompanyId)
      try {
        const dRes = await userService.getDesignationDropdown(value);
        const rawList = dRes?.data?.Designations || dRes?.data?.designations || (Array.isArray(dRes?.data) ? dRes.data : null) || (Array.isArray(dRes) ? dRes : []);
        const normalized = Array.isArray(rawList)
          ? rawList.map(d => ({
              ...d,
              DesignationId: d.DesignationId ?? d.CompanyDesignationId ?? d.id,
              DesignationName: d.DesignationName ?? d.name
            }))
          : [];
        setDesignations(toOpts(normalized, 'DesignationId', 'DesignationName'));
      } catch (err) {
        setDesignations([]);
      }
      return;
    }

    // Default single-value fields (RoleId, GenderId, etc.)
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: '' }));
  };

  // ── Fetch projects for multiple product IDs, merging deduplicated results ─
  const fetchProjectsForProducts = async (productIds) => {
    if (!productIds || productIds.length === 0) { setProjects([]); return; }
    try {
      const selectedProducts = productIds
        .map(productId => products.find(product => product.value === String(productId)))
        .filter(product => product && product.companyProductId != null);
      const results = await Promise.allSettled(
        selectedProducts.map(product =>
          userService.getProjectDropdown(product.value, product.companyProductId)
        )
      );
      const combined = [];
      const seen = new Set();
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          const raw = r.value?.data ?? r.value;
          if (Array.isArray(raw)) {
            toOpts(raw, 'ProjectId', 'ProjectName').forEach(o => {
              if (!seen.has(o.value)) { seen.add(o.value); combined.push(o); }
            });
          }
        }
      });
      setProjects(combined);
    } catch {
      setProjects([]);
    }
  };

  // ── Multi-select handler (called by MultiSelectDropdown component) ─────────
  const multiChange = async (name, newValues) => {
    if (name === 'CompanyProductId') {
      setForm(f => ({ ...f, CompanyProductId: newValues, ProjectId: [] }));
      setProjects([]);
      setErrors(er => ({ ...er, CompanyProductId: '', ProjectId: '' }));
      if (newValues.length > 0) await fetchProjectsForProducts(newValues);
      return;
    }
    if (name === 'ProjectId') {
      setForm(f => ({ ...f, ProjectId: newValues }));
      setErrors(er => ({ ...er, ProjectId: '' }));
      return;
    }
    if (name === 'ReportingManagerUserId') {
      setForm(f => ({ ...f, ReportingManagerUserId: newValues }));
      setErrors(er => ({ ...er, ReportingManagerUserId: '' }));
      return;
    }
  };

  const onPhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto({ file, preview: URL.createObjectURL(file) });
    setErrors(er => ({ ...er, Photo: '' }));
  };
  const removePhoto = () => { setPhoto(null); if (photoRef.current) photoRef.current.value = ''; };

  // ── Per-FileType upload handlers ──────────────────────────────────────────
  const onAddFiles = () => {}; // kept for ref compat
  const onFileForType = (fileTypeId, file) => {
    if (!file) return;
    setUserFiles(prev => ({ ...prev, [fileTypeId]: file }));
  };
  const removeFileForType = (fileTypeId) => {
    setUserFiles(prev => {
      const next = { ...prev };
      delete next[fileTypeId];
      return next;
    });
  };

  // ── Step-by-Step Validation ───────────────────────────────────────────────
  const validateStep = (step) => {
    const e = {};

    if (step === 1) {
      const empErr = validateCode(form.EmployeeId, 'Employee ID', true);
      if (empErr) e.EmployeeId = empErr;

      const fnErr = validateName(form.FirstName, 'First name', true);
      if (fnErr) e.FirstName = fnErr;

      if (form.MiddleName) {
        const mnErr = validateName(form.MiddleName, 'Middle name', false);
        if (mnErr) e.MiddleName = mnErr;
      }

      if (form.LastName) {
        const lnErr = validateName(form.LastName, 'Last name', false);
        if (lnErr) e.LastName = lnErr;
      }

      const phoneErr = validatePhone(form.PhoneNumber, 'Phone number', true);
      if (phoneErr) e.PhoneNumber = phoneErr;

      if (form.AltPhoneNumber) {
        const altPhoneErr = validatePhone(form.AltPhoneNumber, 'Alternate phone number', false);
        if (altPhoneErr) e.AltPhoneNumber = altPhoneErr;
      }

      const dobErr = validateDateOfBirth(form.DateOfBirth, 18, true);
      if (dobErr) e.DateOfBirth = dobErr;

      const dojErr = validateDateOfJoining(form.DateOfJoining, form.DateOfBirth, true);
      if (dojErr) e.DateOfJoining = dojErr;

      if (!form.GenderId) e.GenderId = 'Select a gender';
      if (!form.MaritalStatusId) e.MaritalStatusId = 'Select marital status';
    }

    if (step === 2) {
      const emailErr = validateEmail(form.Email, 'Email address', true);
      if (emailErr) e.Email = emailErr;

      if (!form.LoginName.trim()) {
        e.LoginName = 'Login username is required';
      } else if (form.LoginName.trim().length < 3) {
        e.LoginName = 'Login username must be at least 3 characters';
      }

      const passErr = validatePassword(form.Password, 'Password', 6, true);
      if (passErr) e.Password = passErr;
    }

    if (step === 3) {
      if (!form.CompanyId)                                                        e.CompanyId        = 'Select a company';
      if (!form.RoleId)                                                           e.RoleId           = 'Select a role';
    }

    if (step === 4) {
      if (!photo)                                                    e.Photo            = 'Profile photo is required';
    }

    if (step === 5) {
      // No mandatory documents — all optional per file type
    }

    return e;
  };

  // Full validation for submission
  const validateAll = () => {
    let allErrors = {};
    for (let s = 1; s <= 5; s++) {
      allErrors = { ...allErrors, ...validateStep(s) };
    }
    return allErrors;
  };

  // ── Navigation Handlers ───────────────────────────────────────────────────
  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])));
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepId) => {
    // Can jump if already completed or current step
    if (completedSteps.includes(stepId) || stepId <= currentStep) {
      setErrors({});
      setCurrentStep(stepId);
    }
  };

  // ── Progress Percentage Calculation ───────────────────────────────────────
  // 0% at initial, 20% on completing Step 1, 40% on Step 2, 60% on Step 3, 80% on Step 4, 100% on Step 5
  const progressPercent = Math.min(100, Math.round(
    ((completedSteps.length) / STEPS.length) * 100
  ));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async e => {
    if (e) e.preventDefault();
    setResult(null);

    const allErr = validateAll();
    if (Object.keys(allErr).length) {
      setErrors(allErr);
      // Jump to the earliest step with an error
      for (let s = 1; s <= 5; s++) {
        const stepErrs = validateStep(s);
        if (Object.keys(stepErrs).length > 0) {
          setCurrentStep(s);
          break;
        }
      }
      return;
    }

    const sessionAuth = getSessionAuth();
    const empId = form.EmployeeId.trim();
    const createdBy = sessionAuth.loginName;

    const fd = new FormData();
    fd.append('EmployeeId',         empId);
    fd.append('FirstName',          form.FirstName.trim());
    if (form.MiddleName.trim()) {
      fd.append('MiddleName',       form.MiddleName.trim());
    }
    if (form.LastName.trim()) {
      fd.append('LastName',         form.LastName.trim());
    }
    fd.append('PhoneNumber',        form.PhoneNumber.trim());
    if (form.AltPhoneNumber.trim()) {
      fd.append('AltPhoneNumber',   form.AltPhoneNumber.trim());
    }
    fd.append('DateOfBirth',        form.DateOfBirth);
    fd.append('DateOfJoining',      form.DateOfJoining);
    fd.append('GenderId',           form.GenderId);
    fd.append('MaritalStatusId',    form.MaritalStatusId);
    fd.append('DesignationId',      form.DesignationId);
    fd.append('Email',              form.Email.trim());
    fd.append('LoginName',          form.LoginName.trim());
    fd.append('Photo',              photo.file);
    fd.append('Password',           form.Password);
    if (createdBy) {
      fd.append('CreatedByUserName', createdBy);
    }
    fd.append('CompanyId',          form.CompanyId);
    // ReportingManagerUserId — multi
    const managerIds = Array.isArray(form.ReportingManagerUserId) ? form.ReportingManagerUserId : (form.ReportingManagerUserId ? [form.ReportingManagerUserId] : []);
    fd.append('ReportingManagerUserId', JSON.stringify(managerIds.map(Number)));
    // CompanyProductId — multi
    const productIds = Array.isArray(form.CompanyProductId) ? form.CompanyProductId : (form.CompanyProductId ? [form.CompanyProductId] : []);
    fd.append('CompanyProductId', JSON.stringify(productIds.map(Number)));
    // ProjectId — multi
    const projectIds = Array.isArray(form.ProjectId) ? form.ProjectId : (form.ProjectId ? [form.ProjectId] : []);
    fd.append('ProjectId', JSON.stringify(projectIds.map(Number)));
    fd.append('RoleId',             form.RoleId);
    // User documents — keyed by fileTypeId
    Object.entries(userFiles).forEach(([ftId, file]) => {
      fd.append('FileTypeId', ftId);
      fd.append('UserFile',   file);
    });


    try {
      setSubmitting(true);
      const res = await userService.createUser(fd);
      const successMsg = res?.message || 'User created successfully!';

      // Capture summary of created user for celebration badge
      const summary = {
        name: `${form.FirstName} ${form.LastName}`.trim() || 'New User',
        employeeId: empId,
        email: form.Email,
        loginName: form.LoginName,
        company: companies.find(c => String(c.value) === String(form.CompanyId))?.label || '—',
        role: roles.find(r => String(r.value) === String(form.RoleId))?.label || '—',
        designation: designations.find(d => String(d.value) === String(form.DesignationId))?.label || '—',
      };
      setCreatedUserSummary(summary);
      setResult({ ok: true, msg: successMsg });
      useERPStore.getState().showToast(successMsg, 'success');

      // Cleanly reset everything: form fields, file inputs, dropdown cascades, and reset stepper back to Step 1 (0%)
      resetAllState(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errMsg = err?.message || 'Failed to create user. Please try again.';
      setResult({ ok: false, msg: errMsg });
      useERPStore.getState().showToast(errMsg, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Central Comprehensive Reset ─────────────────────────────────────────
  const resetAllState = (clearSummary = true) => {
    setForm(getInitialForm());
    setErrors({});
    setShowPwd(false);
    setPhoto(null);
    setUserFiles({});
    setProducts([]);
    setProjects([]);
    setDesignations([]);
    setReportingManagers([]);
    setCompletedSteps([]);
    setCurrentStep(1);
    if (photoRef.current) photoRef.current.value = '';
    if (fileRef.current)  fileRef.current.value  = '';
    setFormKey(k => k + 1); // Increments key to force fresh unmount/remount of all input DOM elements
    if (clearSummary) {
      setResult(null);
      setCreatedUserSummary(null);
    }
  };

  const handleReset = () => {
    resetAllState(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full">

      {/* Page Header */}
      <PageHeader
        title="User Creation Wizard"
        description="Register a new system user with profile, credentials, company assignment and supporting documents."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'User Creation' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleReset} disabled={submitting}>
              Reset Form
            </Button>
          </div>
        }
      />

      {/* Result / Success Celebration Card */}
      {result && result.ok && createdUserSummary && (
        <div className="p-6 rounded-2xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-200 dark:border-emerald-800/60 shadow-xs animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    User Registered Successfully!
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Employee ID: <strong className="text-slate-800 dark:text-slate-200">{createdUserSummary.employeeId}</strong> • Name: <strong className="text-slate-800 dark:text-slate-200">{createdUserSummary.name}</strong> • Login: <strong className="text-slate-800 dark:text-slate-200">{createdUserSummary.loginName}</strong>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Company: <span className="font-semibold text-slate-700 dark:text-slate-300">{createdUserSummary.company}</span> • Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{createdUserSummary.role}</span> • Designation: <span className="font-semibold text-slate-700 dark:text-slate-300">{createdUserSummary.designation}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => resetAllState(true)}
              >
                Register Another User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {result && !result.ok && (
        <div className="p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 text-sm font-medium">{result.msg}</div>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Stepper Navigation ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {STEPS[currentStep - 1].title}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
              {STEPS[currentStep - 1].desc}
            </p>
          </div>

          {/* Animated Percentage Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {progressPercent}% Completed
            </span>
          </div>
        </div>

        {/* Animated Progress Bar (0 to 100%) */}
        <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-linear-to-r from-primary via-indigo-500 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isCurrent = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable = isCompleted || step.id <= currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                  isCurrent
                    ? 'border-primary/60 bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20 cursor-default'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer'
                    : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Step Icon Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'bg-primary text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
                </div>

                {/* Step Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider leading-none">
                    Step {step.id}
                  </p>
                  <p className={`text-xs font-bold truncate mt-0.5 ${
                    isCurrent
                      ? 'text-primary dark:text-primary-light'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.short}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Wizard Step Content ────────────────────────────────────── */}
      <div key={formKey} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 transition-all duration-300">
        
        {/* ── STEP 1: Personal Information ── */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300">
            <SectionHeader
              icon={User}
              iconColor="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              title="Personal Information"
              subtitle="Please provide employee identification, full name and personal contact details."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

              {/* Employee ID */}
              <Field label="Employee ID" required error={errors.EmployeeId}>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="EmployeeId" value={form.EmployeeId} onChange={change}
                    placeholder="Employee ID"
                    className={`${inputCls(errors.EmployeeId)} pl-8`}
                  />
                </div>
              </Field>

              {/* First Name */}
              <Field label="First Name" required error={errors.FirstName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="FirstName" value={form.FirstName} onChange={change}
                    placeholder="First name"
                    className={`${inputCls(errors.FirstName)} pl-8`}
                  />
                </div>
              </Field>

              {/* Middle Name */}
              <Field label="Middle Name" error={errors.MiddleName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="MiddleName" value={form.MiddleName} onChange={change}
                    placeholder="Middle name"
                    className={`${inputCls(false)} pl-8`}
                  />
                </div>
              </Field>

              {/* Last Name */}
              <Field label="Last Name" error={errors.LastName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="LastName" value={form.LastName} onChange={change}
                    placeholder="Last name"
                    className={`${inputCls(false)} pl-8`}
                  />
                </div>
              </Field>

              {/* Phone Number */}
              <Field label="Phone Number" required error={errors.PhoneNumber}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="PhoneNumber" value={form.PhoneNumber} onChange={change}
                    placeholder="10-digit mobile number" maxLength={10}
                    className={`${inputCls(errors.PhoneNumber)} pl-8`}
                  />
                </div>
              </Field>

              {/* Alt Phone */}
              <Field label="Alternate Phone" error={errors.AltPhoneNumber}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="AltPhoneNumber" value={form.AltPhoneNumber} onChange={change}
                    placeholder="Optional" maxLength={10}
                    className={`${inputCls(false)} pl-8`}
                  />
                </div>
              </Field>

              {/* Date of Birth */}
              <Field label="Date of Birth" required error={errors.DateOfBirth}>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date" name="DateOfBirth" value={form.DateOfBirth} onChange={change}
                    className={`${inputCls(errors.DateOfBirth)} pl-8`}
                  />
                </div>
              </Field>

              {/* Date of Joining */}
              <Field label="Date of Joining" required error={errors.DateOfJoining}>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date" name="DateOfJoining" value={form.DateOfJoining} onChange={change}
                    className={`${inputCls(errors.DateOfJoining)} pl-8`}
                  />
                </div>
              </Field>

              {/* Gender */}
              <Field label="Gender" required error={errors.GenderId}>
                <select name="GenderId" value={form.GenderId} onChange={change}
                  className={selectCls(errors.GenderId)}>
                  <option value="">— Select Gender —</option>
                  {genders.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              {/* Marital Status */}
              <Field label="Marital Status" required error={errors.MaritalStatusId}>
                <select name="MaritalStatusId" value={form.MaritalStatusId} onChange={change}
                  className={selectCls(errors.MaritalStatusId)}>
                  <option value="">— Select Marital Status —</option>
                  {maritalStatuses.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

            </div>
          </div>
        )}

        {/* ── STEP 2: Account Credentials ── */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-300">
            <SectionHeader
              icon={Lock}
              iconColor="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
              title="Account Credentials"
              subtitle="Configure system credentials for the user to authenticate into the ERP."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">

              {/* Email */}
              <Field label="Email Address" required error={errors.Email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email" name="Email" value={form.Email} onChange={change}
                    placeholder="Email address"
                    className={`${inputCls(errors.Email)} pl-8`}
                  />
                </div>
              </Field>

              {/* Login Name */}
              <Field label="Login Name" required error={errors.LoginName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="LoginName" value={form.LoginName} onChange={change}
                    placeholder="Login username"
                    className={`${inputCls(errors.LoginName)} pl-8`}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" required error={errors.Password}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'} name="Password"
                    value={form.Password} onChange={change} placeholder="••••••••"
                    className={`${inputCls(errors.Password)} pl-8 pr-10`}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </Field>

            </div>
          </div>
        )}

        {/* ── STEP 3: Company Assignment ── */}
        {currentStep === 3 && (
          <div className="animate-in fade-in duration-300">
            <SectionHeader
              icon={Building}
              iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              title="Company Assignment"
              subtitle="Assign the user to a company, designation, product, project and role. Reporting Manager is optional."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* ── Company ── */}
              <Field label="Company" required error={errors.CompanyId}>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <select name="CompanyId" value={form.CompanyId} onChange={change}
                    className={`${selectCls(errors.CompanyId)} pl-8`}>
                    <option value="">— Select Company —</option>
                    {companies.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </Field>


              {/* ── Company Product — Multi-Select ── */}
              <Field label="Company Product" error={errors.CompanyProductId}>
                <MultiSelectDropdown
                  name="CompanyProductId"
                  options={products}
                  value={Array.isArray(form.CompanyProductId) ? form.CompanyProductId : []}
                  onMultiChange={multiChange}
                  placeholder="— Select Products —"
                  disabledPlaceholder="— Select Company first —"
                  disabled={!form.CompanyId}
                  error={!!errors.CompanyProductId}
                />
              </Field>

              {/* ── Project — Multi-Select ── */}
              <Field label="Project" error={errors.ProjectId}>
                <MultiSelectDropdown
                  name="ProjectId"
                  options={projects}
                  value={Array.isArray(form.ProjectId) ? form.ProjectId : []}
                  onMultiChange={multiChange}
                  placeholder="— Select Projects —"
                  disabledPlaceholder="— Select Product first —"
                  disabled={!form.CompanyProductId || (Array.isArray(form.CompanyProductId) && form.CompanyProductId.length === 0)}
                  error={!!errors.ProjectId}
                />
              </Field>

              {/* ── Role ── */}
              <Field label="Role" required error={errors.RoleId}>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <select name="RoleId" value={form.RoleId} onChange={change}
                    className={`${selectCls(errors.RoleId)} pl-8`}>
                    <option value="">— Select Role —</option>
                    {roles.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </Field>

              {/* ── Designation ── */}
              <Field label="Designation" error={errors.DesignationId}>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <select name="DesignationId" value={form.DesignationId} onChange={change}
                    disabled={!form.CompanyId}
                    className={`${selectCls(errors.DesignationId)} pl-8 ${!form.CompanyId ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}>
                    <option value="">{form.CompanyId ? '— Select Designation —' : '— Select Company first —'}</option>
                    {designations.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </Field>

              {/* ── Reporting Manager — Multi-Select ── */}
              <Field label="Reporting Manager" error={errors.ReportingManagerUserId}>
                <MultiSelectDropdown
                  name="ReportingManagerUserId"
                  options={reportingManagers}
                  value={Array.isArray(form.ReportingManagerUserId) ? form.ReportingManagerUserId : []}
                  onMultiChange={multiChange}
                  placeholder="— Select Reporting Managers —"
                  disabledPlaceholder="— Select Company first —"
                  disabled={!form.CompanyId}
                  error={!!errors.ReportingManagerUserId}
                />
              </Field>


            </div>
          </div>
        )}

        {/* ── STEP 4: Profile Photo ── */}
        {currentStep === 4 && (
          <div className="animate-in fade-in duration-300">
            <SectionHeader
              icon={Image}
              iconColor="bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400"
              title="Profile Photo"
              subtitle="Upload an avatar or professional picture for user identity card and profile."
            />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              {/* Avatar preview */}
              <div className="shrink-0">
                {photo ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-md">
                    <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button" onClick={removePhoto}
                      className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer transition-colors shadow-xs"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                    <User className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No photo selected</span>
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-col gap-3 flex-1 text-center sm:text-left">
                <input ref={photoRef} type="file" accept="image/*" onChange={onPhotoChange} className="hidden" id="photo-inp" />
                <label
                  htmlFor="photo-inp"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer transition-all shadow-xs w-fit mx-auto sm:mx-0"
                >
                  <Upload className="w-4 h-4" />
                  {photo ? 'Change Profile Photo' : 'Upload Profile Photo'}
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Supported formats: JPG, PNG, WEBP · Max size: 5 MB<br />
                  {photo && (
                    <span className="text-primary font-semibold block mt-1">
                      {photo.file.name} ({(photo.file.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </p>
                {errors.Photo && (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.Photo}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Supporting Documents ── */}
        {currentStep === 5 && (
          <div className="animate-in fade-in duration-300">
            <SectionHeader
              icon={FileText}
              iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              title="Supporting Documents"
              subtitle="Upload documents for each required file type. All fields are optional."
            />

            {/* File-type compact grid — 3 per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {fileTypes.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-8 text-slate-400">
                  <FileText className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs font-medium">No document types configured</p>
                </div>
              ) : (
                fileTypes.map(ft => {
                  const uploaded = userFiles[ft.value];
                  return (
                    <div
                      key={ft.key}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                        uploaded
                          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-200 dark:hover:border-indigo-800'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        uploaded
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>

                      {/* Name + status */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">{ft.label}</p>
                        {uploaded ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate leading-tight mt-0.5">
                            ✓ {uploaded.name}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">No file</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <label
                          htmlFor={`ft-upload-${ft.value}`}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md cursor-pointer transition-colors ${
                            uploaded
                              ? 'border border-indigo-200 dark:border-indigo-700 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          title={uploaded ? 'Replace file' : 'Upload file'}
                        >
                          <Upload className="w-3 h-3" />
                          {uploaded ? 'Replace' : 'Upload'}
                        </label>
                        {uploaded && (
                          <button
                            type="button"
                            onClick={() => removeFileForType(ft.value)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <input
                          id={`ft-upload-${ft.value}`}
                          type="file"
                          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) onFileForType(ft.value, file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>


            {/* Quick Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Employee:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{form.EmployeeId || '—'} · {form.FirstName} {form.LastName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Login Username:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{form.LoginName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Company:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {companies.find(c => String(c.value) === String(form.CompanyId))?.label || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Photo Status:</span>
                <span className={`font-bold ${photo ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {photo ? 'Uploaded ✓' : 'Missing ✗'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Navigation Controls ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={ArrowLeft}
                onClick={handleBack}
                disabled={submitting}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={submitting}
                className="px-5 shadow-xs cursor-pointer"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={submitting ? RefreshCw : UserPlus}
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 shadow-sm cursor-pointer"
              >
                {submitting ? 'Creating User…' : 'Create User'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

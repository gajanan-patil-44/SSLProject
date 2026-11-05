<<<<<<< HEAD
// src/pages/UserManagement/ManageUserView.jsx
=======
﻿// src/pages/UserManagement/ManageUserView.jsx
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PageHeader,
  Button,
  StatusBadge,
  Input
} from '../../components/ui/index';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { userService } from '../../services/userService';
import { useERPStore } from '../../store/useERPStore';

// Helper to get session company
const getSessionCompany = () => {
  try {
    const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
    if (raw) {
      const s = JSON.parse(raw);
      const comps = s?.data?.context?.companies || s?.context?.companies || s?.data?.companies || s?.companies;
      if (Array.isArray(comps) && comps.length > 0) return comps[0];
    }
    const ctx = useERPStore.getState()?.userContext;
    if (ctx?.companies?.length > 0) return ctx.companies[0];
  } catch {}
  return null;
};
import {
  validateName,
  validatePhone,
  validateEmail,
  validateCode,
  validateDateOfBirth,
  validateDateOfJoining
} from '../../utils/validators';
import {
  Building2,
  Package,
  Shield,
  UserCheck,
  ChevronDown,
  FolderGit2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

const toOpts = (data, idKey, nameKey) => {
  const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  return arr
    .map((item) => {
      const id = item[idKey] ?? item.id ?? item.Id;
      const name = item[nameKey] ?? item.name ?? item.Name ?? item.label;
      return id !== undefined && id !== null && name ? { id: String(id), name: String(name) } : null;
    })
    .filter(Boolean);
};


// ─── Custom click-to-toggle Multi-Select Dropdown ──────────────────────────
function MultiSelectDropdown({
  name,
  options = [],
  value = [],
  onMultiChange,
  placeholder = '— Select —',
  disabledPlaceholder = '— Select —',
  disabled = false,
  error = false,
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

  const valArray = Array.isArray(value) ? value.map(String) : (value ? [String(value)] : []);

  const toggle = (val) => {
    const sVal = String(val);
    const next = valArray.includes(sVal)
      ? valArray.filter(v => v !== sVal)
      : [...valArray, sVal];
    onMultiChange(name, next);
  };

  const selectedItems = options.filter(o => valArray.includes(String(o.id ?? o.value)));

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
            selectedItems.map(item => {
              const itemVal = String(item.id ?? item.value);
              const itemLabel = item.name ?? item.label;
              return (
                <span
                  key={itemVal}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {itemLabel}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => { e.stopPropagation(); toggle(itemVal); }}
                    className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 cursor-pointer leading-none text-sm"
                  >×</span>
                </span>
              );
            })
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
              const optVal = String(o.id ?? o.value);
              const optLabel = o.name ?? o.label;
              const selected = valArray.includes(optVal);
              return (
                <button
                  type="button"
                  key={optVal}
                  onClick={() => toggle(optVal)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    selected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{optLabel}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ManageUserView() {
  const sessionCompany = getSessionCompany();
  const sessionCompanyId = sessionCompany?.CompanyId ?? sessionCompany?.CompanyMasterId ?? sessionCompany?.companyId;
  const sessionCompanyName = sessionCompany?.CompanyName ?? sessionCompany?.name;

  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const userName = currentUser?.loginName || currentUser?.EmployeeId || (typeof currentUser?.name === 'string' ? currentUser.name : '') || '';

  const getSessionUserName = () => {
    try {
<<<<<<< HEAD
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
=======
      const raw = sessionStorage.getItem('session') || localStorage.getItem('session');
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
      if (raw) {
        const s = JSON.parse(raw);
        const u = s?.data?.user || s?.user || s;
        if (u) {
          return (
            u.loginName ||
            u.LoginName ||
            (typeof u.name === 'string' ? u.name : null) ||
            (u.name?.first ? [u.name.first, u.name.middle, u.name.last].filter(Boolean).join(' ') : null) ||
            u.userName ||
            u.EmployeeId ||
            ''
          );
        }
      }
      const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
      return u?.loginName || u?.LoginName || u?.EmployeeId || (typeof u?.name === 'string' ? u.name : '') || '';
    } catch {
      return '';
    }
  };


  // Table Data & Loading
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    loginName: '',
    phoneNumber: '',
    altPhoneNumber: '',
    dateOfBirth: '',
    dateOfJoining: '',
    genderId: '',
    maritalStatusId: '',
    designationId: '',
    companyId: '',
    companyProductId: [],
    projectId: [],
    roleId: '',
    reportingManagerUserId: [],
    isActive: true
  };
  const [formData, setFormData] = useState(initialFormData);
  const [originalFormData, setOriginalFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  // Dropdown Lists for Edit (loaded from the 8 userEdit routes)
  const [genders, setGenders] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyProducts, setCompanyProducts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [reportingManagers, setReportingManagers] = useState([]);

  // View Modal States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Change Password Modal States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleOpenChangePasswordModal = (user) => {
    setChangePasswordUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangePasswordOpen(true);
  };

  const validatePasswordForm = () => {
    const errs = {};
    const np = (passwordForm.newPassword || '').trim();
    const cp = (passwordForm.confirmPassword || '').trim();

    if (!np) {
      errs.newPassword = 'New password is required';
    } else if (np.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }

    if (!cp) {
      errs.confirmPassword = 'Confirmation password is required';
    } else if (np && cp && np !== cp) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  const handleChangePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    const userId = changePasswordUser?.UserId ?? changePasswordUser?.id;
    if (!userId) {
      showToast('User ID is missing.', 'error');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await userService.changePassword(userId, passwordForm.newPassword.trim());
      const msg = response?.message || 'Password changed successfully!';
      showToast(msg, 'success');
      setIsChangePasswordOpen(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change password.';
      showToast(msg, 'error');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Fetch Users via POST /verp-service/userEdit/getAllUserDetails with flagId: 1
  // --------------------------------------------------------------------------
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUserDetails(1);
      let list = [];
      if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      }
      setUsers(list);
    } catch (err) {
      setUsers([]);
      showToast(err?.response?.data?.message || err?.message || 'Failed to load users from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Fetch Dropdowns for Edit Modal via the 8 new /verp-service/userEdit routes
  // --------------------------------------------------------------------------
  const loadBaseDropdowns = async () => {
    try {
      const [genderRes, maritalRes, compRes] = await Promise.allSettled([
        userService.getEditGender(),
        userService.getEditMaritalStatus(),
        userService.getEditCompany()
      ]);

      if (genderRes.status === 'fulfilled') {
        setGenders(toOpts(genderRes.value?.data ?? genderRes.value, 'GenderId', 'GenderName'));
      }
      if (maritalRes.status === 'fulfilled') {
        setMaritalStatuses(toOpts(maritalRes.value?.data ?? maritalRes.value, 'MaritalStatusId', 'MaritalStatusName'));
      }
      if (compRes.status === 'fulfilled') {
        setCompanies(toOpts(compRes.value?.data ?? compRes.value, 'CompanyId', 'CompanyName'));
      }
    } catch (err) {
    }
  };

  const loadCompanyDependentDropdowns = async (companyId) => {
    if (!companyId) {
      setDesignations([]);
      setReportingManagers([]);
      setCompanyProducts([]);
      setProjects([]);
      setRoles([]);
      return;
    }
    try {
      const [desigRes, mgrRes, prodRes, roleRes] = await Promise.allSettled([
        userService.getEditDesignation(companyId),
        userService.getEditReportingManager(companyId),
        userService.getEditCompanyProduct(companyId),
        userService.getEditRole(companyId)
      ]);

      if (desigRes.status === 'fulfilled') {
        setDesignations(toOpts(desigRes.value?.data ?? desigRes.value, 'CompanyDesignationId', 'DesignationName'));
      }
      if (mgrRes.status === 'fulfilled') {
        setReportingManagers(toOpts(mgrRes.value?.data ?? mgrRes.value, 'ReportingManagerUserId', 'ReportingManagerName'));
      }
      if (prodRes.status === 'fulfilled') {
        setCompanyProducts(toOpts(prodRes.value?.data ?? prodRes.value, 'CompanyProductId', 'ProductName'));
      }
      if (roleRes.status === 'fulfilled') {
        setRoles(toOpts(roleRes.value?.data ?? roleRes.value, 'RoleId', 'RoleName'));
      }
    } catch (err) {
    }
  };

  const loadProductProjects = async (companyProductIds) => {
    const ids = Array.isArray(companyProductIds)
      ? companyProductIds.filter(Boolean)
      : (companyProductIds ? [companyProductIds] : []);

    if (ids.length === 0) {
      setProjects([]);
      return;
    }
    try {
      const results = await Promise.allSettled(
        ids.map((id) => userService.getEditProject(id))
      );
      const combined = [];
      const seen = new Set();
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          const raw = res.value?.data ?? res.value;
          const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          list.forEach((p) => {
            const id = p.ProjectId ?? p.id ?? p.Id;
            const name = p.ProjectName ?? p.name ?? p.Name ?? String(id);
            if (id != null && !seen.has(String(id))) {
              seen.add(String(id));
              combined.push({ id: String(id), name: String(name) });
            }
          });
        }
      });
      setProjects(combined);
    } catch (err) {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBaseDropdowns();
  }, []);

  const handleCompanyChange = (selectedCompanyId) => {
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompanyId,
      companyProductId: [],
      projectId: [],
      roleId: '',
      designationId: '',
      reportingManagerUserId: []
    }));
    loadCompanyDependentDropdowns(selectedCompanyId);
    setProjects([]);
  };

  const handleMultiChange = (field, newValues) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValues
    }));
    if (field === 'companyProductId') {
      loadProductProjects(newValues);
    }
  };

  // --------------------------------------------------------------------------
  // Edit Modal Handler
  // --------------------------------------------------------------------------
  const handleOpenEditModal = async (user) => {
    setSelectedUser(user);

    const primaryCompany = (user.Companies || []).find((c) => c.IsPrimaryCompany) || (user.Companies || [])[0];
    const primaryProduct = (user.Products || [])[0];
    const primaryProject = (user.Projects || []).find((p) => p.IsPrimary) || (user.Projects || [])[0];
    const primaryRole = (user.Roles || [])[0];
    const primaryManager = (user.ReportingManagers || [])[0];

<<<<<<< HEAD
    const currentCompanyId = primaryCompany?.CompanyId ? String(primaryCompany.CompanyId) : '';
=======
    const currentCompanyId = sessionCompanyId ? String(sessionCompanyId) : (primaryCompany?.CompanyId ? String(primaryCompany.CompanyId) : '');
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91

    // Multi-select values as arrays of strings
    const currentCompanyProductIds = Array.isArray(user.Products) && user.Products.length > 0
      ? user.Products.map((p) => String(p.CompanyProductId ?? p.ProductId ?? p.id)).filter(Boolean)
      : ((primaryProduct?.CompanyProductId || primaryRole?.CompanyProductId) ? [String(primaryProduct?.CompanyProductId || primaryRole?.CompanyProductId)] : []);

    const currentProjectIds = Array.isArray(user.Projects) && user.Projects.length > 0
      ? user.Projects.map((pr) => String(pr.ProjectId ?? pr.id)).filter(Boolean)
      : ((primaryProject?.ProjectId || primaryRole?.ProjectId) ? [String(primaryProject?.ProjectId || primaryRole?.ProjectId)] : []);

    const currentReportingManagerIds = Array.isArray(user.ReportingManagers) && user.ReportingManagers.length > 0
      ? user.ReportingManagers.map((rm) => String(rm.ReportingManagerUserId ?? rm.UserId ?? rm.id)).filter(Boolean)
      : (primaryManager?.ReportingManagerUserId ? [String(primaryManager.ReportingManagerUserId)] : []);

    const initialValues = {
      employeeId: user.EmployeeId || '',
      firstName: user.FirstName || '',
      middleName: user.MiddleName || '',
      lastName: user.LastName || '',
      email: user.Email || '',
      loginName: user.LoginName || '',
      phoneNumber: user.PhoneNumber || '',
      altPhoneNumber: user.AltPhoneNumber || '',
      dateOfBirth: user.DateOfBirth ? user.DateOfBirth.slice(0, 10) : '',
      dateOfJoining: user.DateOfJoining ? user.DateOfJoining.slice(0, 10) : '',
      genderId: user.GenderId ? String(user.GenderId) : '',
      maritalStatusId: user.MaritalStatusId ? String(user.MaritalStatusId) : '',
      designationId: user.DesignationId ? String(user.DesignationId) : '',
      companyId: currentCompanyId,
      companyProductId: currentCompanyProductIds,
      projectId: currentProjectIds,
      roleId: primaryRole?.RoleId ? String(primaryRole.RoleId) : '',
      reportingManagerUserId: currentReportingManagerIds,
      isActive: true
    };

    setFormData(initialValues);
    setOriginalFormData(initialValues);
    setFormErrors({});
    setIsEditOpen(true);

    loadBaseDropdowns();
    if (currentCompanyId) {
      loadCompanyDependentDropdowns(currentCompanyId);
    }
    if (currentCompanyProductIds.length > 0) {
      loadProductProjects(currentCompanyProductIds);
    }
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleToggleStatus = async (record) => {
    try {
      const isCurrentlyDisabled = record.IsDisabled === true || record.Status === 'INACTIVE' || record.IsActive === false;
      const newDisabledState = !isCurrentlyDisabled;

      const currentUser = useERPStore.getState().user;
      const userName = currentUser?.loginName || currentUser?.name || currentUser?.userName || '';

      const payload = {
        flagId: 1,
        IsDisabled: newDisabledState,
        UpdatedByUserName: userName,
        UserId: Number(record.UserId || record.userId || record.id)
      };

      await userService.toggleUserStatus(payload);
      showToast(`User status updated to ${newDisabledState ? 'Inactive' : 'Active'}.`, 'success');
      await loadUsers();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update user status', 'error');
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};

    const empErr = validateCode(formData.employeeId, 'Employee ID', true);
    if (empErr) errs.employeeId = empErr;

    const fnErr = validateName(formData.firstName, 'First Name', true);
    if (fnErr) errs.firstName = fnErr;

    if (formData.middleName) {
      const mnErr = validateName(formData.middleName, 'Middle Name', false);
      if (mnErr) errs.middleName = mnErr;
    }

    if (formData.lastName) {
      const lnErr = validateName(formData.lastName, 'Last Name', false);
      if (lnErr) errs.lastName = lnErr;
    }

    const emailErr = validateEmail(formData.email, 'Email Address', true);
    if (emailErr) errs.email = emailErr;

    if (!formData.loginName.trim()) {
      errs.loginName = 'Login Username is required';
    } else if (formData.loginName.trim().length < 3) {
      errs.loginName = 'Login Username must be at least 3 characters';
    }

    if (formData.phoneNumber) {
      const phoneErr = validatePhone(formData.phoneNumber, 'Phone Number', false);
      if (phoneErr) errs.phoneNumber = phoneErr;
    }

    if (formData.altPhoneNumber) {
      const altErr = validatePhone(formData.altPhoneNumber, 'Alternate Phone Number', false);
      if (altErr) errs.altPhoneNumber = altErr;
    }

    if (formData.dateOfBirth) {
      const dobErr = validateDateOfBirth(formData.dateOfBirth, 18, false);
      if (dobErr) errs.dateOfBirth = dobErr;
    }

    if (formData.dateOfJoining && formData.dateOfBirth) {
      const dojErr = validateDateOfJoining(formData.dateOfJoining, formData.dateOfBirth, false);
      if (dojErr) errs.dateOfJoining = dojErr;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Update
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!selectedUser) return;

    if (!validateForm()) {
      showToast('Please fix the validation errors in the form.', 'error');
      return;
    }

    const companyProductIds = Array.isArray(formData.companyProductId)
      ? formData.companyProductId.map(Number).filter((n) => !isNaN(n) && n > 0)
      : (formData.companyProductId ? [Number(formData.companyProductId)] : []);

    const projectIds = Array.isArray(formData.projectId)
      ? formData.projectId.map(Number).filter((n) => !isNaN(n) && n > 0)
      : (formData.projectId ? [Number(formData.projectId)] : []);

    const reportingManagerIds = Array.isArray(formData.reportingManagerUserId)
      ? formData.reportingManagerUserId.map(Number).filter((n) => !isNaN(n) && n > 0)
      : (formData.reportingManagerUserId ? [Number(formData.reportingManagerUserId)] : []);

    const sessionUserName = getSessionUserName() || userName || 'Admin';

    // Exact payload required by user matching API screenshot:
    // {
    //   UserId: 10,
    //   employeeId: "EMP001",
    //   firstName: "Hithin",
    //   middleName: "Kumar",
    //   lastName: "Chitriki",
    //   phoneNumber: "9876543210",
    //   dateOfBirth: "2002-05-15",
    //   genderId: 1,
    //   maritalStatusId: 1,
    //   designationId: 2,
    //   email: "hithin@gmail.com",
    //   loginName: "hithin",
    //   CompanyId: 1,
    //   RoleId: 1,
    //   CompanyProductId: [1,2],
    //   ProjectId: [1,2],
    //   ReportingManagerUserId: [2,3],
    //   dateOfJoining: "2024-08-12",
    //   updatedByUserName: "admin1"
    // }
    const editPayload = {
      flagId: 2,
      UserId: Number(selectedUser.UserId),
      employeeId: formData.employeeId ? formData.employeeId.trim() : '',
      firstName: formData.firstName ? formData.firstName.trim() : '',
      middleName: formData.middleName ? formData.middleName.trim() : '',
      lastName: formData.lastName ? formData.lastName.trim() : '',
      phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : '',
      dateOfBirth: formData.dateOfBirth || null,
      genderId: formData.genderId ? Number(formData.genderId) : null,
      maritalStatusId: formData.maritalStatusId ? Number(formData.maritalStatusId) : null,
      designationId: formData.designationId ? Number(formData.designationId) : null,
      email: formData.email ? formData.email.trim() : '',
      loginName: formData.loginName ? formData.loginName.trim() : '',
      CompanyId: formData.companyId ? Number(formData.companyId) : null,
      RoleId: formData.roleId ? Number(formData.roleId) : null,
      CompanyProductId: companyProductIds,
      ProjectId: projectIds,
      ReportingManagerUserId: reportingManagerIds,
      dateOfJoining: formData.dateOfJoining || null,
      updatedByUserName: sessionUserName
    };

    setSubmitting(true);
    try {
      await userService.editUserDetails(editPayload);
      showToast('User details updated successfully!', 'success');
      setIsEditOpen(false);
      await loadUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // DataTable Column Definitions matching template layout
  const columns = useMemo(() => [
    {
      id: 'SlNo',
      header: '#',
      accessorKey: 'SlNo',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-500">
          {row.index + 1}
        </span>
      )
    },
    {
      id: 'EmployeeId',
      header: 'EMPLOYEE ID',
      accessorKey: 'EmployeeId',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.original.EmployeeId || '—'}
        </span>
      )
    },
    {
      id: 'FullName',
      header: 'USER NAME',
      accessorKey: 'FirstName',
      cell: ({ row }) => {
        const u = row.original;
        const fullName = [u.FirstName, u.MiddleName, u.LastName].filter(Boolean).join(' ') || '—';
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              {fullName}
            </span>
            {u.LoginName && (
              <span className="text-[11px] text-slate-400 font-mono">
                @{u.LoginName}
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: 'Email',
      header: 'EMAIL',
      accessorKey: 'Email',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
          {row.original.Email || '—'}
        </span>
      )
    },
    {
      id: 'Companies',
      header: 'COMPANY',
      accessorKey: 'Companies',
      cell: ({ row }) => {
        const compList = Array.isArray(row.original.Companies) ? row.original.Companies : [];
        if (compList.length === 0) return <span className="text-slate-400">—</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {compList.map((c, i) => (
              <span
                key={c.UserCompanyId || i}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border ${c.IsPrimaryCompany
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
              >
                {c.CompanyName}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      id: 'Roles',
      header: 'ROLE NAME',
      accessorKey: 'Roles',
      cell: ({ row }) => {
        const rolesList = Array.isArray(row.original.Roles) ? row.original.Roles : [];
        if (rolesList.length === 0) return <span className="text-slate-400">—</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {rolesList.map((r, i) => (
              <span
                key={r.UserRoleId || i}
                className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
              >
                {r.RoleName}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      id: 'ReportingManager',
      header: 'REPORTING MANAGER',
      accessorKey: 'ReportingManagers',
      cell: ({ row }) => {
        const managers = Array.isArray(row.original.ReportingManagers) ? row.original.ReportingManagers : [];
        if (managers.length === 0) return <span className="text-slate-400">—</span>;

        return (
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {managers[0].ReportingManagerName || '—'}
          </span>
        );
      }
    },
    {
      id: 'CreatedAt',
      header: 'CREATED AT',
      accessorKey: 'CreatedAt',
      cell: ({ row }) => {
        const rawDate = row.original.CreatedAt || row.original.createdAt || row.original.CreatedOn;
        if (!rawDate) return <span className="text-slate-400">—</span>;
        try {
          const d = new Date(rawDate);
          if (isNaN(d.getTime())) return <span className="text-slate-500 font-mono text-xs">{String(rawDate)}</span>;
          const formatted = d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const time = d.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
          });
          return (
            <div className="flex flex-col">
              <span className="font-medium text-xs text-slate-700 dark:text-slate-200">
                {formatted}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {time}
              </span>
            </div>
          );
        } catch {
          return <span className="text-slate-400">—</span>;
        }
      }
    },
    {
      id: 'Status',
      header: 'STATUS',
      accessorKey: 'Status',
      cell: ({ row }) => {
        const isDisabled = row.original.IsDisabled === true || row.original.Status === 'INACTIVE' || row.original.IsActive === false;
        const isActive = !isDisabled;
        return <StatusBadge status={isActive ? 'Active' : 'Inactive'} />;
      }
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* ERP Page Header matching template */}
      <PageHeader
        title="Manage Users"
        description="Manage system user profiles, organizational company affiliations, and role assignments."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Master', path: '/master' },
          { label: 'Manage Users', path: '/master/manage-users' }
        ]}
      />

      {/* Modern ERP DataTable Component (without onAddClick) */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onViewClick={handleOpenViewModal}
        onEditClick={handleOpenEditModal}
        onChangePasswordClick={handleOpenChangePasswordModal}
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search users..."
        onRefresh={loadUsers}
        hideExport
      />

      {/* ------------------------------------------------------------------ */}
      {/* Update User Details Modal (Matching ManagePageView Theme)         */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update User Details"
        size="lg"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Please update user information below <span className="text-rose-500 font-bold">*</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={(e) => {
                  setFormData({ ...formData, employeeId: e.target.value });
                  if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: null });
                }}
                error={formErrors.employeeId}
              />
            </div>

            {/* Login Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Login Username <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Login username"
                value={formData.loginName}
                onChange={(e) => {
                  setFormData({ ...formData, loginName: e.target.value });
                  if (formErrors.loginName) setFormErrors({ ...formErrors, loginName: null });
                }}
                error={formErrors.loginName}
              />
            </div>

            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: null });
                }}
                error={formErrors.firstName}
              />
            </div>

            {/* Middle Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Middle Name
              </label>
              <Input
                placeholder="Enter Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Last Name
              </label>
              <Input
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                }}
                error={formErrors.email}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Phone Number
              </label>
              <Input
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            {/* Alt Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Alt Phone Number
              </label>
              <Input
                placeholder="Alternate phone number"
                value={formData.altPhoneNumber}
                onChange={(e) => setFormData({ ...formData, altPhoneNumber: e.target.value })}
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.genderId}
                  onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                >
                  <option value="">Select Gender</option>
                  {genders.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Marital Status Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Marital Status
              </label>
              <div className="relative">
                <select
                  value={formData.maritalStatusId}
                  onChange={(e) => setFormData({ ...formData, maritalStatusId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                >
                  <option value="">Select Marital Status</option>
                  {maritalStatuses.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Assigned Company Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Assigned Company
              </label>
              <div className="relative">
                <select
                  disabled={Boolean(sessionCompanyId)}
                  value={formData.companyId || (sessionCompanyId ? String(sessionCompanyId) : '')}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${sessionCompanyId ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'}`}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {sessionCompanyId && !companies.some(c => String(c.id) === String(sessionCompanyId)) && (
                    <option value={String(sessionCompanyId)}>
                      {sessionCompanyName || `Company #${sessionCompanyId}`}
                    </option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Company Product Selection (Multi-Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Company Product
              </label>
              <MultiSelectDropdown
                name="companyProductId"
                options={companyProducts}
                value={Array.isArray(formData.companyProductId) ? formData.companyProductId : (formData.companyProductId ? [String(formData.companyProductId)] : [])}
                onMultiChange={handleMultiChange}
                placeholder="Select Company Products"
                disabledPlaceholder="Select Company first"
                disabled={!formData.companyId}
              />
            </div>

            {/* Project Selection (Multi-Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Project
              </label>
              <MultiSelectDropdown
                name="projectId"
                options={projects}
                value={Array.isArray(formData.projectId) ? formData.projectId : (formData.projectId ? [String(formData.projectId)] : [])}
                onMultiChange={handleMultiChange}
                placeholder="Select Projects"
                disabledPlaceholder={(!formData.companyProductId || (Array.isArray(formData.companyProductId) && formData.companyProductId.length === 0)) ? "Select Product first" : "Select Projects"}
                disabled={!formData.companyProductId || (Array.isArray(formData.companyProductId) && formData.companyProductId.length === 0)}
              />
            </div>

            {/* Role Selection (Cascades from Company) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Role Name
              </label>
              <div className="relative">
                <select
                  disabled={!formData.companyId}
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">{formData.companyId ? 'Select Role' : 'Select Company first'}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Designation (Cascades from Company) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Designation
              </label>
              <div className="relative">
                <select
                  disabled={!formData.companyId}
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">{formData.companyId ? 'Select Designation' : 'Select Company first'}</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reporting Manager (Multi-Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Reporting Manager
              </label>
              <MultiSelectDropdown
                name="reportingManagerUserId"
                options={reportingManagers}
                value={Array.isArray(formData.reportingManagerUserId) ? formData.reportingManagerUserId : (formData.reportingManagerUserId ? [String(formData.reportingManagerUserId)] : [])}
                onMultiChange={handleMultiChange}
                placeholder="Select Reporting Managers"
                disabledPlaceholder="Select Company first"
                disabled={!formData.companyId}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            {/* Date of Joining */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Date of Joining
              </label>
              <Input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* View User Details Modal                                            */}
      {/* ------------------------------------------------------------------ */}
      {/* View Details Modal (Matching ManagePageView Template) */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="User Details"
        size="lg"
        actions={
          <Button variant="outline" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            {/* Primary Details Grid matching template style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-white text-base">
                  {[selectedUser.FirstName, selectedUser.MiddleName, selectedUser.LastName].filter(Boolean).join(' ') || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Employee ID</span>
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-white">
                  {selectedUser.EmployeeId || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Status</span>
                <StatusBadge status={selectedUser.IsDisabled === true || selectedUser.Status === 'INACTIVE' || selectedUser.IsActive === false ? 'Inactive' : 'Active'} />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Login Username</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  @{selectedUser.LoginName || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Email Address</span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
                  {selectedUser.Email || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Created At</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedUser.CreatedAt ? (() => {
                    try {
                      const d = new Date(selectedUser.CreatedAt);
                      return !isNaN(d.getTime())
                        ? `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                        : selectedUser.CreatedAt;
                    } catch {
                      return selectedUser.CreatedAt;
                    }
                  })() : '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Phone Number</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedUser.PhoneNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Alt Phone Number</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedUser.AltPhoneNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Gender</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {genders.find((g) => String(g.id) === String(selectedUser.GenderId))?.name || (selectedUser.GenderId ? `ID: ${selectedUser.GenderId}` : '—')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Marital Status</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {maritalStatuses.find((m) => String(m.id) === String(selectedUser.MaritalStatusId))?.name || (selectedUser.MaritalStatusId ? `ID: ${selectedUser.MaritalStatusId}` : '—')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Date of Birth</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedUser.DateOfBirth ? selectedUser.DateOfBirth.slice(0, 10) : '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Date of Joining</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedUser.DateOfJoining ? selectedUser.DateOfJoining.slice(0, 10) : '—'}
                </span>
              </div>
            </div>

            {/* Assigned Companies */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Assigned Companies</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedUser.Companies) && selectedUser.Companies.length > 0 ? (
                  selectedUser.Companies.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
                    >
                      {c.CompanyName}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </div>
            </div>

            {/* Assigned Roles */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Assigned Roles</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedUser.Roles) && selectedUser.Roles.length > 0 ? (
                  selectedUser.Roles.map((r, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
                    >
                      {r.RoleName}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </div>
            </div>

            {/* Assigned Products & Projects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Assigned Products</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedUser.Products) && selectedUser.Products.length > 0 ? (
                    selectedUser.Products.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800"
                      >
                        {p.ProductName}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Projects</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedUser.Projects) && selectedUser.Projects.length > 0 ? (
                    selectedUser.Projects.map((pr, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800"
                      >
                        {pr.ProjectName}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reporting Managers */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Reporting Managers</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedUser.ReportingManagers) && selectedUser.ReportingManagers.length > 0 ? (
                  selectedUser.ReportingManagers.map((rm, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800"
                    >
                      {rm.ReportingManagerName} {rm.CompanyName ? `(${rm.CompanyName})` : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Change Password Modal                                              */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          if (!passwordSubmitting) {
            setIsChangePasswordOpen(false);
            setPasswordErrors({});
            setPasswordForm({ newPassword: '', confirmPassword: '' });
          }
        }}
        title="Change Password"
        size="md"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordErrors({});
                setPasswordForm({ newPassword: '', confirmPassword: '' });
              }}
              disabled={passwordSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePasswordSubmit}
              disabled={passwordSubmitting}
            >
              {passwordSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                  }
                }}
                placeholder="Enter new password"
                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ${
                  passwordErrors.newPassword
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-[11px] text-rose-500 font-medium">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Re-enter new password"
                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:outline-hidden focus:ring-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ${
                  passwordErrors.confirmPassword
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

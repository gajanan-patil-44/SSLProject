// src/pages/UserManagement/ManageUserView.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Building2,
  Package,
  Shield,
  UserCheck,
  ChevronDown,
  FolderGit2
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

export default function ManageUserView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const userName = currentUser?.loginName || currentUser?.EmployeeId || (typeof currentUser?.name === 'string' ? currentUser.name : '') || 'admin';

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
    companyProductId: '',
    projectId: '',
    roleId: '',
    reportingManagerUserId: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialFormData);
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
      console.error('Failed to load users:', err);
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
      console.error('Failed to load base dropdowns:', err);
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
      console.error('Failed to load company dependent dropdowns:', err);
    }
  };

  const loadProductProjects = async (companyProductId) => {
    if (!companyProductId) {
      setProjects([]);
      return;
    }
    try {
      const projRes = await userService.getEditProject(companyProductId);
      setProjects(toOpts(projRes?.data ?? projRes, 'ProjectId', 'ProjectName'));
    } catch (err) {
      console.error('Failed to load projects:', err);
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
      companyProductId: '',
      projectId: '',
      roleId: '',
      designationId: '',
      reportingManagerUserId: ''
    }));
    loadCompanyDependentDropdowns(selectedCompanyId);
    setProjects([]);
  };

  const handleCompanyProductChange = (selectedProductId) => {
    setFormData((prev) => ({
      ...prev,
      companyProductId: selectedProductId,
      projectId: ''
    }));
    loadProductProjects(selectedProductId);
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

    const currentCompanyId = primaryCompany?.CompanyId ? String(primaryCompany.CompanyId) : '';
    const currentCompanyProductId = (primaryProduct?.CompanyProductId || primaryRole?.CompanyProductId) ? String(primaryProduct?.CompanyProductId || primaryRole?.CompanyProductId) : '';
    const currentProjectId = (primaryProject?.ProjectId || primaryRole?.ProjectId) ? String(primaryProject?.ProjectId || primaryRole?.ProjectId) : '';

    setFormData({
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
      companyProductId: currentCompanyProductId,
      projectId: currentProjectId,
      roleId: primaryRole?.RoleId ? String(primaryRole.RoleId) : '',
      reportingManagerUserId: primaryManager?.ReportingManagerUserId ? String(primaryManager.ReportingManagerUserId) : '',
      isActive: true
    });
    setFormErrors({});
    setIsEditOpen(true);

    loadBaseDropdowns();
    if (currentCompanyId) {
      loadCompanyDependentDropdowns(currentCompanyId);
    }
    if (currentCompanyProductId) {
      loadProductProjects(currentCompanyProductId);
    }
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleToggleStatus = (record) => {
    showToast(`User status updated for ${record.FirstName || record.EmployeeId}.`, 'success');
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.firstName.trim()) errs.firstName = 'First Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid Email Address is required';
    }
    if (!formData.loginName.trim()) errs.loginName = 'Login Username is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Update
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedUser) {
        // Edit User via PATCH /verp-service/userEdit/editUserdetails with flagId: 2
        const primaryCompany = (selectedUser.Companies || []).find((c) => c.IsPrimaryCompany) || (selectedUser.Companies || [])[0];
        const primaryProduct = (selectedUser.Products || [])[0];
        const primaryProject = (selectedUser.Projects || [])[0];
        const primaryRole = (selectedUser.Roles || [])[0];
        const primaryManager = (selectedUser.ReportingManagers || [])[0];

        const editPayload = {
          UserId: selectedUser.UserId,
          flagId: 2,
          employeeId: formData.employeeId.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          altPhoneNumber: formData.altPhoneNumber.trim(),
          dateOfBirth: formData.dateOfBirth || null,
          dateOfJoining: formData.dateOfJoining || null,
          genderId: formData.genderId ? Number(formData.genderId) : null,
          maritalStatusId: formData.maritalStatusId ? Number(formData.maritalStatusId) : null,
          designationId: formData.designationId ? Number(formData.designationId) : null,
          email: formData.email.trim(),
          loginName: formData.loginName.trim(),
          updatedByUserName: userName,

          // Associations
          UserCompanyId: primaryCompany?.UserCompanyId || null,
          companyId: formData.companyId ? Number(formData.companyId) : (primaryCompany?.CompanyId || null),
          isPrimaryCompany: true,

          UserProductId: primaryProduct?.UserProductId || null,
          companyProductId: primaryProduct?.CompanyProductId || null,

          UserProjectId: primaryProject?.UserProjectId || null,
          projectId: primaryProject?.ProjectId || null,
          isPrimary: true,

          UserRoleId: primaryRole?.UserRoleId || null,
          roleId: formData.roleId ? Number(formData.roleId) : (primaryRole?.RoleId || null),

          UserReportingManagerId: primaryManager?.UserReportingManagerId || null,
          reportingManagerUserId: formData.reportingManagerUserId ? Number(formData.reportingManagerUserId) : (primaryManager?.ReportingManagerUserId || null),
          reportingManagerCompanyId: formData.companyId ? Number(formData.companyId) : (primaryManager?.CompanyId || null)
        };

        await userService.editUserDetails(editPayload);
        showToast('User details updated successfully!', 'success');
      }

      setIsEditOpen(false);
      await loadUsers();
    } catch (err) {
      console.error('Update user failed:', err);
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
                className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                  c.IsPrimaryCompany
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
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
                className="px-2 py-0.5 text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800"
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
        onToggleStatusClick={handleToggleStatus}
        searchPlaceholder="Search users..."
        onRefresh={loadUsers}
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
                placeholder="e.g. EMP001"
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
                placeholder="e.g. jdoe"
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
                placeholder="e.g. user@vishvin.com"
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
                placeholder="e.g. 9876543210"
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
                placeholder="e.g. 9876543211"
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
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
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
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
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
                  value={formData.companyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer appearance-none pr-8"
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Company Product Selection (Cascades from Company) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Company Product
              </label>
              <div className="relative">
                <select
                  disabled={!formData.companyId}
                  value={formData.companyProductId}
                  onChange={(e) => handleCompanyProductChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">{formData.companyId ? 'Select Company Product' : 'Select Company first'}</option>
                  {companyProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Project Selection (Cascades from Company Product) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Project
              </label>
              <div className="relative">
                <select
                  disabled={!formData.companyProductId}
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyProductId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">{formData.companyProductId ? 'Select Project' : 'Select Product first'}</option>
                  {projects.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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

            {/* Reporting Manager (Cascades from Company) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Reporting Manager
              </label>
              <div className="relative">
                <select
                  disabled={!formData.companyId}
                  value={formData.reportingManagerUserId}
                  onChange={(e) => setFormData({ ...formData, reportingManagerUserId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white appearance-none pr-8 ${!formData.companyId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">{formData.companyId ? 'Select Reporting Manager' : 'Select Company first'}</option>
                  {reportingManagers.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
                <span className="text-xs text-slate-400 uppercase font-semibold block">User ID</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  #{selectedUser.UserId}
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
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Assigned Companies</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedUser.Companies) && selectedUser.Companies.length > 0 ? (
                  selectedUser.Companies.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800"
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
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Assigned Roles</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedUser.Roles) && selectedUser.Roles.length > 0 ? (
                  selectedUser.Roles.map((r, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800"
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
    </div>
  );
}

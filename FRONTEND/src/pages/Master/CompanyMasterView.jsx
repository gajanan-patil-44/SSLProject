// src/pages/Master/CompanyMasterView.jsx
import React, { useState, useEffect } from 'react';
import { useERPStore } from '../../store/useERPStore';
import { companyService } from '../../services/companyService';
import EditCompanyMasterModal from './EditCompanyMasterModal';
import { Modal } from '../../components/ui/Modal';
import {
  PageHeader,
  Card,
  Button,
  StatusBadge,
  PaginationControls
} from '../../components/ui/index';
import {
  Building2,
  Building,
  Tag,
  Mail,
  Phone,
  MapPin,
  Plus,
  Check,
  RotateCcw,
  Edit2,
  AlertCircle,
  FileText,
  CreditCard,
  Trash2
} from 'lucide-react';
import {
  validateCode,
  validateTextOnly,
  validateEmail,
  validatePhone,
  validateGSTIN,
  validatePAN
} from '../../utils/validators';

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

export default function CompanyMasterView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const userName = currentUser?.loginName || currentUser?.name || currentUser?.EmployeeId || '';

  // Helper to extract session username
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

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toggle company master status (flagId: 4)
  const handleToggleStatus = async (company) => {
    const id = company.CompanyMasterId ?? company.companyMasterId ?? company.CompanyId ?? company.companyId ?? company.id;
    const currentlyDisabled = company.IsDisabled === true || company.status === 'Inactive' || company.status === 'Disabled';
    const newIsDisabled = !currentlyDisabled;

    setTogglingId(id);
    try {
      const sessionUserName = getSessionUserName() || userName;
      const payload = {
        flagId: 4,
        IsDisabled: newIsDisabled,
        UpdatedByUserName: sessionUserName,
        CompanyMasterId: Number(id)
      };

      await companyService.toggleCompanyMasterStatus(payload);
      showToast(`Company ${newIsDisabled ? 'disabled' : 'enabled'} successfully!`, 'success');
      await fetchCompanies();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to toggle status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete state for in-UI confirmation modal
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prompt delete dialog
  const handleDeleteCompany = (company) => {
    setCompanyToDelete(company);
  };

  // Confirm delete company master (flagId: 5)
  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    const id = companyToDelete.CompanyMasterId ?? companyToDelete.companyMasterId ?? companyToDelete.CompanyId ?? companyToDelete.companyId ?? companyToDelete.id;
    const name = companyToDelete.CompanyName || companyToDelete.companyName || 'this company';

    setIsDeleting(true);
    try {
      const payload = {
        flagId: 5,
        CompanyMasterId: Number(id)
      };

      await companyService.deleteCompanyMaster(payload);
      showToast(`Company "${name}" deleted successfully!`, 'success');
      setCompanyToDelete(null);
      await fetchCompanies();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete company', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setIsEditModalOpen(true);
  };

  // Form inputs matching required payload
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setFetching(true);
    try {
      // Hit /verp-service/companyMaster/getCompanyMaster with flagId: 1
      const res = await companyService.getCompanyMaster({ flagId: 1 });
      const rawList = res?.data?.data || res?.data || res;
      const list = Array.isArray(rawList) ? rawList : [];
      setCompanies(list);
    } catch (err) {
      showToast('Failed to load companies', 'error');
      setCompanies([]);
    } finally {
      setFetching(false);
    }
  };

  // Validate form fields for Add / Edit
  const validate = () => {
    const errs = {};

    // Company Code: required, alphanumeric, 2-50 chars
    const codeErr = validateCode(companyCode, 'Company Code', true);
    if (codeErr) errs.companyCode = codeErr;

    // Company Name: required, text only, 2-100 chars
    const nameErr = validateTextOnly(companyName, 'Company Name', true, 2, 100);
    if (nameErr) errs.companyName = nameErr;

    // Contact Number: optional, but if entered must be valid 10 digits
    if (contactNumber.trim()) {
      const phoneErr = validatePhone(contactNumber, 'Contact Number', false);
      if (phoneErr) errs.contactNumber = phoneErr;
    }

    // Email ID: optional, but if entered must be valid email format
    if (emailId.trim()) {
      const emailErr = validateEmail(emailId, 'Email ID', false);
      if (emailErr) errs.emailId = emailErr;
    }

    // GST No: optional, but if entered must be valid 15-character GSTIN
    if (gstNo.trim()) {
      const gstErr = validateGSTIN(gstNo, 'GST No', false);
      if (gstErr) errs.gstNo = gstErr;
    }

    // PAN No: optional, but if entered must be valid 10-character PAN
    if (panNo.trim()) {
      const panErr = validatePAN(panNo, 'PAN No', false);
      if (panErr) errs.panNo = panErr;
    }

    // Address: optional, maximum 300 characters
    if (address.trim() && address.trim().length > 300) {
      errs.address = 'Address must not exceed 300 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // SUBMIT handler: Add new company via /verp-service/companyMaster/addCompanyMaster
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const sessionUserName = getSessionUserName() || userName;

      const payload = {
        flagId: 2,
        CompanyName: companyName.trim(),
        CompanyCode: companyCode.trim(),
        ContactNumber: contactNumber.trim(),
        EmailId: emailId.trim(),
        GSTNo: gstNo.trim(),
        PanNo: panNo.trim(),
        Address: address.trim(),
        CreatedByUserName: sessionUserName
      };

      await companyService.addCompanyMaster(payload);
      showToast('Company added successfully!', 'success');
      handleReset();
      await fetchCompanies();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to add company', 'error');
    } finally {
      setLoading(false);
    }
  };

  // EDIT handler: Update selected company
  const handleEdit = async () => {
    if (!selectedId) {
      showToast('Please select a company row from the table below to edit', 'info');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const sessionUserName = getSessionUserName() || userName;

      const payload = {
        flagId: 3,
        CompanyId: Number(selectedId),
        CompanyCode: companyCode.trim(),
        CompanyName: companyName.trim(),
        ContactNumber: contactNumber.trim(),
        PhoneNumber: contactNumber.trim(),
        EmailId: emailId.trim(),
        Email: emailId.trim(),
        GSTNo: gstNo.trim(),
        PanNo: panNo.trim(),
        Address: address.trim(),
        UpdatedByUserName: sessionUserName
      };

      await companyService.updateCompany(payload);
      showToast('Company updated successfully!', 'success');
      handleReset();
      await fetchCompanies();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company', 'error');
    } finally {
      setLoading(false);
    }
  };

  // RESET handler: Clear form
  const handleReset = () => {
    setCompanyCode('');
    setCompanyName('');
    setContactNumber('');
    setEmailId('');
    setGstNo('');
    setPanNo('');
    setAddress('');
    setSelectedId(null);
    setErrors({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header matching portal theme */}
      <PageHeader
        title="Company Master"
        description="Register and manage organizational companies, enterprise profiles, tax identifiers, and corporate contact details."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Companies' }
        ]}
      />

      {/* 2. Top Card: Company Registration Form */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-7">
        <SectionHeader
          icon={Building2}
          iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          title={selectedId ? 'Edit Company Information' : 'Company Information'}
          subtitle="Please provide corporate identification, organization name, tax numbers, and primary contact details."
          badge={
            selectedId && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                Edit Mode
              </span>
            )
          }
        />

        <form onSubmit={selectedId ? handleEdit : handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* Field 1: Company Code */}
            <Field label="Company Code" required error={errors.companyCode}>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. GSL"
                  value={companyCode}
                  maxLength={10}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10).toUpperCase();
                    setCompanyCode(sanitized);
                    if (errors.companyCode) setErrors(prev => ({ ...prev, companyCode: null }));
                  }}
                  className={`${inputCls(errors.companyCode)} pl-9.5 font-mono uppercase`}
                />
              </div>
            </Field>

            {/* Field 2: Company Name */}
            <Field label="Company Name" required error={errors.companyName}>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Global Solutions Ltd"
                  value={companyName}
                  maxLength={100}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                    setCompanyName(sanitized);
                    if (errors.companyName) setErrors(prev => ({ ...prev, companyName: null }));
                  }}
                  className={`${inputCls(errors.companyName)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Field 3: Contact Number */}
            <Field label="Contact Number" error={errors.contactNumber}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={contactNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setContactNumber(digits);
                    if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: null }));
                  }}
                  className={`${inputCls(errors.contactNumber)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Field 4: Email ID */}
            <Field label="Email ID" error={errors.emailId}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="e.g. contact@globalsolutions.com"
                  maxLength={100}
                  value={emailId}
                  onChange={(e) => {
                    setEmailId(e.target.value.slice(0, 100));
                    if (errors.emailId) setErrors(prev => ({ ...prev, emailId: null }));
                  }}
                  className={`${inputCls(errors.emailId)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Field 5: GST No */}
            <Field label="GST No" error={errors.gstNo}>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. 36AAACG1234A1Z5"
                  maxLength={15}
                  value={gstNo}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                    setGstNo(sanitized);
                    if (errors.gstNo) setErrors(prev => ({ ...prev, gstNo: null }));
                  }}
                  className={`${inputCls(errors.gstNo)} pl-9.5 uppercase font-mono`}
                />
              </div>
            </Field>

            {/* Field 6: PAN No */}
            <Field label="PAN No" error={errors.panNo}>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. AAACG1234A"
                  maxLength={10}
                  value={panNo}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
                    setPanNo(sanitized);
                    if (errors.panNo) setErrors(prev => ({ ...prev, panNo: null }));
                  }}
                  className={`${inputCls(errors.panNo)} pl-9.5 uppercase font-mono`}
                />
              </div>
            </Field>

            {/* Field 7: Address (spanning 2 columns) */}
            <div className="sm:col-span-2">
              <Field label="Address" error={errors.address}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Hyderabad, Telangana"
                    maxLength={250}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value.slice(0, 250));
                      if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                    }}
                    className={`${inputCls(errors.address)} pl-9.5 resize-none`}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Form Action Buttons */}
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
                  Update Company
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
                  Add Company
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

      {/* 3. Bottom Card: Registered Companies Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-7">
        <SectionHeader
          icon={Building2}
          iconColor="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
          title="Registered Companies"
          subtitle="Directory of corporate entities configured in the system."
          badge={
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
              {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
            </span>
          }
        />

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">S.No</th>
                <th className="py-3 px-5">Company Code</th>
                <th className="py-3 px-6">Company Name</th>
                <th className="py-3 px-5">Contact Number</th>
                <th className="py-3 px-5">Email ID</th>
                <th className="py-3 px-4">GST No</th>
                <th className="py-3 px-4">PAN No</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fetching ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading company details...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No registered companies found.
                  </td>
                </tr>
              ) : (
                companies.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row, idx) => {
                  const id = row.CompanyMasterId ?? row.companyMasterId ?? row.CompanyId ?? row.id ?? idx;
                  const isSelected = selectedId === id;
                  const isDisabled = row.IsDisabled === true || row.status === 'Inactive' || row.status === 'Disabled';
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs">
                        {rowNumber}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-xs">
                          {row.CompanyCode || row.companyCode || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {row.CompanyName || row.companyName || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                        {row.ContactNumber || row.contactNumber || row.PhoneNumber || row.phone || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                        {row.EmailId || row.emailId || row.Email || row.email || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                        {row.GSTNo || row.gstNo || row.GstNo || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                        {row.PanNo || row.panNo || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={isDisabled ? 'Inactive' : 'Active'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* Toggle Status Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(row)}
                            disabled={togglingId === id}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              !isDisabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            title={!isDisabled ? 'Click to Disable' : 'Click to Enable'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                !isDisabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Company"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCompany(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Delete Company"
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

        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={companies.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {/* Separate Edit Company Master Component */}
      {isEditModalOpen && editingCompany && (
        <EditCompanyMasterModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCompany(null);
          }}
          company={editingCompany}
          onSaveSuccess={fetchCompanies}
        />
      )}

      {/* In-UI Delete Confirmation Modal */}
      {companyToDelete && (
        <Modal
          isOpen={!!companyToDelete}
          onClose={() => {
            if (!isDeleting) setCompanyToDelete(null);
          }}
          title="Delete Company"
          size="sm"
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCompanyToDelete(null)}
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
                {isDeleting ? 'Deleting...' : 'Delete Company'}
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
                Are you sure you want to delete &ldquo;{companyToDelete.CompanyName || companyToDelete.companyName || 'this company'}&rdquo;?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This action cannot be undone. All associated configuration records for this company will be affected.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

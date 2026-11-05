// src/pages/Master/EditCompanyMasterModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/index';
import { useERPStore } from '../../store/useERPStore';
import { companyService } from '../../services/companyService';
import {
  Building2,
  Building,
  Tag,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  AlertCircle,
  FileText,
  CreditCard,
  Loader2
} from 'lucide-react';
import {
  validateCode,
  validateTextOnly,
  validateEmail,
  validatePhone,
  validateGSTIN,
  validatePAN
} from '../../utils/validators';

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

export default function EditCompanyMasterModal({ isOpen, onClose, company, onSaveSuccess }) {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);

  // Form state
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Load selected company into form whenever company changes or modal opens
  useEffect(() => {
    if (company && isOpen) {
      setCompanyCode(company.CompanyCode || company.companyCode || '');
      setCompanyName(company.CompanyName || company.companyName || '');
      setContactNumber(company.ContactNumber || company.contactNumber || company.PhoneNumber || company.phone || '');
      setEmailId(company.EmailId || company.emailId || company.Email || company.email || '');
      setGstNo(company.GSTNo || company.gstNo || company.GstNo || '');
      setPanNo(company.PanNo || company.panNo || '');
      setAddress(company.Address || company.address || '');
      setErrors({});
    }
  }, [company, isOpen]);

  if (!isOpen || !company) return null;

  const companyMasterId = Number(
    company.CompanyMasterId ?? company.companyMasterId ?? company.CompanyId ?? company.companyId ?? company.id
  );

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

  // Validate form fields for Edit
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

  // Handle Save Edits
  const handleSaveEdits = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const sessionUserName = getSessionUserName() || currentUser?.loginName || currentUser?.name || currentUser?.EmployeeId || '';

      const payload = {
        flagId: 3,
        CompanyMasterId: companyMasterId,
        CompanyName: companyName.trim(),
        CompanyCode: companyCode.trim(),
        ContactNumber: contactNumber.trim(),
        EmailId: emailId.trim(),
        GSTNo: gstNo.trim(),
        PanNo: panNo.trim(),
        Address: address.trim(),
        UpdatedByUserName: sessionUserName
      };

      await companyService.updateCompanyMaster(payload);
      showToast('Company master updated successfully!', 'success');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update company master', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Company Master"
      size="lg"
      className="p-1"
    >
      <div className="space-y-6">
        {/* Header Summary Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {company.CompanyName || 'Company Information'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update corporate details, tax numbers, and contact channels.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveEdits} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Code */}
            <Field label="Company Code" required error={errors.companyCode}>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. GSL"
                  value={companyCode}
                  onChange={(e) => {
                    setCompanyCode(e.target.value);
                    if (errors.companyCode) setErrors(prev => ({ ...prev, companyCode: null }));
                  }}
                  className={`${inputCls(errors.companyCode)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Company Name */}
            <Field label="Company Name" required error={errors.companyName}>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Global Solutions Ltd"
                  value={companyName}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setCompanyName(sanitized);
                    if (errors.companyName) setErrors(prev => ({ ...prev, companyName: null }));
                  }}
                  className={`${inputCls(errors.companyName)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Contact Number */}
            <Field label="Contact Number" error={errors.contactNumber}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  maxLength={15}
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: null }));
                  }}
                  className={`${inputCls(errors.contactNumber)} pl-9.5`}
                />
              </div>
            </Field>

            {/* Email ID */}
            <Field label="Email ID" error={errors.emailId}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="e.g. contact@globalsolutions.com"
                  maxLength={150}
                  value={emailId}
                  onChange={(e) => {
                    setEmailId(e.target.value);
                    if (errors.emailId) setErrors(prev => ({ ...prev, emailId: null }));
                  }}
                  className={`${inputCls(errors.emailId)} pl-9.5`}
                />
              </div>
            </Field>

            {/* GST No */}
            <Field label="GST No" error={errors.gstNo}>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. 36AAACG1234A1Z5"
                  maxLength={15}
                  value={gstNo}
                  onChange={(e) => {
                    setGstNo(e.target.value.toUpperCase());
                    if (errors.gstNo) setErrors(prev => ({ ...prev, gstNo: null }));
                  }}
                  className={`${inputCls(errors.gstNo)} pl-9.5 uppercase font-mono`}
                />
              </div>
            </Field>

            {/* PAN No */}
            <Field label="PAN No" error={errors.panNo}>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. AAACG1234A"
                  maxLength={10}
                  value={panNo}
                  onChange={(e) => {
                    setPanNo(e.target.value.toUpperCase());
                    if (errors.panNo) setErrors(prev => ({ ...prev, panNo: null }));
                  }}
                  className={`${inputCls(errors.panNo)} pl-9.5 uppercase font-mono`}
                />
              </div>
            </Field>

            {/* Address */}
            <div className="sm:col-span-2">
              <Field label="Address" error={errors.address}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Hyderabad, Telangana"
                    maxLength={300}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                    }}
                    className={`${inputCls(errors.address)} pl-9.5 resize-none`}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={X}
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={saving ? Loader2 : Check}
              onClick={handleSaveEdits}
              disabled={saving}
              className="px-6 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Edits'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

